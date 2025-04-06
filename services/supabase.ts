import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabaseConfig } from '../config/supabase.config';

// Initialize Supabase client with credentials from config file
const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;

// Create a single supabase client for interacting with your database
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (() => {
      console.error('ERROR: Missing Supabase credentials');
      console.error('Please check the config/supabase.config.js file');
      // Return a client that will throw errors for any operation
      return {
        from: () => {
          throw new Error('Supabase credentials missing. Check configuration file.');
        },
        rpc: () => {
          throw new Error('Supabase credentials missing. Check configuration file.');
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
