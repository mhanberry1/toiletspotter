import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, TouchableOpacity, Linking } from 'react-native';
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
    
    // Check if we're in an iframe, which might cause permission issues
    const isInIframe = () => {
      try {
        return typeof window !== 'undefined' && window.self !== window.top;
      } catch (e) {
        return true;
      }
    };

    if (isInIframe()) {
      console.log('Map is in an iframe, which may restrict geolocation access');
      setError('This map may have limited functionality because it\'s running in an embedded view. For full features, please open the app directly.');
      setLocation(defaultCenter);
      setIsLoading(false);
      return;
    }
    
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setIsLoading(false);
          },
          (err) => {
            // More detailed error logging
            console.error('Error getting location:', JSON.stringify({
              code: err.code,
              message: err.message,
              PERMISSION_DENIED: err.PERMISSION_DENIED,
              POSITION_UNAVAILABLE: err.POSITION_UNAVAILABLE,
              TIMEOUT: err.TIMEOUT
            }));
            
            // Handle permissions policy error specifically
            if (err.message && err.message.includes('permissions policy')) {
              setError('Geolocation has been disabled by security settings. This may happen in development mode or when using certain browsers. We\'re showing a default location instead.');
            } 
            // Handle other errors
            else if (err.code === 1) {
              // Permission denied
              setError(getBrowserSpecificLocationInstructions());
            } else if (err.code === 2) {
              // Position unavailable
              setError('Your location is currently unavailable. Please try again later or check if your device has GPS enabled.');
            } else if (err.code === 3) {
              // Timeout
              setError('Location request timed out. Please check your connection and try again.');
            } else {
              setError('Unable to retrieve your location. Please enable location services in your browser settings.');
            }
            
            // Always set a default location when there's an error
            setLocation(defaultCenter);
            setIsLoading(false);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000,  // Reduced timeout to 10 seconds
            maximumAge: 0    // Always get a fresh position
          }
        );
      } catch (e) {
        console.error('Exception when requesting geolocation:', e);
        setError('An unexpected error occurred when accessing your location. We\'re showing a default location instead.');
        setLocation(defaultCenter);
        setIsLoading(false);
      }
    } else {
      setError('Geolocation is not supported by your browser.');
      setLocation(defaultCenter);
      setIsLoading(false);
    }
  };

  // Function to get browser-specific instructions
  const getBrowserSpecificLocationInstructions = () => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    
    if (userAgent.indexOf('Chrome') > -1) {
      return 'Location permission denied. To enable: Click the lock icon in the address bar → Site settings → Location → Allow.';
    } else if (userAgent.indexOf('Firefox') > -1) {
      return 'Location permission denied. To enable: Click the lock icon in the address bar → Connection secure → More information → Permissions → Access Your Location → Allow.';
    } else if (userAgent.indexOf('Safari') > -1) {
      return 'Location permission denied. To enable: Click Safari in the menu → Preferences → Websites → Location → Allow for this website.';
    } else if (userAgent.indexOf('Edge') > -1) {
      return 'Location permission denied. To enable: Click the lock icon in the address bar → Site permissions → Location → Allow.';
    } else {
      return 'Location permission denied. Please check your browser settings and allow location access for this site.';
    }
  };

  useEffect(() => {
    // Request location when component mounts
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        requestLocation();
      }, 500);
      
      return () => clearTimeout(timer);
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
  
  // Create OpenStreetMap URL with the location and a more prominent marker
  // Using the custom marker icon parameter for better visibility
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01}%2C${mapCenter.lat - 0.01}%2C${mapCenter.lng + 0.01}%2C${mapCenter.lat + 0.01}&amp;layer=mapnik&amp;marker=${mapCenter.lat}%2C${mapCenter.lng}`;

  // Direct link to OpenStreetMap for the location
  const openMapUrl = `https://www.openstreetmap.org/?mlat=${mapCenter.lat}&mlon=${mapCenter.lng}#map=15/${mapCenter.lat}/${mapCenter.lng}`;

  // Create a custom marker element to overlay on the map
  const CustomMarker = () => (
    <div 
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#ff4757',
          border: '3px solid white',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '12px',
          height: '12px',
          backgroundColor: 'white',
          borderRadius: '50%',
          marginTop: '5px',
          fontSize: '10px',
          textAlign: 'center',
          lineHeight: '12px',
          color: '#ff4757',
          fontWeight: 'bold',
        }}
      >
        You
      </div>
    </div>
  );

  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'web' && typeof window !== 'undefined' && (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
          {!error && <CustomMarker />}
        </div>
      )}
      
      {error && (
        <View style={styles.errorOverlay}>
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={requestLocation}
              >
                <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.openMapButton} 
                onPress={() => {
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.open(openMapUrl, '_blank');
                  } else {
                    Linking.openURL(openMapUrl);
                  }
                }}
              >
                <ThemedText style={styles.openMapButtonText}>Open in Maps</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.helpText}>
              We're showing a default location map for now.
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
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#0077ff',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  openMapButton: {
    backgroundColor: '#34c759',
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  openMapButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
