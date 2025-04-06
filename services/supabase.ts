import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Supabase client
// These values should be stored in environment variables in a production environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || typeof __DEV__ !== 'undefined' && __DEV__;

// Create a mock query builder that can be chained like the real Supabase client
const createMockQueryBuilder = () => {
  const mockMethods = {
    select: () => mockMethods,
    insert: () => ({ data: null, error: new Error('Development mode - no Supabase connection') }),
    update: () => ({ data: null, error: new Error('Development mode - no Supabase connection') }),
    delete: () => ({ data: null, error: new Error('Development mode - no Supabase connection') }),
    eq: () => mockMethods,
    neq: () => mockMethods,
    gt: () => mockMethods,
    lt: () => mockMethods,
    gte: () => mockMethods,
    lte: () => mockMethods,
    like: () => mockMethods,
    ilike: () => mockMethods,
    is: () => mockMethods,
    in: () => mockMethods,
    contains: () => mockMethods,
    containedBy: () => mockMethods,
    range: () => mockMethods,
    overlaps: () => mockMethods,
    textSearch: () => mockMethods,
    match: () => mockMethods,
    not: () => mockMethods,
    or: () => mockMethods,
    filter: () => mockMethods,
    order: () => mockMethods,
    limit: () => mockMethods,
    offset: () => mockMethods,
    single: () => ({ data: null, error: new Error('Development mode - no Supabase connection') }),
    maybeSingle: () => ({ data: null, error: new Error('Development mode - no Supabase connection') }),
  };
  
  return mockMethods;
};

// Create a single supabase client for interacting with your database
// In development mode with missing credentials, create a dummy client that won't make actual API calls
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : isDevelopment 
    ? {
        from: () => createMockQueryBuilder(),
        rpc: () => ({ data: null, error: new Error('Development mode - no Supabase connection') })
      } as any // Type assertion to avoid complex type definition
    : createClient('https://placeholder-url.supabase.co', 'placeholder-key');

// Function to get device ID (for anonymous identification)
export const getDeviceId = async (): Promise<string> => {
  // In a real app, you would use a more robust method like expo-device or react-native-device-info
  // For simplicity, we'll use a random ID stored in AsyncStorage
  try {
    let deviceId = await AsyncStorage.getItem('deviceId');
    
    if (!deviceId) {
      deviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `device_${Math.random().toString(36).substring(2, 15)}`;
  }
};

/**
 * Generate mock bathroom data for development purposes
 * This function creates a set of mock bathroom codes around Capitol Hill, Seattle
 * @param centerLat Center latitude (defaults to Capitol Hill)
 * @param centerLng Center longitude (defaults to Capitol Hill)
 * @param count Number of mock bathrooms to generate
 * @returns Array of mock bathroom codes
 */
export const getMockBathroomData = (
  centerLat: number = 47.6169, 
  centerLng: number = -122.3201,
  count: number = 10
) => {
  // Common bathroom codes
  const commonCodes = ['1234', '0000', '1111', '2580', '1379', '2468', '5555', '9999', '1470', '2369'];
  
  // Capitol Hill, Seattle specific locations
  const capitolHillLocations = [
    {
      name: 'Elliott Bay Book Company',
      description: 'Behind the cafe counter, ask staff for access',
      lat: 47.6148,
      lng: -122.3204,
      code: '1234',
      voteScore: 8
    },
    {
      name: 'Cal Anderson Park',
      description: 'Public restroom near the tennis courts',
      lat: 47.6178,
      lng: -122.3189,
      code: '0000', // Public restroom, no code
      voteScore: 5
    },
    {
      name: 'Oddfellows Cafe',
      description: 'In the back hallway, code on keypad',
      lat: 47.6152,
      lng: -122.3212,
      code: '2468',
      voteScore: 9
    },
    {
      name: 'Starbucks Reserve Roastery',
      description: 'Downstairs, ask barista for current code',
      lat: 47.6141,
      lng: -122.3256,
      code: '5555',
      voteScore: 7
    },
    {
      name: 'QFC Broadway Market',
      description: 'Near the deli section, employee will give code',
      lat: 47.6201,
      lng: -122.3209,
      code: '1379',
      voteScore: 6
    },
    {
      name: 'Capitol Hill Light Rail Station',
      description: 'Public restroom inside station',
      lat: 47.6192,
      lng: -122.3202,
      code: '0000', // Public restroom, no code
      voteScore: 4
    },
    {
      name: 'Victrola Coffee Roasters',
      description: 'Code on door next to sink',
      lat: 47.6156,
      lng: -122.3233,
      code: '2580',
      voteScore: 8
    },
    {
      name: 'Volunteer Park Cafe',
      description: 'Ask for key at counter',
      lat: 47.6302,
      lng: -122.3150,
      code: '9999',
      voteScore: 7
    },
    {
      name: 'Molly Moon\'s Ice Cream',
      description: 'Bathroom in back, code changes monthly',
      lat: 47.6153,
      lng: -122.3227,
      code: '1470',
      voteScore: 9
    },
    {
      name: 'Dick\'s Drive-In',
      description: 'Outside restroom, token from cashier required',
      lat: 47.6186,
      lng: -122.3236,
      code: '0000', // Token system
      voteScore: 3
    },
    {
      name: 'Seattle Central College',
      description: 'First floor near library, student ID required',
      lat: 47.6160,
      lng: -122.3215,
      code: '2369',
      voteScore: 6
    },
    {
      name: 'Trader Joe\'s',
      description: 'Ask employee for bathroom access',
      lat: 47.6206,
      lng: -122.3214,
      code: '1111',
      voteScore: 5
    },
    {
      name: 'Poquitos',
      description: 'Near bar area, code on receipt',
      lat: 47.6147,
      lng: -122.3196,
      code: '1234',
      voteScore: 7
    },
    {
      name: 'Cafe Vita',
      description: 'Upstairs, ask barista for code',
      lat: 47.6158,
      lng: -122.3242,
      code: '2468',
      voteScore: 8
    },
    {
      name: 'Neumos',
      description: 'Inside venue, ticket required for access',
      lat: 47.6144,
      lng: -122.3199,
      code: '5555',
      voteScore: 4
    }
  ];
  
  // Generate a random subset of locations if count is less than the total available
  let selectedLocations = [...capitolHillLocations];
  if (count < capitolHillLocations.length) {
    // Shuffle array and take the first 'count' elements
    selectedLocations = capitolHillLocations
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  // Map the locations to the BathroomCode format
  return selectedLocations.map((location, index) => {
    // Calculate distance from center point (in meters)
    const distance = Math.sqrt(
      Math.pow((location.lat - centerLat) * 111000, 2) + 
      Math.pow((location.lng - centerLng) * 111000 * Math.cos(centerLat * Math.PI / 180), 2)
    );
    
    // Generate a random ID based on the location name
    const randomId = Math.random().toString(36).substring(2, 8);
    const locationSlug = location.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    return {
      id: `${locationSlug}_${randomId}`,
      code: location.code,
      description: location.description,
      latitude: location.lat,
      longitude: location.lng,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(), // Random date within last 30 days
      vote_score: location.voteScore,
      device_id: `mock_device_${Math.floor(Math.random() * 1000)}`,
      distance: Math.round(distance) // Distance in meters from the center point
    };
  });
};
