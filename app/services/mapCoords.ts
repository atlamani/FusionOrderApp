import { campusLocation, type Restaurant } from "../appData";
import type { MapCoordinate } from "../../components/MapPreview";

/**
 * Computes a deterministic offset from `campusLocation` for restaurants that
 * don't have real coordinates (e.g. mock data). Different IDs map to
 * different offsets so two mock restaurants don't sit on top of each other.
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
 * the restaurant has no coords (mock data).
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
 * Returns a sensible "delivery destination" coordinate for demo flows.
 *
 * If a `pickup` coordinate is provided, the destination is placed roughly
 * half a mile away from it so the route line on the map represents a
 * believable delivery distance regardless of how far the restaurant is
 * from campus.
 *
 * Without a pickup anchor, falls back to a fixed offset near campus.
 *
 * Once real saved-address geocoding is wired up, this should read from
 * the user's selected delivery address instead.
 */
export function getDeliveryCoordinate(
  pickup?: MapCoordinate | undefined,
): MapCoordinate {
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
