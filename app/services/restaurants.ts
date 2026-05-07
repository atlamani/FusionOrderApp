import { allRestaurants, campusLocation, type Restaurant } from "../appData";
import {
  getGooglePlacesApiKey,
  searchNearbyRestaurants,
} from "./restaurantService";

export type RestaurantQuery = {
  query?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  maxResults?: number;
};

export type RestaurantFetchResult = {
  restaurants: Restaurant[];
  source: "google" | "partner";
  error?: string;
};

function resolveLocation(input: RestaurantQuery) {
  if (input.latitude != null && input.longitude != null) {
    return {
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }

  return campusLocation;
}

export async function fetchRestaurants(
  input: RestaurantQuery = {},
): Promise<RestaurantFetchResult> {
  const hasGooglePlacesKey = getGooglePlacesApiKey().length > 0;

  try {
    const restaurants = await searchNearbyRestaurants({
      location: resolveLocation(input),
      radiusMeters: input.radiusMeters ?? campusLocation.radiusMeters,
      keyword: input.query,
      maxResults: input.maxResults,
    });

    return {
      restaurants: restaurants.length > 0 ? restaurants : allRestaurants,
      source: hasGooglePlacesKey && restaurants.length > 0 ? "google" : "partner",
    };
  } catch (error) {
    return {
      restaurants: allRestaurants,
      source: "partner",
      error: error instanceof Error ? error.message : "Unable to load restaurants",
    };
  }
}

export async function fetchRestaurantsSafe(
  input: RestaurantQuery = {},
): Promise<Restaurant[]> {
  const result = await fetchRestaurants(input);
  return result.restaurants;
}
