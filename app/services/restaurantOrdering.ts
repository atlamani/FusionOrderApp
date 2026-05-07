import type { Restaurant } from "../appData";

/**
 * Returns `true` if a customer can place an order from this restaurant.
 *
 * FusionYum supports two kinds of restaurant records:
 *   1. "Mock" / partner restaurants — pre-onboarded entries in `appData.ts`
 *      that have real menu items, prices, and a corresponding restaurant
 *      staff account (see `tools/staff-claims.example.json`). These are
 *      fully orderable.
 *   2. "Google" restaurants — surfaced via the Google Places API for
 *      discovery. They are NOT partners: there is no restaurant login that
 *      can fulfill orders for them, no real menu data, and no acceptance
 *      flow. Orders against these would be orphaned, so we treat them as
 *      browse-only (similar to a non-partner result on DoorDash).
 *
 * This mirrors the spec: the Level 1 DFD's restaurant entity sends
 * "order preparation and ready-for-pickup status" to Process 5.0 — that
 * implies the restaurant is on the platform. Google-discovered places
 * have no such relationship.
 */
export function isOrderableRestaurant(
  restaurant: Pick<Restaurant, "source" | "id"> | undefined,
): boolean {
  if (!restaurant) return false;
  // Treat anything sourced from Google Places as discovery-only.
  if (restaurant.source === "google") return false;
  if (restaurant.id?.startsWith("google-")) return false;
  return true;
}

/**
 * Short label shown on browse-only restaurant cards.
 */
export const BROWSE_ONLY_BADGE = "View only";

/**
 * Longer copy used inside the restaurant detail screen to explain why the
 * Add-to-cart buttons are disabled.
 */
export const BROWSE_ONLY_EXPLANATION =
  "This restaurant isn't a FusionYum partner yet, so online ordering isn't available. Use the address or phone link to order directly.";
