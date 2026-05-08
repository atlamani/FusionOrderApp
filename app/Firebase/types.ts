import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  deliveryNote?: string;
  /**
   * User's collection of saved delivery addresses. The currently active
   * delivery address is `address` above; this list is the picker source.
   */
  savedAddresses?: string[];
  /**
   * Most recent search queries the user has submitted. Capped at 6 entries
   * (most recent first) and persisted so the search screen can hydrate
   * across sessions.
   */
  recentSearches?: string[];
  /**
   * Search queries the user has explicitly bookmarked from the search
   * screen. Capped at 6 entries.
   */
  savedSearches?: string[];
  /**
   * Restaurant IDs the user has hearted on any restaurant card or
   * detail page. Persisted so favorites survive sign-out / reload.
   */
  favoriteRestaurantIds?: string[];
  /**
   * Account settings toggles surfaced on the Account Settings screen
   * (order updates, promo alerts, biometric lock, quick reorder). Stored
   * as a flat object so the existing `merge: true` profile write covers
   * them without a separate document.
   */
  settings?: {
    orderUpdates?: boolean;
    promoAlerts?: boolean;
    biometricLock?: boolean;
    quickReorder?: boolean;
  };
  /**
   * Reward catalog IDs the user has claimed but not yet applied to an
   * order. Each entry is single-use; applying a reward at checkout
   * removes one matching ID from the array.
   */
  availableRewards?: string[];
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
  /**
   * Structured issue report — populated when a customer reports a problem.
   * The `issue` string above remains a short summary used by existing UI
   * banners; this field carries the full state for admin resolution flows.
   */
  issueReport?: OrderIssueReport | null;
  customer?: string;
  driver?: string;
  restaurant?: string;
  placedAt?: string;
  adminStatus?: AdminOrderStatus;
  /**
   * Live driver location samples written by the driver while a delivery
   * is in progress. The customer's order tracking subscribes to these
   * fields and renders a live marker on the map.
   */
  driverLatitude?: number;
  driverLongitude?: number;
  driverLocationUpdatedAt?:
    | Date
    | string
    | number
    | FirebaseFirestoreTypes.FieldValue
    | null;
  /** Reward redeemed against this order, if any. Surfaced on receipts. */
  appliedReward?: {
    id: string;
    name: string;
    value: number;
  };
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

export type OrderIssueType =
  | "wrong_order"
  | "missing_items"
  | "late_delivery"
  | "food_quality"
  | "damaged"
  | "other";

export type OrderIssueStatus = "open" | "in_progress" | "resolved";

export type OrderIssueResolutionAction =
  | "refund"
  | "credit"
  | "redelivery"
  | "no_action";

export type OrderIssueRefundDestination = "card" | "credit";

export interface OrderIssueResolution {
  action: OrderIssueResolutionAction;
  notes: string;
  resolvedAt: FirebaseFirestoreTypes.FieldValue | Date | string | number | null;
  resolvedBy: string;
  /** Where a refund was sent. Only meaningful when `action` is "refund". */
  refundDestination?: OrderIssueRefundDestination;
  /** Dollar amount refunded or credited. Stored as a number for clarity. */
  refundAmount?: number;
  /**
   * Customer-facing one-liner shown on the order help screen. Composed
   * by the resolution service from the action + destination + amount so
   * the wording stays consistent across roles.
   */
  customerMessage?: string;
}

export interface OrderIssueReport {
  type: OrderIssueType;
  description: string;
  reportedAt: FirebaseFirestoreTypes.FieldValue | Date | string | number | null;
  reportedBy: string;
  status: OrderIssueStatus;
  resolution?: OrderIssueResolution | null;
}

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
  driverId?: string | null;
  driverName?: string | null;
  deliveryAddress?: string;
  issue: string | null;
  issueReport?: OrderIssueReport | null;
  /** Pre-formatted item lines like "Margherita x1" for staff queue cards. */
  items?: string[];
}

export interface AdminRestaurantMenuItem {
  id: string;
  name: string;
  price: string;
  available: boolean;
  description?: string;
  category?: string;
  isNew?: boolean;
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
