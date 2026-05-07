import Constants from "expo-constants";
import {
  allRestaurants as fallbackRestaurants,
  campusLocation,
  featuredRestaurants as fallbackFeaturedRestaurants,
  nearbyRestaurants as fallbackNearbyRestaurants,
  type Restaurant,
} from "../appData";

type LatLng = {
  latitude: number;
  longitude: number;
};

export type RestaurantSearchFilters = {
  cuisineId?: string;
  dietaryTag?: string | null;
  price?: string | null;
  minimumRating?: number;
  maxDistanceMiles?: number;
};

export type RestaurantDiscoveryRequest = {
  location?: LatLng;
  radiusMeters?: number;
  keyword?: string;
  maxResults?: number;
};

export type RestaurantDiscoveryResult = {
  restaurants: Restaurant[];
  featured: Restaurant[];
  nearby: Restaurant[];
  source: "google" | "mock";
  usingFallback: boolean;
  message: string;
};

type GoogleLocalizedText = {
  text?: string;
  languageCode?: string;
};

type GooglePhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
};

type GooglePlace = {
  id?: string;
  displayName?: GoogleLocalizedText;
  primaryTypeDisplayName?: GoogleLocalizedText;
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  formattedAddress?: string;
  location?: LatLng;
  businessStatus?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  photos?: GooglePhoto[];
};

const GOOGLE_PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.primaryTypeDisplayName",
  "places.types",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.formattedAddress",
  "places.location",
  "places.businessStatus",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.photos",
].join(",");

function buildPhotoUrl(photo: GooglePhoto | undefined): string | undefined {
  if (!photo?.name) {
    return undefined;
  }
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    return undefined;
  }
  // Place Photos (New) endpoint: returns the actual image when called with skipHttpRedirect=false (default).
  // We request a reasonably sized image; the API caps at 4800px on the long edge.
  const params = new URLSearchParams({
    key: apiKey,
    maxWidthPx: "800",
    maxHeightPx: "600",
  });
  return `https://places.googleapis.com/v1/${photo.name}/media?${params.toString()}`;
}

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "around",
  "delivery",
  "dinner",
  "for",
  "near",
  "nearby",
  "restaurant",
  "restaurants",
  "the",
  "with",
]);

const CUISINE_BY_PLACE_TYPE: Record<string, string> = {
  bakery: "Bakery",
  bar: "Bar food",
  cafe: "Cafe",
  coffee_shop: "Coffee",
  fast_food_restaurant: "Fast casual",
  greek_restaurant: "Greek plates",
  hamburger_restaurant: "Burgers",
  ice_cream_shop: "Dessert",
  indian_restaurant: "Indian bowls",
  italian_restaurant: "Italian",
  japanese_restaurant: "Japanese",
  meal_delivery: "Delivery",
  meal_takeaway: "Takeout",
  mexican_restaurant: "Mexican",
  pizza_restaurant: "Pizza",
  ramen_restaurant: "Ramen",
  restaurant: "Restaurant",
  sandwich_shop: "Sandwiches",
  sushi_restaurant: "Sushi",
  vegan_restaurant: "Vegan",
  vegetarian_restaurant: "Vegetarian",
};

function getExtraConfigValue(key: string) {
  const extra = Constants.expoConfig?.extra as
    | Record<string, string | undefined>
    | undefined;

  return extra?.[key];
}

export function getGooglePlacesApiKey() {
  return (
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    getExtraConfigValue("googlePlacesApiKey") ||
    getExtraConfigValue("googleMapsApiKey") ||
    ""
  ).trim();
}

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s$]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(value: string) {
  const normalized = normalizeValue(value);
  const tokens = normalized
    .split(" ")
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));

  return tokens.length > 0 ? tokens : normalized.split(" ").filter(Boolean);
}

