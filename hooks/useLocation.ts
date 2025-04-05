import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export default function useLocation() {
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        // Request permission to access location
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          if (isMounted) {
            setLocationState(prev => ({
              ...prev,
              error: 'Permission to access location was denied',
              loading: false
            }));
          }
          return;
        }

        // Get the current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });

        if (isMounted) {
          setLocationState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            error: null,
            loading: false
          });
        }
      } catch (error) {
        if (isMounted) {
          setLocationState(prev => ({
            ...prev,
            error: 'Could not get your location',
            loading: false
          }));
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshLocation = async () => {
    setLocationState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      setLocationState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        error: null,
        loading: false
      });
    } catch (error) {
      setLocationState(prev => ({
        ...prev,
        error: 'Could not refresh your location',
        loading: false
      }));
    }
  };

  return {
    ...locationState,
    refreshLocation
  };
}
