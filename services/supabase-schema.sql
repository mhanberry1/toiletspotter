-- Enable PostGIS extension for geospatial functionality
CREATE EXTENSION IF NOT EXISTS postgis;

-- Bathroom Codes Table
CREATE TABLE IF NOT EXISTS bathroom_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  device_id TEXT NOT NULL,
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Create a PostGIS geography point for efficient geospatial queries
  CONSTRAINT valid_coordinates CHECK (
    latitude BETWEEN -90 AND 90 AND
    longitude BETWEEN -180 AND 180
  )
);

-- Add a geography column for spatial indexing
ALTER TABLE bathroom_codes ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT);

-- Create a trigger to automatically set the geography point when coordinates are inserted/updated
CREATE OR REPLACE FUNCTION update_location_from_lat_long()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bathroom_code_location
BEFORE INSERT OR UPDATE ON bathroom_codes
FOR EACH ROW EXECUTE FUNCTION update_location_from_lat_long();

-- Create a spatial index for faster geospatial queries
CREATE INDEX IF NOT EXISTS bathroom_codes_location_idx ON bathroom_codes USING GIST (location);

-- Votes Table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bathroom_code_id UUID NOT NULL REFERENCES bathroom_codes(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one vote per device per bathroom code
  CONSTRAINT unique_device_vote UNIQUE (bathroom_code_id, device_id)
);

-- Create index for faster vote lookups
CREATE INDEX IF NOT EXISTS votes_bathroom_code_id_idx ON votes (bathroom_code_id);
CREATE INDEX IF NOT EXISTS votes_device_id_idx ON votes (device_id);

-- Function to get bathroom codes within a specified distance
CREATE OR REPLACE FUNCTION get_bathroom_codes_within_distance(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance_meters INTEGER
)
RETURNS SETOF bathroom_codes
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM bathroom_codes
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    distance_meters
  )
  ORDER BY 
    ST_Distance(
      location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) ASC;
END;
$$;

-- Function to check for duplicate codes within a specified distance
CREATE OR REPLACE FUNCTION check_duplicate_code(
  code_to_check TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance_meters INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  found_duplicate BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM bathroom_codes
    WHERE 
      code = code_to_check AND
      ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        distance_meters
      )
  ) INTO found_duplicate;
  
  RETURN found_duplicate;
END;
$$;

-- Function to update bathroom code vote score
CREATE OR REPLACE FUNCTION update_bathroom_code_vote_score(code_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE bathroom_codes
  SET vote_score = (
    SELECT COALESCE(SUM(vote_value), 0)
    FROM votes
    WHERE bathroom_code_id = code_id
  )
  WHERE id = code_id;
END;
$$;

-- Function to clean up old bad codes (run this as a scheduled job)
CREATE OR REPLACE FUNCTION cleanup_bad_codes(
  min_negative_score INTEGER DEFAULT -3,
  min_age_hours INTEGER DEFAULT 72
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM bathroom_codes
  WHERE 
    vote_score <= min_negative_score AND
    created_at <= NOW() - (min_age_hours * INTERVAL '1 hour')
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$;
