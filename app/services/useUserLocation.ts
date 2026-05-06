import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

export type UseUserLocationState = {
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Requests and caches the user's current location.
 * Returns null coordinates if permission is denied or location unavailable.
 * Errors are logged but do not prevent the app from functioning.
 */
export function useUserLocation(): UseUserLocationState {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!isMountedRef.current) return;

      if (status !== "granted") {
        setError("Location permission denied");
        setLatitude(null);
        setLongitude(null);
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!isMountedRef.current) return;

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : "Failed to get location";
      setError(message);
      setLatitude(null);
      setLongitude(null);
    } finally {
      if (!isMountedRef.current) return;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void refetch();
    return () => {
      isMountedRef.current = false;
    };
  }, [refetch]);

  return { latitude, longitude, isLoading, error, refetch };
}
