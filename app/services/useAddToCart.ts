import { useCallback } from "react";
import { Alert } from "react-native";
import { useAppState } from "../appState";

type AddToCartItem = {
  id: string;
  name: string;
  price: string;
  restaurantId?: string;
  restaurantName?: string;
};

/**
 * Wraps `addMenuItem` with the cross-restaurant cart guard. If the cart already
 * contains items from a different restaurant, prompts the user to confirm
 * replacing the cart before adding the new item. Otherwise adds silently.
 *
 * Returns a stable function suitable for `onPress` handlers.
 */
export function useAddToCart() {
  const { addMenuItem } = useAppState();

  return useCallback(
    (item: AddToCartItem) => {
      const result = addMenuItem(item);

      if (result.status === "conflict") {
        Alert.alert(
          "Start a new cart?",
          `Your cart already has items from ${
            result.currentRestaurantName ?? "another restaurant"
          }. Adding "${item.name}" will replace those items.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Replace cart",
              style: "destructive",
              onPress: () => {
                addMenuItem(item, { replaceCart: true });
              },
            },
          ],
        );
      }
    },
    [addMenuItem],
  );
}
