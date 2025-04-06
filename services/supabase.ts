import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Supabase client
// These values should be stored in environment variables in a production environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || typeof __DEV__ !== 'undefined' && __DEV__;

// Create a single supabase client for interacting with your database
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (() => {
      console.error('ERROR: Missing Supabase credentials');
      console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables');
      // Return a client that will throw errors for any operation
      return {
        from: () => {
          throw new Error('Supabase credentials missing. Check environment variables.');
        },
        rpc: () => {
          throw new Error('Supabase credentials missing. Check environment variables.');
        }
      } as any;
    })();

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
