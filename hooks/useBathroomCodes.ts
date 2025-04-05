import { useState, useEffect } from 'react';
import { 
  BathroomCode, 
  getNearbyBathroomCodes, 
  addBathroomCode, 
  voteBathroomCode,
  getDistanceInMeters
} from '../services/bathroomCodeService';

interface UseBathroomCodesProps {
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export default function useBathroomCodes({ 
  latitude, 
  longitude, 
  radius = 1000 
}: UseBathroomCodesProps) {
  const [bathroomCodes, setBathroomCodes] = useState<BathroomCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch nearby bathroom codes when location changes
  useEffect(() => {
    const fetchCodes = async () => {
      if (!latitude || !longitude) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const codes = await getNearbyBathroomCodes(latitude, longitude, radius);
        
        // Add distance to each code for sorting/display
        const codesWithDistance = codes.map(code => ({
          ...code,
          distance: getDistanceInMeters(
            latitude, 
            longitude, 
            code.latitude, 
            code.longitude
          )
        }));
        
        setBathroomCodes(codesWithDistance);
      } catch (err) {
        console.error('Error in useBathroomCodes:', err);
        setError('Failed to fetch bathroom codes');
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, [latitude, longitude, radius]);

  // Add a new bathroom code
  const addCode = async (code: string, description?: string): Promise<boolean> => {
    if (!latitude || !longitude) {
      setError('Location not available');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      const newCode = await addBathroomCode({
        code,
        description,
        latitude,
        longitude
      });
      
      if (newCode) {
        // Add the new code to the list with distance
        setBathroomCodes(prev => [
          ...prev,
          {
            ...newCode,
            distance: 0 // It's at the user's current location
          }
        ]);
        return true;
      } else {
        setError('Failed to add code. It might be a duplicate.');
        return false;
      }
    } catch (err) {
      console.error('Error adding bathroom code:', err);
      setError('Failed to add bathroom code');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Vote on a bathroom code
  const voteCode = async (codeId: string, value: 1 | -1): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await voteBathroomCode(codeId, value);
      
      if (success) {
        // Update the local state with the new vote
        setBathroomCodes(prev => 
          prev.map(code => 
            code.id === codeId 
              ? { ...code, vote_score: (code.vote_score || 0) + value } 
              : code
          )
        );
        return true;
      } else {
        setError('Failed to vote. You might have already voted or this is your submission.');
        return false;
      }
    } catch (err) {
      console.error('Error voting on bathroom code:', err);
      setError('Failed to vote on bathroom code');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sort codes by distance
  const sortedCodes = [...bathroomCodes].sort((a, b) => 
    (a.distance || Infinity) - (b.distance || Infinity)
  );

  return {
    bathroomCodes: sortedCodes,
    loading,
    error,
    addCode,
    voteCode
  };
}
