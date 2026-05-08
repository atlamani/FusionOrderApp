import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { createOrder } from "./orders";
import { Order } from "./types";

const UNASSIGNED_DRIVER_LABEL = "Unassigned";

/**
 * Process a checkout transaction
 * @param orderData - The order data to process
 * @returns Promise resolving to the created order ID
 */
export async function processCheckout(orderData: {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }[];
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  tip: number;
  totalAmount: number;
  deliveryAddress?: string;
  deliveryNote?: string;
  specialInstructions?: string;
  paymentMethodId?: string;
  appliedReward?: {
    id: string;
    name: string;
    value: number;
  };
  deliveryLatitude?: number;
  deliveryLongitude?: number;
}): Promise<string> {
  try {
    // Check if user is authenticated
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error(
        "User must be authenticated to place an order. Please sign in first.",
      );
    }

    // Create the order object
    const order: Omit<Order, "id"> = {
      userId: orderData.userId,
      restaurantId: orderData.restaurantId,
      restaurantName: orderData.restaurantName,
      items: orderData.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: "", // Could be expanded if needed
        price: item.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
      })),
      status: "pending",
      adminStatus: "Pending",
      subtotal: orderData.subtotal,
      taxes: orderData.taxes,
      deliveryFee: orderData.deliveryFee,
      tip: orderData.tip,
      total: orderData.totalAmount,
      totalAmount: orderData.totalAmount,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      deliveryAddress: orderData.deliveryAddress,
      deliveryNote: orderData.deliveryNote,
      specialInstructions: orderData.specialInstructions,
      customer:
        currentUser.displayName ?? currentUser.email ?? "FusionYum Customer",
      restaurant: orderData.restaurantName,
      placedAt: "Just now",
      eta: "18-25 min",
      driver: UNASSIGNED_DRIVER_LABEL,
      driverId: null,
      driverName: null,
      issue: null,
      ...(orderData.appliedReward
        ? { appliedReward: orderData.appliedReward }
        : {}),
      ...(typeof orderData.deliveryLatitude === "number"
        ? { deliveryLatitude: orderData.deliveryLatitude }
        : {}),
      ...(typeof orderData.deliveryLongitude === "number"
        ? { deliveryLongitude: orderData.deliveryLongitude }
        : {}),
    };

    // Create the order in Firestore
    const orderId = await createOrder(order);

    // Payment provider hooks can be added here.

    console.log("Order created successfully:", orderId);

    return orderId;
  } catch (error) {
    const code = (error as { code?: string } | undefined)?.code;
    const message =
      error instanceof Error ? error.message : String(error ?? "unknown");
    if (code === "firestore/permission-denied") {
      console.error(
        "[checkout] Firestore rejected the order create. The most likely " +
          "causes are: (1) firestore.rules has not been deployed " +
          "(npx firebase deploy --only firestore:rules), or (2) the order " +
          "payload includes a field that isn't in the isCustomerOrderCreate " +
          "allowlist. Original error:",
        message,
      );
    } else {
      console.error("Checkout error:", code ?? "(no code)", message);
    }
    throw error;
  }
}

/**
 * Process a guest checkout transaction without Firebase writes.
 * @param orderData - The order data to process
 * @returns Promise resolving to a guest order ID
 */
export async function processGuestCheckout(orderData: {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }[];
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  tip: number;
  totalAmount: number;
  deliveryAddress?: string;
  deliveryNote?: string;
  specialInstructions?: string;
  paymentMethodId?: string;
}): Promise<string> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const orderId = `GUEST-${Date.now()}`;

  console.log("Guest checkout completed:", orderId);

  return orderId;
}
