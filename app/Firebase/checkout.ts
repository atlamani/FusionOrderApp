import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { createOrder } from "./orders";
import { Order } from "./types";

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
    };

    // Create the order in Firestore
    const orderId = await createOrder(order);

    // Here you could add payment processing logic
    // For example, integrating with Stripe, PayPal, etc.
    // Since this is a prototype, we'll just simulate successful payment

    console.log("Order created successfully:", orderId);

    return orderId;
  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
}

/**
 * Process a checkout transaction in demo mode (no Firebase writes)
 * @param orderData - The order data to process
 * @returns Promise resolving to a demo order ID
 */
export async function processCheckoutDemo(orderData: {
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

  // Generate a demo order ID
  const orderId = `DEMO-${Date.now()}`;

  console.log("Demo checkout completed:", orderId);

  return orderId;
}
