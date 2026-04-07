import firestore from "@react-native-firebase/firestore";
import { Order } from "./types";

/**
 * Subscribe to real-time updates for a specific order
 * @param orderId - The ID of the order to subscribe to
 * @param callback - Function called whenever the order is updated
 * @returns Unsubscribe function to stop listening to updates
 */
export function subscribeToOrderUpdates(
  orderId: string,
  callback: (order: Order) => void,
): () => void {
  const unsubscribe = firestore()
    .collection("orders")
    .doc(orderId)
    .onSnapshot(
      (snapshot) => {
        if (snapshot.exists()) {
          const orderData = snapshot.data() as Order;
          callback(orderData);
        }
      },
      (error) => {
        console.error("Error subscribing to order updates:", error);
      },
    );

  return unsubscribe;
}

/**
 * Fetch a single order by ID
 * @param orderId - The ID of the order to fetch
 * @returns The order data or null if not found
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const snapshot = await firestore().collection("orders").doc(orderId).get();
    if (snapshot.exists()) {
      return snapshot.data() as Order;
    }
    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

/**
 * Create a new order
 * @param order - The order data to create
 * @returns The ID of the created order
 */
export async function createOrder(order: Omit<Order, "id">): Promise<string> {
  try {
    const docRef = await firestore().collection("orders").add(order);
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Update an existing order
 * @param orderId - The ID of the order to update
 * @param updates - Partial order data to update
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<Order>,
): Promise<void> {
  try {
    await firestore().collection("orders").doc(orderId).update(updates);
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}
