import firestore from "@react-native-firebase/firestore";
import { Order } from "./types";

export type Unsubscribe = () => void;

/**
 * Subscribe to real-time updates for a specific order
 * @param orderId - The ID of the order to subscribe to
 * @param callback - Function called whenever the order is updated
 * @returns Unsubscribe function to stop listening to updates
 */
export function subscribeToOrderUpdates(
  orderId: string,
  callback: (order: Order) => void,
  onError?: (error: unknown) => void,
): () => void {
  const unsubscribe = firestore()
    .collection("orders")
    .doc(orderId)
    .onSnapshot(
      (snapshot) => {
        if (snapshot.exists()) {
          const orderData = snapshot.data() as Order;
          callback({ ...orderData, id: snapshot.id });
        }
      },
      (error) => {
        console.error("Error subscribing to order updates:", error);
        onError?.(error);
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
      const orderData = snapshot.data() as Order;
      return { ...orderData, id: snapshot.id };
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
 * Subscribe to all orders owned by a single customer. Used to populate the
 * Activity / order-history screen across sign-in sessions. Newest orders
 * are emitted first based on createdAt.
 */
export function subscribeToCustomerOrders(
  userId: string,
  onData: (orders: Order[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return firestore()
    .collection("orders")
    .where("userId", "==", userId)
    .onSnapshot(
      (snapshot) => {
        const orders: Order[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Order;
          return { ...data, id: doc.id };
        });
        orders.sort((a, b) => orderCreatedAtMs(b) - orderCreatedAtMs(a));
        onData(orders);
      },
      (error) => {
        console.error("Error subscribing to customer orders:", error);
        onError?.(error);
      },
    );
}

function orderCreatedAtMs(order: Order): number {
  const value = order.createdAt;
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const stamp = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof stamp.toMillis === "function") return stamp.toMillis();
  if (typeof stamp.toDate === "function") return stamp.toDate().getTime();
  return 0;
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