function parseDistanceMiles(distance: string) {
  const parsed = Number.parseFloat(distance.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function getRestaurantSearchText(restaurant: Restaurant) {
  return normalizeValue(
    [
      restaurant.name,
      restaurant.cuisine,
      restaurant.badge,
      restaurant.description,
      restaurant.distance,
      restaurant.eta,
      restaurant.price,
      restaurant.address,
      restaurant.businessStatus,
      ...restaurant.dietaryTags,
      ...restaurant.popularDishes,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function getRestaurantSearchScore(restaurant: Restaurant, query: string) {
  const normalizedQuery = normalizeValue(query);
  const tokens = getSearchTokens(query);

  if (!normalizedQuery) {
    return Number.parseFloat(restaurant.rating) || 1;
  }

  const searchableText = getRestaurantSearchText(restaurant);
  const matchedTokens = tokens.filter((token) => searchableText.includes(token));

  if (matchedTokens.length === 0) {
    return -1;
  }

  let score = matchedTokens.length;

  if (searchableText.includes(normalizedQuery)) {
    score += 4;
  }

  if (normalizeValue(restaurant.name).includes(normalizedQuery)) {
    score += 8;
  }

  if (normalizeValue(restaurant.cuisine).includes(normalizedQuery)) {
    score += 5;
  }

  return score + (Number.parseFloat(restaurant.rating) || 0) / 10;
}

export function searchRestaurantCatalog(
  restaurants: Restaurant[],
  query: string,
  filters: RestaurantSearchFilters = {},
) {
  const cuisineId = filters.cuisineId ?? "all";

  return restaurants
    .map((restaurant, index) => ({
      restaurant,
      index,
      score: getRestaurantSearchScore(restaurant, query),
    }))
    .filter(({ restaurant, score }) => {
      const cuisineSearch = cuisineId.toLowerCase();
      const rating = Number.parseFloat(restaurant.rating) || 0;
      const distance = parseDistanceMiles(restaurant.distance);
      const matchesCuisine =
        cuisineId === "all" ||
        restaurant.cuisine.toLowerCase().includes(cuisineSearch) ||
        restaurant.dietaryTags.some((tag) =>
          tag.toLowerCase().includes(cuisineSearch),
        ) ||
        restaurant.popularDishes.some((dish) =>
          dish.toLowerCase().includes(cuisineSearch),
        );
      const matchesDietary =
        !filters.dietaryTag ||
        restaurant.dietaryTags.includes(filters.dietaryTag);
      const matchesPrice = !filters.price || restaurant.price === filters.price;
      const matchesRating =
        !filters.minimumRating || rating >= filters.minimumRating;
      const matchesDistance =
        !filters.maxDistanceMiles || distance <= filters.maxDistanceMiles;

      return (
        score >= 0 &&
        matchesCuisine &&
        matchesDietary &&
        matchesPrice &&
        matchesRating &&
        matchesDistance
      );
    })
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      const ratingDelta =
        (Number.parseFloat(right.restaurant.rating) || 0) -
        (Number.parseFloat(left.restaurant.rating) || 0);
      if (ratingDelta !== 0) {
        return ratingDelta;
      }

      return (
        parseDistanceMiles(left.restaurant.distance) -
        parseDistanceMiles(right.restaurant.distance) ||
        left.index - right.index
      );
    })
    .map(({ restaurant }) => restaurant);
}

function getFallbackDiscovery(message: string): RestaurantDiscoveryResult {
  return {
    restaurants: fallbackRestaurants,
    featured: fallbackFeaturedRestaurants,
    nearby: fallbackNearbyRestaurants,
    source: "mock",
    usingFallback: true,
    message,
  };
}

function mapPriceLevel(priceLevel?: string) {
  switch (priceLevel) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE":
      return "$";
    case "PRICE_LEVEL_EXPENSIVE":
      return "$$$";
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "$$$";
    case "PRICE_LEVEL_MODERATE":
    default:
      return "$$";
  }
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceMeters(origin: LatLng, destination?: LatLng) {
  if (!destination) {
    return undefined;
  }

  const earthRadiusMeters = 6371000;
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLng = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

function formatDistance(distanceMeters?: number) {
  if (!distanceMeters) {
    return "Nearby";
  }

  const miles = distanceMeters / 1609.344;
  return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
}

function estimateEta(distanceMeters?: number) {
  if (!distanceMeters) {
    return "20-35 min";
  }

  const miles = distanceMeters / 1609.344;
  if (miles <= 0.7) {
    return "15-25 min";
  }
  if (miles <= 1.5) {
    return "20-30 min";
  }

  return "25-40 min";
}

function inferCuisine(place: GooglePlace) {
  const explicitType = place.primaryTypeDisplayName?.text;
  if (explicitType) {
    return explicitType;
  }

  const mappedType = place.types?.find((type) => CUISINE_BY_PLACE_TYPE[type]);
  return mappedType ? CUISINE_BY_PLACE_TYPE[mappedType] : "Restaurant";
}

function inferDietaryTags(place: GooglePlace, cuisine: string) {
  const types = new Set(place.types ?? []);
  const tags = new Set<string>();

  if (types.has("vegan_restaurant") || cuisine.toLowerCase().includes("vegan")) {
    tags.add("Vegan");
  }
  if (
    types.has("vegetarian_restaurant") ||
    cuisine.toLowerCase().includes("vegetarian")
  ) {
    tags.add("Vegetarian Options");
  }
  if (
    types.has("cafe") ||
    types.has("coffee_shop") ||
    cuisine.toLowerCase().includes("cafe")
  ) {
    tags.add("Coffee Pairing");
  }
  if (types.has("bakery") || types.has("ice_cream_shop")) {
    tags.add("Dessert");
  }
  if (types.has("meal_delivery") || types.has("meal_takeaway")) {
    tags.add("Fast pickup");
  }

  return [...tags, "Nearby"].slice(0, 4);
}

function fallbackImage(index: number) {
  return (
    fallbackRestaurants[index % fallbackRestaurants.length]?.image ??
    fallbackRestaurants[0]?.image ??
    0
  );
}

function getPopularDishes(cuisine: string, keyword?: string) {
  const normalizedKeyword = keyword?.trim();
  const primary =
    normalizedKeyword && normalizedKeyword.length > 2
      ? normalizedKeyword
      : cuisine;

  return [
    `${primary} favorite`,
    "Campus combo",
    "Chef pick",
  ];
}

function mapGooglePlaceToRestaurant(
  place: GooglePlace,
  index: number,
  origin: LatLng,
  keyword?: string,
): Restaurant | null {
  const placeId = place.id;
  const name = place.displayName?.text?.trim();
  if (!placeId || !name || !place.location) {
    return null;
  }

  const cuisine = inferCuisine(place);
  const distanceMeters = getDistanceMeters(origin, place.location);
  const rating = place.rating ? place.rating.toFixed(1) : "New";
  const isOperational = place.businessStatus === "OPERATIONAL";
  const photoUri = buildPhotoUrl(place.photos?.[0]);

  return {
    id: `google-${placeId}`,
    source: "google",
    placeId,
    name,
    cuisine,
    rating,
    reviewCount: place.userRatingCount ?? 0,
    eta: estimateEta(distanceMeters),
    price: mapPriceLevel(place.priceLevel),
    badge: isOperational ? "Nearby now" : "Google Places",
    image: photoUri ? { uri: photoUri } : fallbackImage(index),
    distance: formatDistance(distanceMeters),
    address: place.formattedAddress,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    businessStatus: place.businessStatus,
    mapUri: place.googleMapsUri,
    websiteUri: place.websiteUri,
    phone: place.nationalPhoneNumber,
    description:
      place.formattedAddress ??
      "Nearby restaurant sourced from Google Places.",
    dietaryTags: inferDietaryTags(place, cuisine),
    popularDishes: getPopularDishes(cuisine, keyword),
    reviews: [],
  };
}

async function requestGooglePlaces(
  endpoint: "places:searchNearby" | "places:searchText",
  body: Record<string, unknown>,
) {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    throw new Error("Missing Google Places API key");
  }

  const response = await fetch(`https://places.googleapis.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Google Places request failed with ${response.status}: ${errorBody}`,
    );
  }

  return (await response.json()) as { places?: GooglePlace[] };
}

function toLatLng(input: { latitude: number; longitude: number }): LatLng {
  return { latitude: input.latitude, longitude: input.longitude };
}

export async function searchNearbyRestaurants({
  location = campusLocation,
  radiusMeters = campusLocation.radiusMeters,
  keyword,
  maxResults = 12,
}: RestaurantDiscoveryRequest = {}) {
  if (!getGooglePlacesApiKey()) {
    return searchRestaurantCatalog(fallbackRestaurants, keyword ?? "");
  }

  const center = toLatLng(location);

  if (keyword?.trim()) {
    const response = await requestGooglePlaces("places:searchText", {
      textQuery: `${keyword.trim()} restaurants`,
      includedType: "restaurant",
      maxResultCount: maxResults,
      locationBias: {
        circle: {
          center,
          radius: radiusMeters,
        },
      },
    });

    return (response.places ?? [])
      .map((place, index) =>
        mapGooglePlaceToRestaurant(place, index, center, keyword),
      )
      .filter((restaurant): restaurant is Restaurant => Boolean(restaurant));
  }

  const response = await requestGooglePlaces("places:searchNearby", {
    includedTypes: ["restaurant"],
    maxResultCount: maxResults,
    rankPreference: "POPULARITY",
    locationRestriction: {
      circle: {
        center,
        radius: radiusMeters,
      },
    },
  });

  return (response.places ?? [])
    .map((place, index) => mapGooglePlaceToRestaurant(place, index, center))
    .filter((restaurant): restaurant is Restaurant => Boolean(restaurant));
}

export async function loadRestaurantDiscovery(
  request: RestaurantDiscoveryRequest = {},
): Promise<RestaurantDiscoveryResult> {
  if (!getGooglePlacesApiKey()) {
    return getFallbackDiscovery(
      "Using local mock restaurants because no Google Places API key is configured.",
    );
  }

  try {
    const restaurants = await searchNearbyRestaurants(request);

    if (restaurants.length === 0) {
      return getFallbackDiscovery(
        "Google Places returned no restaurants for this location, so local mock data is displayed.",
      );
    }

    return {
      restaurants,
      featured: restaurants.slice(0, 3),
      nearby: restaurants.slice(3),
      source: "google",
      usingFallback: false,
      message: "Restaurant data loaded from Google Places.",
    };
  } catch (error) {
    console.error("Google Places restaurant discovery failed:", error);
    return getFallbackDiscovery(
      "Google Places could not be reached, so local mock data is displayed.",
    );
  }
}
