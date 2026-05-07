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
 * Requests permission, gets the current position, and then subscribes to
 * position updates via `watchPositionAsync` so the app reacts to location
 * changes (e.g. emulator location override, real-world movement).
 *
 * Returns null coordinates if permission is denied or location unavailable.
 * Errors are surfaced via `error` but never crash the app.
 */
export function useUserLocation(): UseUserLocationState {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );

  const stopWatch = () => {
    watchSubscriptionRef.current?.remove();
    watchSubscriptionRef.current = null;
  };

  const startWatch = useCallback(async () => {
    // Replace any prior watch so we don't accumulate subscriptions.
    stopWatch();
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          // Emit when the user moves at least ~50m or every 10 seconds.
          // The emulator's location override fires as a discrete event so
          // this still picks up dev-time changes immediately.
          timeInterval: 10_000,
          distanceInterval: 50,
        },
        (location) => {
          if (!isMountedRef.current) return;
          setLatitude(location.coords.latitude);
          setLongitude(location.coords.longitude);
          setError(null);
        },
      );
      watchSubscriptionRef.current = subscription;
    } catch (err) {
      // watch errors are non-fatal — the initial getCurrentPositionAsync
      // result is still valid.
      console.warn("Failed to start location watch:", err);
    }
  }, []);

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
        stopWatch();
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!isMountedRef.current) return;

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setError(null);

      // Start watching for subsequent updates so emulator location
      // changes (and real-world movement) refresh the app.
      void startWatch();
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
  }, [startWatch]);

  useEffect(() => {
    isMountedRef.current = true;
    void refetch();
    return () => {
      isMountedRef.current = false;
      stopWatch();
    };
  }, [refetch]);

  return { latitude, longitude, isLoading, error, refetch };
}
