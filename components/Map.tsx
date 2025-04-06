import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Platform, TouchableOpacity, Linking } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { getNearbyBathroomCodes, addBathroomCode, BathroomCode } from '../services/bathroomCodeService';

interface MapProps {
  style?: any;
}

export const Map: React.FC<MapProps> = ({ style }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyBathrooms, setNearbyBathrooms] = useState<BathroomCode[]>([]);
  const [fetchingBathrooms, setFetchingBathrooms] = useState(false);
  const [isAddingBathroom, setIsAddingBathroom] = useState(false);
  const [addingBathroomStatus, setAddingBathroomStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Use refs instead of state for input fields
  const bathroomCodeRef = useRef<HTMLInputElement>(null);
  const bathroomDescriptionRef = useRef<HTMLInputElement>(null);

  // Default map center (Capitol Hill, Seattle)
  const defaultCenter = {
    lat: 47.6169,
    lng: -122.3201,
  };

  // Fetch nearby bathrooms when location is available
  useEffect(() => {
    const fetchBathrooms = async () => {
      if (!location) return;
      
      try {
        setFetchingBathrooms(true);
        const bathrooms = await getNearbyBathroomCodes(
          location.lat,
          location.lng,
          2000 // 2km radius - increased from 1km for better coverage
        );
        console.log(`Found ${bathrooms.length} bathrooms nearby`);
        setNearbyBathrooms(bathrooms);
      } catch (err) {
        console.error('Error fetching nearby bathrooms:', err);
      } finally {
        setFetchingBathrooms(false);
      }
    };

    fetchBathrooms();
  }, [location]);

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
  // Adding parameters to disable dragging and zooming
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01}%2C${mapCenter.lat - 0.01}%2C${mapCenter.lng + 0.01}%2C${mapCenter.lat + 0.01}&amp;layer=mapnik&amp;marker=${mapCenter.lat}%2C${mapCenter.lng}&amp;attribution=0&amp;embed=1&amp;zoom=15`;

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

  // Create bathroom markers
  const BathroomMarkers = () => {
    // Calculate relative positions based on the map viewport
    // The map shows an area of 0.02 degrees in both lat and lng (from mapUrl)
    const calculatePosition = (bathroom: BathroomCode) => {
      if (!mapCenter) return { top: '50%', left: '50%' };
      
      // Calculate the percentage position within the viewport
      const latRange = 0.02; // Total latitude range shown in the map
      const lngRange = 0.02; // Total longitude range shown in the map
      
      const latMin = mapCenter.lat - latRange/2;
      const lngMin = mapCenter.lng - lngRange/2;
      
      // Calculate percentage position (0-100%)
      const topPercentage = 100 - ((bathroom.latitude - latMin) / latRange * 100);
      const leftPercentage = (bathroom.longitude - lngMin) / lngRange * 100;
      
      return {
        top: `${topPercentage}%`,
        left: `${leftPercentage}%`,
      };
    };

    // Function to determine marker color based on vote score
    const getMarkerColor = (score?: number) => {
      if (score === undefined) return '#34c759'; // Default green
      if (score >= 8) return '#34c759'; // Good - green
      if (score >= 5) return '#ffcc00'; // Medium - yellow
      if (score >= 0) return '#ff9500'; // Low - orange
      return '#ff3b30'; // Negative - red
    };

    return (
      <>
        {nearbyBathrooms.map((bathroom) => {
          const position = calculatePosition(bathroom);
          const markerColor = getMarkerColor(bathroom.vote_score);
          
          return (
            <div
              key={bathroom.id}
              style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -50%)',
                zIndex: 900,
                cursor: 'pointer',
              }}
              title={bathroom.description || `Code: ${bathroom.code}`}
              onClick={() => {
                // Alert with bathroom details when clicked
                if (typeof window !== 'undefined') {
                  window.alert(`Bathroom Code: ${bathroom.code}\nLocation: ${bathroom.description || 'Unknown'}\nRating: ${bathroom.vote_score || 'No ratings yet'}\nDistance: ${bathroom.distance ? Math.round(bathroom.distance) + 'm' : 'Unknown'}`);
                }
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: markerColor,
                  border: '2px solid white',
                  boxShadow: '0 0 8px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                🚻
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  marginTop: '3px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  pointerEvents: 'none',
                }}
              >
                {bathroom.code}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  // Function to handle adding a new bathroom
  const handleAddBathroom = async () => {
    if (!location) {
      alert('Cannot add bathroom: your location is not available');
      return;
    }
    
    const codeValue = bathroomCodeRef.current?.value || '';
    
    if (!codeValue) {
      alert('Please enter a bathroom code');
      return;
    }
    
    try {
      setAddingBathroomStatus('loading');
      
      const newBathroom: BathroomCode = {
        code: codeValue.trim(),
        description: bathroomDescriptionRef.current?.value?.trim() || undefined,
        latitude: location.lat,
        longitude: location.lng,
      };
      
      console.log('Adding new bathroom:', newBathroom);
      const result = await addBathroomCode(newBathroom);
      
      if (result) {
        console.log('Successfully added bathroom:', result);
        setAddingBathroomStatus('success');
        
        // Add the new bathroom to the list and sort by distance
        setNearbyBathrooms(prev => {
          const updated = [...prev, result].sort((a, b) => {
            const distA = a.distance || 0;
            const distB = b.distance || 0;
            return distA - distB;
          });
          return updated;
        });
        
        // Reset form
        if (bathroomCodeRef.current) bathroomCodeRef.current.value = '';
        if (bathroomDescriptionRef.current) bathroomDescriptionRef.current.value = '';
        
        // Show success message and close modal
        alert(`Bathroom code "${result.code}" successfully added!`);
        setTimeout(() => {
          setIsAddingBathroom(false);
          setAddingBathroomStatus('idle');
        }, 1000);
      } else {
        console.error('Failed to add bathroom - null result returned');
        setAddingBathroomStatus('error');
        alert('Failed to add bathroom. It might be a duplicate code in this area.');
      }
    } catch (err) {
      console.error('Error adding bathroom:', err);
      setAddingBathroomStatus('error');
      alert('An error occurred while adding the bathroom. Please try again later.');
    }
  };

  // Component for the add bathroom modal
  const AddBathroomModal = () => {
    if (!isAddingBathroom) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            width: '80%',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          <h3 style={{ margin: '0 0 16px', color: '#333', fontSize: '18px' }}>
            Add New Bathroom
          </h3>
          
          <p style={{ margin: '0 0 16px', color: '#666', fontSize: '14px' }}>
            Adding a bathroom at your current location. Make sure you're standing near the bathroom entrance.
          </p>
          
          {/* Location info */}
          {location && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '8px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>Location:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="bathroomCode" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                color: '#333',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Bathroom Code* (required)
            </label>
            <input
              id="bathroomCode"
              type="text"
              ref={bathroomCodeRef}
              placeholder="Enter the code to access this bathroom"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px',
              }}
              maxLength={10}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="bathroomDescription" 
              style={{ 
                display: 'block', 
                marginBottom: '4px', 
                color: '#333',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Description (optional)
            </label>
            <input
              id="bathroomDescription"
              type="text"
              ref={bathroomDescriptionRef}
              placeholder="e.g., Starbucks on 2nd floor"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '16px',
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => {
                setIsAddingBathroom(false);
                setAddingBathroomStatus('idle');
                // No need to reset values, they'll be reset when the component unmounts
              }}
              style={{
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#f1f1f1',
                color: '#333',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            
            <button
              onClick={handleAddBathroom}
              disabled={addingBathroomStatus === 'loading'}
              style={{
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: addingBathroomStatus === 'success' ? '#34c759' : '#ff4757',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: addingBathroomStatus === 'loading' ? 'not-allowed' : 'pointer',
                opacity: addingBathroomStatus === 'loading' ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {addingBathroomStatus === 'loading' ? (
                <>
                  <div 
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      marginRight: '8px',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Adding...
                </>
              ) : addingBathroomStatus === 'success' ? 'Added!' : 'Add Bathroom'}
            </button>
          </div>
          
          {/* Add a style for the spinner animation */}
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  };

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
              borderRadius: '8px',
              pointerEvents: 'none' // Disable all pointer events to prevent interaction
            }}
            title="OpenStreetMap"
            allowFullScreen
          />
          {/* Overlay div to prevent any interaction with the map */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 800, // Below markers but above map
              background: 'transparent'
            }}
          />
          {!error && <CustomMarker />}
          {!error && <BathroomMarkers />}
          
          {/* Add Bathroom Button */}
          {!error && location && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => setIsAddingBathroom(true)}
                style={{
                  backgroundColor: '#ff4757',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '56px',
                  height: '56px',
                  fontSize: '24px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                title="Add new bathroom at your location"
              >
                +
              </button>
            </div>
          )}
          
          {/* Add Bathroom Modal */}
          <AddBathroomModal />
          
          {/* Bathroom count indicator */}
          {!error && nearbyBathrooms.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 12px',
                borderRadius: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              {nearbyBathrooms.length} {nearbyBathrooms.length === 1 ? 'bathroom' : 'bathrooms'} nearby
            </div>
          )}
          
          {/* Loading indicator for bathrooms */}
          {!error && fetchingBathrooms && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 12px',
                borderRadius: '20px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                fontSize: '14px',
                color: '#333',
              }}
            >
              Finding bathrooms...
            </div>
          )}
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
