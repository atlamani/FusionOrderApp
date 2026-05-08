import { getGooglePlacesApiKey } from "./restaurantService";

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  /** Google's canonicalised version of the address. */
  formattedAddress: string;
};

/**
 * Resolves a free-form address string to coordinates via the Google
 * Geocoding API (https://maps.googleapis.com/maps/api/geocode/json).
 *
 * Returns null when:
 *   - the API key is missing (fallback path: app keeps using the
 *     hardcoded campus location for restaurant discovery),
 *   - the request fails (network, quota, key restrictions, etc.),
 *   - Google can't resolve the address.
 *
 * The Places API key on this project usually has Geocoding enabled in
 * the same Cloud project; if it doesn't, the caller silently falls back
 * to the campus location.
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  const trimmed = address.trim();
  if (trimmed.length < 4) return null;

  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    trimmed,
  )}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.warn(
        `[geocode] failed with ${response.status}: ${errBody.slice(0, 200)}`,
      );
      return null;
    }
    const data = (await response.json()) as {
      status?: string;
      results?: {
        geometry?: { location?: { lat?: number; lng?: number } };
        formatted_address?: string;
      }[];
    };

    if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn(`[geocode] non-OK status: ${data.status}`);
    }

    const result = data.results?.[0];
    const lat = result?.geometry?.location?.lat;
    const lng = result?.geometry?.location?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
      formattedAddress: result?.formatted_address ?? trimmed,
    };
  } catch (error) {
    console.warn("[geocode] request threw", error);
    return null;
  }
}
