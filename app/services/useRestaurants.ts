import { useCallback, useEffect, useRef, useState } from "react";
import { allRestaurants, type Restaurant } from "../appData";
import { fetchRestaurants, type RestaurantQuery } from "./restaurants";
import { getGooglePlacesApiKey } from "./restaurantService";

export type UseRestaurantsState = {
  restaurants: Restaurant[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  source: "partner" | "google";
  refetch: () => Promise<void>;
};

const HAS_API_KEY = getGooglePlacesApiKey().length > 0;

/**
 * Returns the restaurant list with loading/error state.
 *
 * - If a Places key is configured, fetches live results from the shared Places service.
 * - Otherwise, returns the bundled partner restaurants immediately and never enters a
 *   loading state, so screens render the same content they always did when the key is absent.
 */
export function useRestaurants(query: RestaurantQuery = {}): UseRestaurantsState {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(allRestaurants);
  const [isLoading, setIsLoading] = useState<boolean>(HAS_API_KEY);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"partner" | "google">("partner");
  const isMountedRef = useRef(true);

  const queryKey = JSON.stringify(query);

  const load = useCallback(
    async (mode: "initial" | "refresh") => {
      if (!HAS_API_KEY) {
        setRestaurants(allRestaurants);
        setSource("partner");
        setIsLoading(false);
        setError(null);
        return;
      }
      if (mode === "refresh") {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      try {
        const result = await fetchRestaurants(query);
        if (!isMountedRef.current) return;
        setRestaurants(result.restaurants);
        setSource(result.source);
        setError(result.error ?? null);
      } catch (err) {
        if (!isMountedRef.current) return;
        setRestaurants(allRestaurants);
        setSource("partner");
        setError(err instanceof Error ? err.message : "Unable to load restaurants");
      } finally {
        if (!isMountedRef.current) return;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    // queryKey changes whenever the input shape changes; safe to use here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryKey],
  );

  useEffect(() => {
    isMountedRef.current = true;
    void load("initial");
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  const refetch = useCallback(async () => {
    await load("refresh");
  }, [load]);

  return { restaurants, isLoading, isRefreshing, error, source, refetch };
}
