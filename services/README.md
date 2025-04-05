# Toilet Spotter Supabase Backend Setup

This document provides instructions for setting up the Supabase backend for the Toilet Spotter application.

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name (e.g., "toilet-spotter")
4. Set a secure database password
5. Choose a region close to your target users
6. Wait for your database to be provisioned

### 2. Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Create a new query
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Run the query to create all tables, functions, and triggers

### 3. Configure Environment Variables

1. Copy `.env.example` to a new file called `.env`
2. In your Supabase dashboard, go to Project Settings > API
3. Copy the "Project URL" and "anon public" key
4. Update the `.env` file with your Supabase URL and anon key:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. Set Up Row Level Security (RLS)

For added security, set up Row Level Security policies in Supabase:

1. Go to Authentication > Policies
2. For the `bathroom_codes` table, create these policies:
   - Allow anonymous SELECT (read) for all rows
   - Allow anonymous INSERT with device_id check
   - Prevent UPDATE and DELETE operations

3. For the `votes` table:
   - Allow anonymous SELECT for all rows
   - Allow anonymous INSERT with device_id check
   - Allow anonymous UPDATE only for the user's own votes
   - Prevent DELETE operations

### 5. Set Up Database Cleanup Job

To automatically remove bad codes:

1. Go to Database > Functions
2. Create a new scheduled function that calls `cleanup_bad_codes()`
3. Set it to run daily (recommended)

## Testing Your Setup

After completing the setup:

1. Make sure your `.env` file is properly configured
2. Run your application locally
3. Test adding a new bathroom code
4. Test retrieving nearby codes
5. Test the voting functionality

## Database Schema Overview

- **bathroom_codes**: Stores bathroom door codes with location data
- **votes**: Tracks votes on bathroom codes with device identification

## API Functions

The backend provides these main functions:

- `getNearbyBathroomCodes`: Get codes near a location
- `addBathroomCode`: Add a new code
- `voteBathroomCode`: Vote on an existing code
- `checkForDuplicateCodes`: Check if a code already exists nearby

## Environment Considerations

The setup includes configurations for:
- Development
- Testing
- Production

Each environment should have its own Supabase project for proper isolation.
