import { useCallback } from "react";
import { useAppState } from "../appState";

type AddToCartItem = {
  id: string;
  name: string;
  price: string;
  restaurantId?: string;
  restaurantName?: string;
};

/**
 * Adds a menu item to the cart. FusionYum's spec calls for a unified
 * multi-restaurant cart, so we deliberately do NOT block items from a second
 * restaurant — the checkout flow groups items by restaurant and the order
 * captures the mix as a single unified order ("FusionYum Mixed Order").
 *
 * The underlying `addMenuItem` no longer short-circuits on cross-restaurant
 * conflicts, so calling this is always additive.
 */
export function useAddToCart() {
  const { addMenuItem } = useAppState();
  return useCallback(
    (item: AddToCartItem) => {
      addMenuItem(item);
    },
    [addMenuItem],
  );
}
