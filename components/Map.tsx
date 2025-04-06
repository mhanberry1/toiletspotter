import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface MapProps {
  style?: any;
}

export const Map: React.FC<MapProps> = ({ style }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default map center (San Francisco)
  const defaultCenter = {
    lat: 37.7749,
    lng: -122.4194,
  };

  const requestLocation = () => {
    setIsLoading(true);
    setError(null);
    
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (err) => {
          console.error('Error getting location:', err);
          // More user-friendly error message with instructions
          if (err.code === 1) {
            // Permission denied
            setError('Location permission denied. To enable, check your browser settings and allow location access for this site.');
          } else if (err.code === 2) {
            // Position unavailable
            setError('Your location is currently unavailable. Please try again later.');
          } else if (err.code === 3) {
            // Timeout
            setError('Location request timed out. Please check your connection and try again.');
          } else {
            setError('Unable to retrieve your location. Please enable location services in your browser settings.');
          }
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Request location when component mounts
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      requestLocation();
    } else {
      // For non-web platforms, just set a default location for now
      setLocation(defaultCenter);
      setIsLoading(false);
    }
  }, []);

  if (Platform.OS !== 'web') {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText>Map is only available on web platform</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText>Loading map...</ThemedText>
      </ThemedView>
    );
  }

  // Use the user's location or fall back to the default
  const mapCenter = location || defaultCenter;
  
  // Create OpenStreetMap URL with the location
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01}%2C${mapCenter.lat - 0.01}%2C${mapCenter.lng + 0.01}%2C${mapCenter.lat + 0.01}&amp;layer=mapnik&amp;marker=${mapCenter.lat}%2C${mapCenter.lng}`;

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'web' && typeof window !== 'undefined' && (
        <iframe 
          src={mapUrl}
          style={{ 
            height: '100%', 
            width: '100%', 
            border: 'none',
            borderRadius: '8px'
          }}
          title="OpenStreetMap"
          allowFullScreen
        />
      )}
      
      {error && (
        <View style={styles.errorOverlay}>
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={requestLocation}
            >
              <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.helpText}>
              Meanwhile, we're showing a default location map.
            </ThemedText>
          </ThemedView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  errorOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 999, // Higher z-index to appear above the map
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0077ff',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
