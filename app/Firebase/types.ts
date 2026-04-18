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
  createdAt?: FirebaseFirestoreTypes.FieldValue | Date | string | null;
  lastLogin?: FirebaseFirestoreTypes.FieldValue | Date | string | null;
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
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderTimelineStatus = {
  id: string;
  title: string;
  detail: string;
};

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  status: OrderStatus;
  timeline?: OrderTimelineStatus[];
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  tip: number;
  total: number;
  totalAmount: number;
  createdAt: Date | string | number | FirebaseFirestoreTypes.FieldValue | null;
  updatedAt: Date | string | number | FirebaseFirestoreTypes.FieldValue | null;
  deliveryAddress?: string;
  deliveryNote?: string;
  specialInstructions?: string;
  estimatedDeliveryTime?: number;
  eta?: string;
  driverId?: string | null;
  driverName?: string | null;
  issue?: string | null;
  customer?: string;
  driver?: string;
  restaurant?: string;
  placedAt?: string;
  adminStatus?: AdminOrderStatus;
}

export type AdminOrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready for Driver"
  | "Out for Delivery"
  | "Completed";

export type AdminRestaurantStatus = "Live" | "Needs Approval" | "Busy";

export type AdminFeedbackCategory =
  | "Delivery"
  | "Food Quality"
  | "Packaging"
  | "Support";

export type DriverStatus = "Available" | "Delivering" | "Offline";

export interface AdminOrder {
  id: string;
  customer: string;
  restaurantId: string;
  restaurant: string;
  total: string;
  status: AdminOrderStatus;
  placedAt: string;
  eta: string;
  driver: string;
  issue: string | null;
}

export interface AdminRestaurantMenuItem {
  id: string;
  name: string;
  price: string;
  available: boolean;
  popular?: boolean;
}

export interface AdminRestaurant {
  id: string;
  name: string;
  cuisine: string;
  status: AdminRestaurantStatus;
  avgPrepTime: string;
  manager: string;
  menuItems: AdminRestaurantMenuItem[];
}

export interface AdminFeedback {
  id: string;
  restaurantId: string;
  restaurant: string;
  rating: number;
  category: AdminFeedbackCategory;
  author: string;
  text: string;
  createdAt: string;
  flagged: boolean;
}

export interface DriverProfile {
  id: string;
  name: string;
  vehicle: string;
  zone: string;
  status: DriverStatus;
}

export interface AdminSeedResult {
  ordersSeeded: boolean;
  restaurantsSeeded: boolean;
  feedbackSeeded: boolean;
  driversSeeded: boolean;
}
