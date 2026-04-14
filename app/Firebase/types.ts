import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  deliveryNote?: string;
  rewardsPoints?: number;
  rewardsTier?: string;
  createdAt: FirebaseFirestoreTypes.FieldValue;
  lastLogin: FirebaseFirestoreTypes.FieldValue;
}

export interface Post {
  id?: string;
  title: string;
  content: string;
  authorId: string;
}

export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  tip: number;
  total: number;
  totalAmount: number;
  createdAt: Date | string | number | any;
  updatedAt: Date | string | number | any;
  deliveryAddress?: string;
  deliveryNote?: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: number;
}
