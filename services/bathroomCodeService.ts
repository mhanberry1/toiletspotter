import { supabase, getDeviceId } from './supabase';

export interface BathroomCode {
  id?: string;
  code: string;
  description?: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  vote_score?: number;
  device_id?: string;
  distance?: number; // Distance from user's current location in meters
}

export interface Vote {
  id?: string;
  bathroom_code_id: string;
  device_id: string;
  vote_value: number; // 1 for upvote, -1 for downvote
  created_at?: string;
}

const BATHROOM_CODES_TABLE = 'bathroom_codes';
const VOTES_TABLE = 'votes';
const DUPLICATE_RADIUS_METERS = 50;

/**
 * Get all bathroom codes near a specific location
 * @param latitude User's current latitude
 * @param longitude User's current longitude
 * @param radiusInMeters Search radius in meters (default: 1000m = 1km)
 * @returns Array of bathroom codes
 */
export const getNearbyBathroomCodes = async (
  latitude: number,
  longitude: number,
  radiusInMeters: number = 1000
): Promise<BathroomCode[]> => {
  try {
    // Using PostGIS ST_DWithin to find codes within the radius
    // ST_DWithin(geography(ST_MakePoint(longitude, latitude)), geography(ST_MakePoint($1, $2)), $3)
    const { data, error } = await supabase
      .rpc('get_bathroom_codes_within_distance', {
        lat: latitude,
        lng: longitude,
        distance_meters: radiusInMeters
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting nearby bathroom codes:', error);
    // Return empty array if there's an error
    return [];
  }
};

/**
 * Add a new bathroom code
 * @param bathroomCode The bathroom code to add
 * @returns The added bathroom code or null if failed
 */
export const addBathroomCode = async (bathroomCode: BathroomCode): Promise<BathroomCode | null> => {
  try {
    // Check for duplicates within the specified radius
    const isDuplicate = await checkForDuplicateCodes(
      bathroomCode.code,
      bathroomCode.latitude,
      bathroomCode.longitude
    );

    if (isDuplicate) {
      console.log('Duplicate code found in the area');
      return null;
    }

    // Get device ID for tracking
    const deviceId = await getDeviceId();
    
    const { data, error } = await supabase
      .from(BATHROOM_CODES_TABLE)
      .insert({
        ...bathroomCode,
        device_id: deviceId,
        vote_score: 0 // Initialize with zero votes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding bathroom code:', error);
    return null;
  }
};

/**
 * Check if a code already exists within the specified radius
 * @param code The bathroom code to check
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @returns Boolean indicating if a duplicate was found
 */
export const checkForDuplicateCodes = async (
  code: string,
  latitude: number,
  longitude: number
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_duplicate_code', {
        code_to_check: code,
        lat: latitude,
        lng: longitude,
        distance_meters: DUPLICATE_RADIUS_METERS
      });

    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking for duplicate codes:', error);
    return false;
  }
};

/**
 * Vote on a bathroom code
 * @param bathroomCodeId ID of the bathroom code
 * @param voteValue 1 for upvote, -1 for downvote
 * @returns Boolean indicating success
 */
export const voteBathroomCode = async (
  bathroomCodeId: string,
  voteValue: 1 | -1
): Promise<boolean> => {
  try {
    const deviceId = await getDeviceId();
    
    // Check if this device created the code (prevent self-voting)
    const { data: codeData } = await supabase
      .from(BATHROOM_CODES_TABLE)
      .select('device_id')
      .eq('id', bathroomCodeId)
      .single();
    
    if (codeData?.device_id === deviceId) {
      console.log('Cannot vote on your own submission');
      return false;
    }
    
    // Check if device already voted on this code
    const { data: existingVote } = await supabase
      .from(VOTES_TABLE)
      .select()
      .eq('bathroom_code_id', bathroomCodeId)
      .eq('device_id', deviceId)
      .single();
    
    // If already voted, update the vote
    if (existingVote) {
      // If same vote value, do nothing
      if (existingVote.vote_value === voteValue) {
        return true;
      }
      
      const { error } = await supabase
        .from(VOTES_TABLE)
        .update({ vote_value: voteValue })
        .eq('id', existingVote.id);
      
      if (error) throw error;
    } else {
      // Add new vote
      const { error } = await supabase
        .from(VOTES_TABLE)
        .insert({
          bathroom_code_id: bathroomCodeId,
          device_id: deviceId,
          vote_value: voteValue
        });
      
      if (error) throw error;
    }
    
    // Update the vote score on the bathroom code
    await supabase.rpc('update_bathroom_code_vote_score', {
      code_id: bathroomCodeId
    });
    
    return true;
  } catch (error) {
    console.error('Error voting on bathroom code:', error);
    return false;
  }
};

/**
 * Get the distance between two coordinates in meters
 * Helper function for client-side distance calculation
 */
export const getDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};
