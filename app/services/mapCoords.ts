import { campusLocation, type Restaurant } from "../appData";
import type { MapCoordinate } from "../../components/MapPreview";

/**
 * Computes a deterministic offset from `campusLocation` for restaurants that
 * don't have real coordinates (partner restaurants without geocoded
 * positions). Different IDs map to different offsets so two restaurants
 * don't sit on top of each other.
 *
 * The offsets stay within ~0.005° (~0.3 mi) so the map still feels local.
 */
function deterministicOffset(seed: string): MapCoordinate {
  // Simple string hash → two pseudo-random numbers in [-1, 1].
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const a = ((hash & 0xffff) / 0xffff) * 2 - 1;
  const b = (((hash >> 16) & 0xffff) / 0xffff) * 2 - 1;
  return {
    latitude: campusLocation.latitude + a * 0.005,
    longitude: campusLocation.longitude + b * 0.005,
  };
}

/**
 * Returns coordinates for a restaurant. Prefers the real lat/lng returned
 * by Google Places; falls back to a stable offset around the campus when
 * the restaurant has no coords.
 */
export function getRestaurantCoordinate(
  restaurant: Pick<Restaurant, "id" | "latitude" | "longitude"> | undefined,
): MapCoordinate {
  if (
    restaurant &&
    typeof restaurant.latitude === "number" &&
    typeof restaurant.longitude === "number"
  ) {
    return {
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    };
  }
  return deterministicOffset(restaurant?.id ?? "default");
}

/**
 * Returns the delivery destination coordinate for map previews on
 * checkout / order tracking / driver route screens.
 *
 * Preferred source — `customer` lat/lng (the geocoded saved address on
 * the user profile). Falls back to a deterministic offset from the
 * pickup coordinate so old orders without geocoded coords still draw a
 * sensible route line.
 */
export function getDeliveryCoordinate(
  pickup?: MapCoordinate | undefined,
  customer?:
    | { latitude?: number; longitude?: number }
    | null
    | undefined,
): MapCoordinate {
  if (
    customer &&
    typeof customer.latitude === "number" &&
    typeof customer.longitude === "number"
  ) {
    return {
      latitude: customer.latitude,
      longitude: customer.longitude,
    };
  }
  if (pickup) {
    // ~0.005 deg ≈ 0.35 mi at NYC latitudes. Offset to the SE so the
    // route line reads naturally on the map.
    return {
      latitude: pickup.latitude - 0.0042,
      longitude: pickup.longitude + 0.0058,
    };
  }
  return {
    latitude: campusLocation.latitude - 0.0028,
    longitude: campusLocation.longitude + 0.0051,
  };
}
