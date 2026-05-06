import { allRestaurants, type Restaurant } from "../appData";

export type RestaurantQuery = {
  /** Free-text search such as "tacos" or "vegan ramen". */
  query?: string;
  /** Latitude for proximity-aware search. Falls back to a configured default. */
  latitude?: number;
  /** Longitude for proximity-aware search. */
  longitude?: number;
  /** Radius in meters. Capped at 50000 by Google. */
  radiusMeters?: number;
  /** Optional Places type (e.g. "restaurant", "cafe", "bakery"). */
  placesType?: string;
};

export type RestaurantFetchResult = {
  restaurants: Restaurant[];
  source: "google-places" | "mock";
  error?: string;
};

const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";
const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";
const FETCH_TIMEOUT_MS = 8000;

type GooglePlace = {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  vicinity?: string;
  formatted_address?: string;
  types?: string[];
  geometry?: {
    location?: { lat: number; lng: number };
  };
  business_status?: string;
};

type GooglePlacesResponse = {
  status: string;
  results?: GooglePlace[];
  error_message?: string;
};

function priceLevelToBadge(level?: number): Restaurant["price"] {
  if (level == null) {
    return "$$";
  }
  if (level <= 1) return "$";
  if (level === 2) return "$$";
  return "$$$";
}

function describeFromTypes(types: string[] | undefined, vicinity: string | undefined) {
  const cleaned = (types ?? [])
    .filter((type) => !["point_of_interest", "establishment", "food"].includes(type))
    .map((type) => type.replace(/_/g, " "));
  const summary = cleaned.length > 0 ? cleaned.slice(0, 2).join(", ") : "Local favorite";
  return vicinity ? `${summary} near ${vicinity}` : summary;
}

function pickCuisineLabel(types: string[] | undefined): string {
  if (!types || types.length === 0) {
    return "Restaurant";
  }
  const cuisineHints = [
    "pizza",
    "sushi",
    "mexican",
    "indian",
    "chinese",
    "thai",
    "japanese",
    "italian",
    "mediterranean",
    "bakery",
    "cafe",
    "vegan",
    "ramen",
    "burger",
  ];
  const match = types.find((type) =>
    cuisineHints.some((hint) => type.toLowerCase().includes(hint)),
  );
  if (match) {
    return match
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return "Restaurant";
}

function distanceMiBetween(
  origin: { lat: number; lng: number } | null,
  target: { lat: number; lng: number } | null,
) {
  if (!origin || !target) {
    return null;
  }
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthMi = 3958.8;
  const dLat = toRad(target.lat - origin.lat);
  const dLng = toRad(target.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origin.lat)) *
      Math.cos(toRad(target.lat)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthMi * c;
}

function normalizeGooglePlace(
  place: GooglePlace,
  origin: { lat: number; lng: number } | null,
): Restaurant {
  const ratingValue =
    typeof place.rating === "number" ? place.rating.toFixed(1) : "4.5";
  const distanceMi = distanceMiBetween(
    origin,
    place.geometry?.location
      ? { lat: place.geometry.location.lat, lng: place.geometry.location.lng }
      : null,
  );

  return {
    id: place.place_id,
    name: place.name,
    cuisine: pickCuisineLabel(place.types),
    rating: ratingValue,
    reviewCount: place.user_ratings_total ?? 0,
    eta: "20-30 min",
    price: priceLevelToBadge(place.price_level),
    badge:
      place.business_status === "OPERATIONAL"
        ? "Open now"
        : place.business_status?.replace(/_/g, " ") ?? "Available",
    image: require("../../assets/images/PizzaPlace.png"),
    distance: distanceMi != null ? `${distanceMi.toFixed(1)} mi` : "—",
    description: describeFromTypes(place.types, place.vicinity),
    dietaryTags: [],
    popularDishes: [],
    reviews: [],
  };
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutHandle);
  }
}

function shouldUseGooglePlaces() {
  return PLACES_API_KEY.length > 0;
}

function buildPlacesUrl(input: RestaurantQuery) {
  const params = new URLSearchParams({
    key: PLACES_API_KEY,
    type: input.placesType ?? "restaurant",
  });
  if (input.query?.trim()) {
    params.set("keyword", input.query.trim());
  }
  if (input.latitude != null && input.longitude != null) {
    params.set("location", `${input.latitude},${input.longitude}`);
    params.set("radius", String(Math.min(input.radiusMeters ?? 5000, 50000)));
    return `${PLACES_BASE_URL}/nearbysearch/json?${params.toString()}`;
  }
  if (input.query?.trim()) {
    params.delete("keyword");
    params.set("query", input.query.trim());
    return `${PLACES_BASE_URL}/textsearch/json?${params.toString()}`;
  }
  // No coordinates and no query: fall back to a broad textsearch.
  params.set("query", "restaurants near me");
  return `${PLACES_BASE_URL}/textsearch/json?${params.toString()}`;
}

export async function fetchRestaurants(
  input: RestaurantQuery = {},
): Promise<RestaurantFetchResult> {
  if (!shouldUseGooglePlaces()) {
    return { restaurants: allRestaurants, source: "mock" };
  }

  try {
    const response = await fetchWithTimeout(buildPlacesUrl(input), FETCH_TIMEOUT_MS);
    if (!response.ok) {
      throw new Error(`Places HTTP ${response.status}`);
    }
    const payload = (await response.json()) as GooglePlacesResponse;
    if (payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
      throw new Error(payload.error_message ?? `Places status ${payload.status}`);
    }
    const origin =
      input.latitude != null && input.longitude != null
        ? { lat: input.latitude, lng: input.longitude }
        : null;
    const restaurants = (payload.results ?? []).map((place) =>
      normalizeGooglePlace(place, origin),
    );
    if (restaurants.length === 0) {
      return { restaurants: allRestaurants, source: "mock" };
    }
    return { restaurants, source: "google-places" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      restaurants: allRestaurants,
      source: "mock",
      error: message,
    };
  }
}

/** Helper for screens that just want a Restaurant[] without the metadata. */
export async function fetchRestaurantsSafe(
  input: RestaurantQuery = {},
): Promise<Restaurant[]> {
  const result = await fetchRestaurants(input);
  return result.restaurants;
}

export const __testables = {
  buildPlacesUrl,
  normalizeGooglePlace,
  priceLevelToBadge,
  distanceMiBetween,
};
