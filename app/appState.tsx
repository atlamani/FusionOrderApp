import firestore from "@react-native-firebase/firestore";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { onAuthStateChanged, signOutUser } from "./Firebase/auth";
import { getUserProfile, saveUserProfile } from "./Firebase/firestore";
import {
  allRestaurants as fallbackAllRestaurants,
  adminFeedback as initialAdminFeedback,
  adminOrders as initialAdminOrders,
  adminRestaurants as initialAdminRestaurants,
  campusLocation,
  checkoutPricing,
  defaultFavoriteRestaurantIds,
  defaultRecentSearches,
  defaultSavedSearches,
  defaultSelectedDriverId,
  defaultSelectedPartnerRestaurantId,
  driverProfiles as initialDriverProfiles,
  menuByRestaurantId,
  orderHistory as initialOrderHistory,
  unassignedDriverLabel,
  type MenuItem,
  type Restaurant,
} from "./appData";
import {
  loadRestaurantDiscovery,
  searchNearbyRestaurants,
  searchRestaurantCatalog,
  type RestaurantDiscoveryResult,
  type RestaurantSearchFilters,
} from "./services/restaurantService";
import { generateCuisineMenu } from "./services/cuisineMenus";

type PaymentCardId = "visa" | "mastercard" | "amex";
type SessionMode =
  | "signed-out"
  | "guest"
  | "member"
  | "admin"
  | "restaurant"
  | "googleAggregator"
  | "driver";
type AdminOrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready for Driver"
  | "Out for Delivery"
  | "Completed";

type AdminOrder = (typeof initialAdminOrders)[number] & {
  issueReport?: import("./Firebase/types").OrderIssueReport | null;
};
type AdminRestaurant = (typeof initialAdminRestaurants)[number];
type AdminRestaurantMenuItem = AdminRestaurant["menuItems"][number];
type AdminFeedback = (typeof initialAdminFeedback)[number];
type DriverProfile = (typeof initialDriverProfiles)[number];
type LiveMenuItem = MenuItem & {
  available: boolean;
  category?: string;
  isNew?: boolean;
};
type LiveMenuSection = {
  id: string;
  title: string;
  items: LiveMenuItem[];
};
type RestaurantMenuItemDraft = {
  name: string;
  price: string;
  description?: string;
  category?: string;
};

type AdminServiceModule = {
  subscribeToAdminOrders?: (
    callback: (orders: AdminOrder[]) => void,
    onError?: (error: unknown) => void,
  ) => () => void;
  subscribeToAdminRestaurants?: (
    callback: (restaurants: AdminRestaurant[]) => void,
    onError?: (error: unknown) => void,
  ) => () => void;
  subscribeToAdminFeedback?: (
    callback: (feedback: AdminFeedback[]) => void,
    onError?: (error: unknown) => void,
  ) => () => void;
  subscribeToDriverProfiles?: (
    callback: (drivers: DriverProfile[]) => void,
    onError?: (error: unknown) => void,
  ) => () => void;
  updateAdminOrderStatus?: (
    orderId: string,
    status: AdminOrderStatus,
  ) => Promise<void>;
  toggleRestaurantMenuItemAvailability?: (
    restaurantId: string,
    itemId: string,
  ) => Promise<void>;
  saveRestaurantMenuItems?: (
    restaurantId: string,
    menuItems: AdminRestaurantMenuItem[],
  ) => Promise<void>;
  updateRestaurantMenuItemPrice?: (
    restaurantId: string,
    itemId: string,
    price: string,
  ) => Promise<void>;
  approveRestaurant?: (restaurantId: string) => Promise<void>;
  updateRestaurantPrepTime?: (
    restaurantId: string,
    prepTime: string,
  ) => Promise<void>;
  claimDriverAssignment?: (orderId: string, driverId: string) => Promise<void>;
  completeDriverDelivery?: (
    orderId: string,
    driverId?: string,
  ) => Promise<void>;
  ensureAdminSeedData?: () => Promise<unknown>;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
};

export type CustomerOrder = {
  id: string;
  restaurant: string;
  placedAt: string;
  eta: string;
  address: string;
  total: string;
  items: string[];
  statuses: {
    id: string;
    title: string;
    detail: string;
  }[];
};

type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  deliveryNote: string;
  rewardsPoints: number;
  rewardsTier: string;
};

type AppSettings = {
  orderUpdates: boolean;
  promoAlerts: boolean;
  biometricLock: boolean;
  quickReorder: boolean;
};

type DiscoveryFilters = {
  cuisineId: string;
  dietaryTag: string | null;
  price: string | null;
  /** Minimum rating (out of 5). 0 means no filter. */
  minRating: number;
  /** Maximum distance in miles. null means no filter. */
  maxDistanceMi: number | null;
};

type StaffClaims = {
  admin?: unknown;
  restaurantId?: unknown;
  driverId?: unknown;
  googleAggregator?: unknown;
};

function isPermissionDenied(error: unknown) {
  return (
    (error as { code?: string } | undefined)?.code ===
    "firestore/permission-denied"
  );
}

function isDevSeedingEnabled() {
  return (
    __DEV__ && process.env.EXPO_PUBLIC_ENABLE_DEV_SEEDING === "true"
  );
}

/**
 * Email accounts that are treated as the Google aggregator without needing
 * a `googleAggregator: true` custom claim. Production deployments should
 * still configure custom claims via `tools/set-staff-claims.js`; this
 * email allowlist is a fallback so the aggregator account can sign in
 * before claims are provisioned.
 */
const GOOGLE_AGGREGATOR_FALLBACK_EMAILS = new Set(["google@fusionyum.com"]);

export function isGoogleAggregatorFallbackEmail(
  email: string | null | undefined,
) {
  if (!email) return false;
  return GOOGLE_AGGREGATOR_FALLBACK_EMAILS.has(email.trim().toLowerCase());
}

function resolveStaffSessionFromClaims(
  claims: StaffClaims,
  email?: string | null,
):
  | { mode: "admin" }
  | { mode: "restaurant"; restaurantId: string }
  | { mode: "googleAggregator" }
  | { mode: "driver"; driverId: string }
  | { mode: "member" } {
  if (claims.admin === true) {
    return { mode: "admin" };
  }

  // The Google aggregator role fulfills orders against any restaurant
  // discovered via the Google Places API. One staff account can see and
  // progress orders for every Google-sourced restaurant. The email
  // allowlist below acts as a fallback when custom claims have not yet
  // been provisioned for the aggregator account.
  if (
    claims.googleAggregator === true ||
    isGoogleAggregatorFallbackEmail(email)
  ) {
    return { mode: "googleAggregator" };
  }

  if (
    typeof claims.restaurantId === "string" &&
    claims.restaurantId.trim().length > 0
  ) {
    return { mode: "restaurant", restaurantId: claims.restaurantId.trim() };
  }

  if (
    typeof claims.driverId === "string" &&
    claims.driverId.trim().length > 0
  ) {
    return { mode: "driver", driverId: claims.driverId.trim() };
  }

  return { mode: "member" };
}

export function getLiveMenuSections(
  restaurantId: string,
  liveRestaurants: typeof initialAdminRestaurants = initialAdminRestaurants,
) {
  const baseSections =
    menuByRestaurantId[restaurantId] ?? menuByRestaurantId["featured-2"];
  const restaurant = liveRestaurants.find((entry) => entry.id === restaurantId);
  const menuItems = new Map(
    restaurant?.menuItems.map((item) => [item.id, item]) ?? [],
  );

  return baseSections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const liveItem = menuItems.get(item.id);

      return {
        ...item,
        price: liveItem?.price ?? item.price,
        available: liveItem?.available ?? item.available,
        popular: liveItem?.popular ?? item.popular,
      };
    }),
  }));
}

function buildCustomerStatuses(status: AdminOrderStatus, driverName?: string) {
  const preparingDetail =
    status === "Pending"
      ? "Restaurant is reviewing your order"
      : "Restaurant is preparing your order";
  const deliveryDetail =
    status === "Out for Delivery"
      ? `${driverName && driverName !== unassignedDriverLabel ? driverName : "Your driver"} is on the way`
      : "Driver assignment is pending";
  const deliveredDetail =
    status === "Completed"
      ? "Your order has been delivered"
      : "Waiting for delivery";

  return [
    {
      id: "confirmed",
      title: "Order Confirmed",
      detail: "Your order has been received",
    },
    {
      id: "preparing",
      title: status === "Pending" ? "Queued at Restaurant" : "Preparing Food",
      detail: preparingDetail,
    },
    {
      id: "delivery",
      title:
        status === "Out for Delivery"
          ? "Out for Delivery"
          : "Driver Assignment",
      detail: deliveryDetail,
    },
    {
      id: "delivered",
      title: "Delivered",
      detail: deliveredDetail,
    },
  ];
}

type AppStateValue = {
  cartItems: CartItem[];
  cartQuantity: number;
  favoriteIds: string[];
  savedCardsExpanded: boolean;
  selectedCardId: PaymentCardId;
  selectedTip: string;
  customTip: string;
  sessionMode: SessionMode;
  profile: UserProfile;
  currentUser: any;
  settings: AppSettings;
  joinedRewards: boolean;
  rewardsEmail: string;
  savedLocationOptions: string[];
  selectedRestaurantId: string;
  selectedPartnerRestaurantId: string;
  selectedDriverId: string;
  searchQuery: string;
  recentSearches: string[];
  savedSearches: string[];
  discoveryFilters: DiscoveryFilters;
  currentOrder: CustomerOrder | null;
  restaurants: Restaurant[];
  featuredRestaurants: Restaurant[];
  nearbyRestaurants: Restaurant[];
  restaurantDataSource: RestaurantDiscoveryResult["source"];
  restaurantDataMessage: string;
  restaurantDataLoading: boolean;
  orderHistory: typeof initialOrderHistory;
  adminOrders: AdminOrder[];
  adminRestaurants: typeof initialAdminRestaurants;
  adminFeedback: typeof initialAdminFeedback;
  driverProfiles: typeof initialDriverProfiles;
  getRestaurantMenuSections: (restaurantId: string) => LiveMenuSection[];
  addToCart: () => void;
  decreaseCart: () => void;
  /**
   * Adds a menu item to the cart. If the cart already holds items from a
   * different restaurant, returns `{ status: "conflict" }` and leaves the
   * cart untouched so the UI can prompt the user. Pass `{ replaceCart: true }`
   * after confirming with the user to clear the existing cart and add.
   */
  addMenuItem: (
    item: {
      id: string;
      name: string;
      price: string;
      restaurantId?: string;
      restaurantName?: string;
    },
    options?: { replaceCart?: boolean },
  ) => { status: "added" | "conflict"; currentRestaurantName?: string };
  decreaseMenuItem: (itemId: string) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
  toggleFavorite: (restaurantId: string) => void;
  toggleSavedCardsExpanded: () => void;
  selectCard: (cardId: PaymentCardId) => void;
  setSelectedTip: (tip: string) => void;
  setCustomTip: (value: string) => void;
  beginGuestSession: () => void;
  loginAsMember: (identifier?: string) => void;
  beginAdminSession: () => void;
  beginRestaurantSession: (restaurantId?: string) => void;
  /**
   * Activates the Google aggregator session. The aggregator uses the same
   * restaurant-facing screens as a partner login but pulls in every order
   * placed against a Google-Places-sourced restaurant.
   */
  beginGoogleAggregatorSession: () => void;
  beginDriverSession: (driverId?: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateAddress: (address: string, deliveryNote?: string) => void;
  /**
   * Adds an address to the user's saved-address list (deduplicated).
   * Persists to Firestore for signed-in users.
   */
  addSavedAddress: (address: string) => Promise<void>;
  /**
   * Removes an address from the user's saved list. If the removed address
   * is the active one, the active address is cleared.
   */
  removeSavedAddress: (address: string) => Promise<void>;
  toggleSetting: (key: keyof AppSettings) => void;
  reorderFromHistory: (orderId: string) => void;
  joinRewards: (email: string) => void;
  setSelectedRestaurant: (restaurantId: string) => void;
  setSelectedPartnerRestaurant: (restaurantId: string) => void;
  setSelectedDriver: (driverId: string) => void;
  setSearchQuery: (value: string) => void;
  submitSearch: (value?: string) => void;
  clearSearch: () => void;
  toggleSavedSearch: (value: string) => void;
  applyDiscoveryFilters: (patch: Partial<DiscoveryFilters>) => void;
  resetDiscoveryFilters: () => void;
  refreshRestaurants: (keyword?: string) => Promise<void>;
  searchRestaurants: (
    keyword: string,
    filters?: RestaurantSearchFilters,
  ) => Promise<Restaurant[]>;
  placeOrder: () => Promise<string | null>;
  updateAdminOrderStatus: (
    orderId: string,
    status: AdminOrderStatus,
  ) => Promise<void>;
  /**
   * Customer reports an issue with one of their orders. Writes a structured
   * report to Firestore and surfaces the legacy `issue` summary so existing
   * admin/restaurant order banners pick it up immediately.
   */
  reportOrderIssue: (params: {
    orderId: string;
    type: import("./Firebase/types").OrderIssueType;
    description: string;
  }) => Promise<void>;
  /**
   * Admin resolves a reported order issue with one of the supported actions.
   * Clears the legacy `issue` summary and records who resolved it.
   */
  resolveOrderIssue: (params: {
    orderId: string;
    action: import("./Firebase/types").OrderIssueResolutionAction;
    notes: string;
  }) => Promise<void>;
  /** Admin cancels an order outright. */
  cancelAdminOrder: (orderId: string, reason: string) => Promise<void>;
  toggleAdminMenuItemAvailability: (
    restaurantId: string,
    itemId: string,
  ) => Promise<void>;
  addRestaurantMenuItem: (
    restaurantId: string,
    item: RestaurantMenuItemDraft,
  ) => Promise<void>;
  removeRestaurantMenuItem: (
    restaurantId: string,
    itemId: string,
  ) => Promise<void>;
  toggleRestaurantMenuItemFeatured: (
    restaurantId: string,
    itemId: string,
  ) => Promise<void>;
  updateAdminMenuItemPrice: (
    restaurantId: string,
    itemId: string,
    price: string,
  ) => Promise<void>;
  approveRestaurant: (restaurantId: string) => Promise<void>;
  updateRestaurantPrepTime: (
    restaurantId: string,
    prepTime: string,
  ) => Promise<void>;
  claimDriverAssignment: (orderId: string) => Promise<void>;
  completeDriverDelivery: (orderId: string) => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

const defaultProfile: UserProfile = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  deliveryNote: "",
  rewardsPoints: 0,
  rewardsTier: "Bronze Member",
};

const defaultSettings: AppSettings = {
  orderUpdates: true,
  promoAlerts: true,
  biometricLock: false,
  quickReorder: true,
};

const defaultFilters: DiscoveryFilters = {
  cuisineId: "all",
  dietaryTag: null,
  price: null,
  minRating: 0,
  maxDistanceMi: null,
};

function parsePrice(value: string) {
  return parseCurrencyValue(value);
}

function parseCurrencyValue(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function findMenuItemByName(name: string) {
  const normalizedName = name.toLowerCase();

  return Object.values(menuByRestaurantId)
    .flatMap((sections) => sections.flatMap((section) => section.items))
    .find((item) => item.name.toLowerCase() === normalizedName);
}

function normalizeMenuPrice(value: string) {
  const amount = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
}

function slugifyMenuId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 34);
}

function getStaticMenuSections(restaurantId: string) {
  return menuByRestaurantId[restaurantId] ?? [];
}

function getStaticMenuItem(restaurantId: string, itemId: string) {
  for (const section of getStaticMenuSections(restaurantId)) {
    const item = section.items.find((entry) => entry.id === itemId);
    if (item) {
      return { item, sectionTitle: section.title };
    }
  }

  return null;
}

function getDiscoveryMenuPrice(priceTier: string, index: number) {
  const basePrice =
    priceTier === "$"
      ? 8
      : priceTier === "$$$" || priceTier === "$$$$"
        ? 18
        : 13;

  return `$${(basePrice + index * 1.5 + 0.95).toFixed(2)}`;
}

function buildDiscoveryMenuSections(
  restaurantId: string,
  restaurants: Restaurant[],
): LiveMenuSection[] {
  const restaurant = restaurants.find((entry) => entry.id === restaurantId);
  if (!restaurant) {
    return [];
  }

  // Google-sourced restaurants don't ship with menus. Generate a cuisine-aware
  // template so a Mexican spot gets tacos, a pizzeria gets pizzas, etc.
  if (restaurant.source === "google") {
    return generateCuisineMenu(restaurantId, restaurant.cuisine).map(
      (section) => ({
        id: section.id,
        title: section.title,
        items: section.items.map((item) => ({
          ...item,
          available: item.available ?? true,
          category: section.title,
        })),
      }),
    );
  }

  const dishes =
    restaurant.popularDishes.length > 0
      ? restaurant.popularDishes
      : [`${restaurant.cuisine} favorite`, "Campus combo", "Chef pick"];

  return [
    {
      id: `${restaurantId}-discovery-picks`,
      title: "Popular picks",
      items: dishes.map((dish, index) => ({
        id: `${restaurantId}-discovery-${slugifyMenuId(dish) || index}`,
        name: dish,
        description: `A popular pick from ${restaurant.name}.`,
        price: getDiscoveryMenuPrice(restaurant.price, index),
        available: true,
        category: "Popular picks",
        popular: index === 0,
      })),
    },
  ];
}

function toAdminMenuItem(
  restaurantId: string,
  itemId: string,
  patch: Partial<AdminRestaurantMenuItem> = {},
): AdminRestaurantMenuItem {
  const staticEntry = getStaticMenuItem(restaurantId, itemId);
  const fallbackName = patch.name ?? staticEntry?.item.name ?? "Menu item";

  return {
    id: patch.id ?? itemId,
    name: fallbackName,
    price: normalizeMenuPrice(patch.price ?? staticEntry?.item.price ?? "$0.00"),
    available: patch.available ?? staticEntry?.item.available ?? true,
    description: patch.description ?? staticEntry?.item.description ?? "",
    category: patch.category ?? staticEntry?.sectionTitle ?? "Menu",
    isNew: patch.isNew ?? false,
    popular: patch.popular ?? staticEntry?.item.popular,
  };
}

function buildLiveMenuSections(
  restaurantId: string,
  adminRestaurants: AdminRestaurant[],
): LiveMenuSection[] {
  const restaurant = adminRestaurants.find((entry) => entry.id === restaurantId);
  const editableItems = restaurant?.menuItems ?? [];
  const editableById = new Map(editableItems.map((item) => [item.id, item]));
  const includedIds = new Set<string>();
  const staticSections = getStaticMenuSections(restaurantId);
  const sections: LiveMenuSection[] = staticSections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => {
      includedIds.add(item.id);
      const editableItem = editableById.get(item.id);

      return {
        ...item,
        name: editableItem?.name ?? item.name,
        price: editableItem?.price ?? item.price,
        description: editableItem?.description?.trim()
          ? editableItem.description
          : item.description,
        available: editableItem?.available ?? item.available ?? true,
        category: editableItem?.category ?? section.title,
        isNew: editableItem?.isNew ?? false,
        popular: editableItem?.popular ?? item.popular,
      };
    }),
  }));

  const customItems = editableItems
    .filter((item) => !includedIds.has(item.id))
    .map<LiveMenuItem>((item) => ({
      id: item.id,
      name: item.name,
      description:
        item.description?.trim() ||
        `Freshly added by ${restaurant?.name ?? "this restaurant"}.`,
      price: item.price,
      available: item.available,
      category: item.category?.trim() || "New & featured",
      isNew: item.isNew ?? true,
      popular: item.popular,
    }));

  const customByCategory = customItems.reduce<Record<string, LiveMenuItem[]>>(
    (groups, item) => {
      const category = item.category?.trim() || "New & featured";
      groups[category] = [...(groups[category] ?? []), item];
      return groups;
    },
    {},
  );

  Object.entries(customByCategory).forEach(([category, items]) => {
    sections.unshift({
      id: `${restaurantId}-${slugifyMenuId(category) || "new"}`,
      title: category,
      items,
    });
  });

  return sections.filter((section) => section.items.length > 0);
}

function formatPlacedAt() {
  return `Today, ${new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function resolveQuantity(value: number | CartItem[]) {
  return Array.isArray(value)
    ? value.reduce((sum, item) => sum + item.quantity, 0)
    : value;
}

function resolveProfileName(
  displayName: string | null | undefined,
  email: string | null | undefined,
  fallback: string,
) {
  const trimmedName = displayName?.trim();
  if (trimmedName && trimmedName.toLowerCase() !== "user") {
    return trimmedName;
  }

  const localPart = email?.split("@")[0]?.trim();
  if (localPart) {
    return localPart
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return fallback;
}

function getStatusEta(status: AdminOrderStatus) {
  switch (status) {
    case "Pending":
      return "18 min";
    case "Preparing":
      return "14 min";
    case "Ready for Driver":
      return "9 min";
    case "Out for Delivery":
      return "6 min";
    case "Completed":
      return "Delivered";
    default:
      return "18 min";
  }
}

function syncCurrentOrderFromAdminOrder(
  current: CustomerOrder | null,
  order: AdminOrder,
): CustomerOrder | null {
  if (!current || current.id !== order.id) {
    return current;
  }

  return {
    ...current,
    eta: order.eta === "Delivered" ? "Delivered" : `Estimated: ${order.eta}`,
    statuses: buildCustomerStatuses(order.status, order.driver),
  };
}

function syncOrderHistoryDelivery(
  current: typeof initialOrderHistory,
  orderId: string,
  driverName?: string,
) {
  const deliveredAt = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return current.map((order) =>
    order.id === orderId
      ? {
          ...order,
          date: driverName
            ? `Today at ${deliveredAt} | Delivered by ${driverName}`
            : `Today at ${deliveredAt} | Delivered`,
          status: "Delivered" as const,
          accent: "#016630",
        }
      : order,
  );
}

function createLocalAdminFallback(): AdminServiceModule {
  return {
    subscribeToAdminOrders: (callback: (orders: AdminOrder[]) => void) => {
      callback(initialAdminOrders);
      return () => undefined;
    },
    subscribeToAdminRestaurants: (
      callback: (restaurants: AdminRestaurant[]) => void,
    ) => {
      callback(initialAdminRestaurants);
      return () => undefined;
    },
    subscribeToAdminFeedback: (
      callback: (feedback: AdminFeedback[]) => void,
    ) => {
      callback(initialAdminFeedback);
      return () => undefined;
    },
    subscribeToDriverProfiles: (
      callback: (drivers: DriverProfile[]) => void,
    ) => {
      callback(initialDriverProfiles);
      return () => undefined;
    },
    updateAdminOrderStatus: async () => undefined,
    toggleRestaurantMenuItemAvailability: async () => undefined,
    saveRestaurantMenuItems: async () => undefined,
    updateRestaurantMenuItemPrice: async () => undefined,
    approveRestaurant: async () => undefined,
    updateRestaurantPrepTime: async () => undefined,
    claimDriverAssignment: async () => undefined,
    completeDriverDelivery: async () => undefined,
    ensureAdminSeedData: async () => undefined,
  };
}

export function AppStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultRestaurant =
    fallbackAllRestaurants[1] ?? fallbackAllRestaurants[0];
  const [restaurantDiscovery, setRestaurantDiscovery] =
    useState<RestaurantDiscoveryResult>({
      restaurants: fallbackAllRestaurants,
      featured: fallbackAllRestaurants.slice(0, 3),
      nearby: fallbackAllRestaurants.slice(3),
      source: "partner",
      usingFallback: true,
      message: "Showing partner restaurants while nearby results load.",
    });
  const [restaurantDataLoading, setRestaurantDataLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    defaultFavoriteRestaurantIds,
  );
  const [savedCardsExpanded, setSavedCardsExpanded] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<PaymentCardId>("visa");
  const [selectedTip, setSelectedTip] = useState(checkoutPricing.defaultTip);
  const [customTip, setCustomTip] = useState(
    checkoutPricing.customTipDefault,
  );
  const [sessionMode, setSessionMode] = useState<SessionMode>("signed-out");
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [joinedRewards, setJoinedRewards] = useState(false);
  const [rewardsEmail, setRewardsEmail] = useState(defaultProfile.email);
  const [savedLocationOptions, setSavedLocationOptions] = useState<string[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    defaultRestaurant?.id ?? "",
  );
  const [selectedPartnerRestaurantId, setSelectedPartnerRestaurantId] =
    useState(defaultSelectedPartnerRestaurantId);
  const [selectedDriverId, setSelectedDriverId] = useState(
    defaultSelectedDriverId,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] =
    useState<string[]>(defaultRecentSearches);
  const [savedSearches, setSavedSearches] =
    useState<string[]>(defaultSavedSearches);
  const [discoveryFilters, setDiscoveryFilters] =
    useState<DiscoveryFilters>(defaultFilters);
  const [currentOrder, setCurrentOrder] = useState<CustomerOrder | null>(null);
  const [orderHistory, setOrderHistory] = useState(initialOrderHistory);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>(initialAdminOrders);
  const [adminRestaurants, setAdminRestaurants] = useState(
    initialAdminRestaurants,
  );
  const [adminFeedback, setAdminFeedback] = useState(initialAdminFeedback);
  const [driverProfiles, setDriverProfiles] = useState(initialDriverProfiles);
  const adminServiceRef = useRef<AdminServiceModule | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAdminService = async () => {
      try {
        const module =
          (await import("./Firebase/admin")) as unknown as AdminServiceModule;
        if (isMounted) {
          adminServiceRef.current = module;
          if (isDevSeedingEnabled()) {
            try {
              await module.ensureAdminSeedData?.();
            } catch (error) {
              console.error("Error seeding admin collections:", error);
            }
          }
        }
      } catch (error) {
        console.error(
          "Admin Firebase service unavailable, using local fallback:",
          error,
        );
        if (isMounted) {
          adminServiceRef.current = createLocalAdminFallback();
        }
      }
    };

    loadAdminService();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDiscovery = async () => {
      setRestaurantDataLoading(true);
      const discovery = await loadRestaurantDiscovery({
        location: campusLocation,
        radiusMeters: campusLocation.radiusMeters,
      });

      if (cancelled) {
        return;
      }

      setRestaurantDiscovery(discovery);
      setSelectedRestaurantId((current) =>
        discovery.restaurants.some((restaurant) => restaurant.id === current)
          ? current
          : (discovery.restaurants[0]?.id ?? current),
      );
      setRestaurantDataLoading(false);
    };

    void loadDiscovery();

    return () => {
      cancelled = true;
    };
  }, [
    currentUser?.uid,
    selectedDriverId,
    selectedPartnerRestaurantId,
    sessionMode,
  ]);

  useEffect(() => {
    let cancelled = false;
    let orderUnsubscribe: (() => void) | undefined;
    let restaurantUnsubscribe: (() => void) | undefined;
    let feedbackUnsubscribe: (() => void) | undefined;
    let driverUnsubscribe: (() => void) | undefined;

    const setupSubscriptions = async () => {
      if (!adminServiceRef.current) {
        try {
          const module =
            (await import("./Firebase/admin")) as unknown as AdminServiceModule;
          adminServiceRef.current = module;
        } catch (error) {
          console.error("Unable to initialize admin subscriptions:", error);
          adminServiceRef.current = createLocalAdminFallback();
        }
      }

      const service = adminServiceRef.current ?? createLocalAdminFallback();

      orderUnsubscribe = service.subscribeToAdminOrders?.(
        (orders) => {
          if (!cancelled) {
            setAdminOrders(orders.length > 0 ? orders : initialAdminOrders);
          }
        },
        (error) => {
          console.error("Admin orders subscription error:", error);
          if (!cancelled) {
            setAdminOrders(initialAdminOrders);
          }
        },
      );

      restaurantUnsubscribe = service.subscribeToAdminRestaurants?.(
        (restaurants) => {
          if (!cancelled) {
            setAdminRestaurants(
              restaurants.length > 0 ? restaurants : initialAdminRestaurants,
            );
          }
        },
        (error) => {
          console.error("Admin restaurants subscription error:", error);
          if (!cancelled) {
            setAdminRestaurants(initialAdminRestaurants);
          }
        },
      );

      feedbackUnsubscribe = service.subscribeToAdminFeedback?.(
        (feedback) => {
          if (!cancelled) {
            setAdminFeedback(
              feedback.length > 0 ? feedback : initialAdminFeedback,
            );
          }
        },
        (error) => {
          console.error("Admin feedback subscription error:", error);
          if (!cancelled) {
            setAdminFeedback(initialAdminFeedback);
          }
        },
      );

      driverUnsubscribe = service.subscribeToDriverProfiles?.(
        (drivers) => {
          if (!cancelled) {
            setDriverProfiles(
              drivers.length > 0 ? drivers : initialDriverProfiles,
            );
          }
        },
        (error) => {
          console.error("Driver subscription error:", error);
          if (!cancelled) {
            setDriverProfiles(initialDriverProfiles);
          }
        },
      );
    };

    setupSubscriptions();

    return () => {
      cancelled = true;
      orderUnsubscribe?.();
      restaurantUnsubscribe?.();
      feedbackUnsubscribe?.();
      driverUnsubscribe?.();
    };
    // Re-run when the signed-in user, session role, or selected partner/driver
    // identifiers change so the Firestore subscriptions reflect the latest
    // staff scope (admin / restaurant / driver / member) and pick up newly
    // placed orders the customer just created.
  }, [
    currentUser?.uid,
    sessionMode,
    selectedPartnerRestaurantId,
    selectedDriverId,
  ]);

  useEffect(() => {
    const matchingOrder = adminOrders.find(
      (order) => order.id === currentOrder?.id,
    );
    if (matchingOrder) {
      setCurrentOrder((current) =>
        syncCurrentOrderFromAdminOrder(current, matchingOrder),
      );
    }
  }, [adminOrders, currentOrder?.id]);

  const persistRestaurantMenuItems = async (
    restaurantId: string,
    menuItems: AdminRestaurantMenuItem[],
    previousRestaurants: AdminRestaurant[],
  ) => {
    try {
      await adminServiceRef.current?.saveRestaurantMenuItems?.(
        restaurantId,
        menuItems,
      );
    } catch (error) {
      setAdminRestaurants(previousRestaurants);

      if (isPermissionDenied(error)) {
        return;
      }

      console.error("Failed to save restaurant menu items:", error);
    }
  };

  const updateLocalRestaurantMenuItems = (
    restaurantId: string,
    updater: (items: AdminRestaurantMenuItem[]) => AdminRestaurantMenuItem[],
  ) => {
    let nextMenuItems: AdminRestaurantMenuItem[] = [];

    setAdminRestaurants((current) =>
      current.map((restaurant) => {
        if (restaurant.id !== restaurantId) {
          return restaurant;
        }

        nextMenuItems = updater(restaurant.menuItems);
        return { ...restaurant, menuItems: nextMenuItems };
      }),
    );

    return nextMenuItems;
  };

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);

        try {
          const tokenResult = await user.getIdTokenResult(true);
          const staffSession = resolveStaffSessionFromClaims(
            tokenResult.claims as StaffClaims,
            user.email,
          );

          setSessionMode(staffSession.mode);
          if (staffSession.mode === "restaurant") {
            setSelectedPartnerRestaurantId(staffSession.restaurantId);
          }
          if (staffSession.mode === "driver") {
            setSelectedDriverId(staffSession.driverId);
          }
        } catch (error) {
          console.error("Error reading staff authorization claims:", error);
          setSessionMode("member");
        }

        try {
          const firestoreProfile = await getUserProfile(user.uid);
          if (firestoreProfile) {
            const resolvedFullName = resolveProfileName(
              firestoreProfile.displayName || user.displayName,
              firestoreProfile.email || user.email,
              "FusionYum Member",
            );

            setProfile({
              fullName: resolvedFullName,
              email: firestoreProfile.email || user.email || "",
              phone: firestoreProfile.phone || "",
              address: firestoreProfile.address || "",
              deliveryNote: firestoreProfile.deliveryNote || "",
              rewardsPoints: firestoreProfile.rewardsPoints || 0,
              rewardsTier: firestoreProfile.rewardsTier || "Bronze Member",
            });
            setSavedLocationOptions(firestoreProfile.savedAddresses ?? []);
          } else {
            const resolvedFullName = resolveProfileName(
              user.displayName,
              user.email,
              "FusionYum Member",
            );

            const newProfile = {
              uid: user.uid,
              email: user.email,
              displayName: resolvedFullName,
              phone: "",
              address: "",
              deliveryNote: "",
              rewardsPoints: 0,
              rewardsTier: "Bronze Member",
              createdAt: firestore.FieldValue.serverTimestamp(),
            };
            await saveUserProfile(user.uid, newProfile);
            setProfile({
              fullName: resolvedFullName,
              email: newProfile.email || "",
              phone: newProfile.phone,
              address: newProfile.address,
              deliveryNote: newProfile.deliveryNote,
              rewardsPoints: newProfile.rewardsPoints,
              rewardsTier: newProfile.rewardsTier,
            });
          }
        } catch (error) {
          console.error("Error fetching/saving user profile:", error);
          setProfile((current) => ({
            ...current,
            fullName: resolveProfileName(
              user.displayName,
              user.email,
              current.fullName,
            ),
            email: user.email || current.email,
          }));
        }
      } else {
        setCurrentUser(null);
        setSessionMode((current) =>
          current === "guest" ? "guest" : "signed-out",
        );
        // Clear personal data so a new sign-in starts clean.
        setProfile(defaultProfile);
        setSavedLocationOptions([]);
      }
    });

    return unsubscribe;
  }, []);

  const cartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo<AppStateValue>(
    () => ({
      cartItems,
      cartQuantity,
      favoriteIds,
      savedCardsExpanded,
      selectedRestaurantId,
      selectedPartnerRestaurantId,
      selectedDriverId,
      searchQuery,
      recentSearches,
      savedSearches,
      discoveryFilters,
      currentOrder,
      restaurants: restaurantDiscovery.restaurants,
      featuredRestaurants: restaurantDiscovery.featured,
      nearbyRestaurants: restaurantDiscovery.nearby,
      restaurantDataSource: restaurantDiscovery.source,
      restaurantDataMessage: restaurantDiscovery.message,
      restaurantDataLoading,
      orderHistory,
      adminOrders,
      adminRestaurants,
      adminFeedback,
      driverProfiles,
      selectedCardId,
      selectedTip,
      customTip,
      sessionMode,
      profile,
      currentUser,
      settings,
      joinedRewards,
      rewardsEmail,
      savedLocationOptions,
      addToCart: () => {
        const restaurant =
          restaurantDiscovery.restaurants.find(
            (entry) => entry.id === selectedRestaurantId,
          ) ??
          defaultRestaurant;
        setCartItems((current) => {
          const existing = current.find((item) => item.id === "menu-1");
          if (existing) {
            return current.map((item) =>
              item.id === "menu-1"
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }

          return [
            ...current,
            {
              id: "menu-1",
              name: restaurant?.popularDishes[0] ?? "Campus favorite",
              price: parsePrice(getDiscoveryMenuPrice(restaurant?.price ?? "$$", 0)),
              quantity: 1,
              restaurantId: restaurant?.id ?? defaultRestaurant?.id ?? "",
              restaurantName: restaurant?.name ?? "FusionYum",
            },
          ];
        });
      },
      decreaseCart: () =>
        setCartItems((current) =>
          current
            .map((item) =>
              item.id === "menu-1"
                ? { ...item, quantity: Math.max(0, item.quantity - 1) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        ),
      addMenuItem: (item, options) => {
        const restaurant =
          restaurantDiscovery.restaurants.find(
            (entry) => entry.id === item.restaurantId,
          ) ??
          restaurantDiscovery.restaurants.find(
            (entry) => entry.id === selectedRestaurantId,
          ) ??
          defaultRestaurant;
        const restaurantId =
          item.restaurantId ?? restaurant?.id ?? selectedRestaurantId;
        const restaurantName =
          item.restaurantName ?? restaurant?.name ?? "FusionYum";

        // FusionYum supports a unified multi-restaurant cart per the spec,
        // so we do NOT block items from a second restaurant. The `replaceCart`
        // option is preserved so callers (e.g. "reorder" flow) can opt into
        // clearing the cart explicitly.

        setCartItems((current) => {
          const baseline = options?.replaceCart
            ? current.filter((cartItem) => cartItem.restaurantId === restaurantId)
            : current;

          const existing = baseline.find(
            (cartItem) =>
              cartItem.id === item.id &&
              cartItem.restaurantId === restaurantId,
          );

          if (existing) {
            return baseline.map((cartItem) =>
              cartItem.id === item.id &&
              cartItem.restaurantId === existing.restaurantId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem,
            );
          }

          return [
            ...baseline,
            {
              id: item.id,
              name: item.name,
              price: parsePrice(item.price),
              quantity: 1,
              restaurantId,
              restaurantName,
            },
          ];
        });

        return { status: "added" };
      },
      decreaseMenuItem: (itemId: string) =>
        setCartItems((current) =>
          current
            .map((item) =>
              item.id === itemId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        ),
      removeCartItem: (itemId: string) =>
        setCartItems((current) => current.filter((item) => item.id !== itemId)),
      clearCart: () => setCartItems([]),
      toggleFavorite: (restaurantId: string) =>
        setFavoriteIds((current) =>
          current.includes(restaurantId)
            ? current.filter((id) => id !== restaurantId)
            : [...current, restaurantId],
        ),
      toggleSavedCardsExpanded: () =>
        setSavedCardsExpanded((current) => !current),
      selectCard: (cardId: PaymentCardId) => setSelectedCardId(cardId),
      setSelectedTip,
      setCustomTip,
      beginGuestSession: () => setSessionMode("guest"),
      loginAsMember: (identifier?: string) => {
        setSessionMode("member");
        if (identifier?.trim()) {
          setProfile((current) => ({
            ...current,
            email: identifier.includes("@") ? identifier : current.email,
            fullName:
              current.fullName === "Guest Explorer"
                ? "FusionYum Member"
                : current.fullName,
          }));
          setRewardsEmail(identifier.includes("@") ? identifier : rewardsEmail);
        }
      },
      beginAdminSession: () => setSessionMode("admin"),
      beginRestaurantSession: (restaurantId?: string) => {
        setSessionMode("restaurant");
        if (restaurantId) {
          setSelectedPartnerRestaurantId(restaurantId);
        }
      },
      beginGoogleAggregatorSession: () => {
        setSessionMode("googleAggregator");
        // The aggregator doesn't bind to a single partner restaurant.
      },
      beginDriverSession: (driverId?: string) => {
        setSessionMode("driver");
        if (driverId) {
          setSelectedDriverId(driverId);
        }
      },
      logout: () => {
        if (currentUser) {
          void signOutUser().catch((error) => {
            console.error("Unable to complete Firebase sign out:", error);
          });
        }
        setSessionMode("signed-out");
        setCartItems([]);
        setSelectedTip(checkoutPricing.defaultTip);
        setCustomTip(checkoutPricing.customTipDefault);
        setSavedCardsExpanded(true);
        setSearchQuery("");
      },
      updateProfile: async (patch: Partial<UserProfile>) => {
        setProfile((current) => {
          const next = { ...current, ...patch };
          if (patch.email) {
            setRewardsEmail(patch.email);
          }
          return next;
        });

        if (currentUser) {
          try {
            await saveUserProfile(currentUser.uid, {
              displayName: patch.fullName,
              email: patch.email,
              phone: patch.phone,
              address: patch.address,
              deliveryNote: patch.deliveryNote,
              rewardsPoints: patch.rewardsPoints,
              rewardsTier: patch.rewardsTier,
            });
          } catch (error) {
            console.error("Error saving profile to Firestore:", error);
          }
        }
      },
      updateAddress: async (address: string, deliveryNote?: string) => {
        setProfile((current) => ({
          ...current,
          address,
          deliveryNote: deliveryNote ?? current.deliveryNote,
        }));

        if (currentUser) {
          try {
            await saveUserProfile(currentUser.uid, {
              address,
              deliveryNote: deliveryNote ?? "",
            });
          } catch (error) {
            console.error("Error saving address to Firestore:", error);
          }
        }
      },
      addSavedAddress: async (address: string) => {
        const trimmed = address.trim();
        if (!trimmed) return;

        const next = savedLocationOptions.includes(trimmed)
          ? savedLocationOptions
          : [...savedLocationOptions, trimmed];

        if (next === savedLocationOptions) return;
        setSavedLocationOptions(next);

        if (currentUser) {
          try {
            await saveUserProfile(currentUser.uid, { savedAddresses: next });
          } catch (error) {
            console.error("Error saving address list to Firestore:", error);
          }
        }
      },
      removeSavedAddress: async (address: string) => {
        const next = savedLocationOptions.filter((entry) => entry !== address);
        if (next.length === savedLocationOptions.length) return;

        setSavedLocationOptions(next);

        // If we just removed the active address, clear it on the profile too.
        const wasActive = profile.address === address;
        if (wasActive) {
          setProfile((current) => ({ ...current, address: "" }));
        }

        if (currentUser) {
          try {
            await saveUserProfile(currentUser.uid, {
              savedAddresses: next,
              ...(wasActive ? { address: "" } : {}),
            });
          } catch (error) {
            console.error("Error removing saved address from Firestore:", error);
          }
        }
      },
      toggleSetting: (key: keyof AppSettings) =>
        setSettings((current) => ({
          ...current,
          [key]: !current[key],
        })),
      reorderFromHistory: (orderId: string) => {
        const order = orderHistory.find((entry) => entry.id === orderId);
        if (!order) {
          return;
        }

        setCartItems(
          order.items.map((item, index) => {
            const match = item.match(/x(\d+)/i);
            const quantity = match ? Number.parseInt(match[1], 10) : 1;
            const name = item.replace(/\sx\d+/i, "").trim();
            const menuItem = findMenuItemByName(name);
            const estimatedUnitPrice =
              parseCurrencyValue(order.total) /
              Math.max(order.items.length, 1) /
              Math.max(quantity, 1);

            return {
              id: `reorder-${orderId}-${index}`,
              name,
              price: menuItem
                ? parsePrice(menuItem.price)
                : Number(estimatedUnitPrice.toFixed(2)),
              quantity,
              restaurantId: `reorder-${orderId}`,
              restaurantName: order.restaurant,
            };
          }),
        );
      },
      joinRewards: (email: string) => {
        if (!email.trim()) {
          return;
        }

        setJoinedRewards(true);
        setRewardsEmail(email);
        setProfile((current) => ({
          ...current,
          email,
          rewardsPoints: current.rewardsPoints + 45,
        }));
      },
      setSelectedRestaurant: (restaurantId: string) => {
        setSelectedRestaurantId(restaurantId);
      },
      setSelectedPartnerRestaurant: (restaurantId: string) => {
        setSelectedPartnerRestaurantId(restaurantId);
      },
      setSelectedDriver: (driverId: string) => {
        setSelectedDriverId(driverId);
      },
      setSearchQuery,
      submitSearch: (value?: string) => {
        const trimmed = (value ?? searchQuery).trim();
        if (!trimmed) {
          return;
        }
        setSearchQuery(trimmed);
        setRecentSearches((current) =>
          [trimmed, ...current.filter((entry) => entry !== trimmed)].slice(
            0,
            6,
          ),
        );
      },
      clearSearch: () => setSearchQuery(""),
      toggleSavedSearch: (value: string) =>
        setSavedSearches((current) =>
          current.includes(value)
            ? current.filter((entry) => entry !== value)
            : [value, ...current].slice(0, 6),
        ),
      applyDiscoveryFilters: (patch: Partial<DiscoveryFilters>) =>
        setDiscoveryFilters((current) => ({
          ...current,
          ...patch,
        })),
      resetDiscoveryFilters: () => setDiscoveryFilters(defaultFilters),
      refreshRestaurants: async (keyword?: string) => {
        setRestaurantDataLoading(true);
        const discovery = await loadRestaurantDiscovery({
          location: campusLocation,
          radiusMeters: campusLocation.radiusMeters,
          keyword,
        });
        setRestaurantDiscovery(discovery);
        setSelectedRestaurantId((current) =>
          discovery.restaurants.some((restaurant) => restaurant.id === current)
            ? current
            : (discovery.restaurants[0]?.id ?? current),
        );
        setRestaurantDataLoading(false);
      },
      searchRestaurants: async (
        keyword: string,
        filters: RestaurantSearchFilters = {},
      ) => {
        const trimmed = keyword.trim();
        if (!trimmed) {
          return searchRestaurantCatalog(restaurantDiscovery.restaurants, "", {
            ...discoveryFilters,
            ...filters,
          });
        }

        try {
          const liveResults = await searchNearbyRestaurants({
            location: campusLocation,
            radiusMeters: campusLocation.radiusMeters,
            keyword: trimmed,
          });

          return searchRestaurantCatalog(liveResults, trimmed, {
            ...discoveryFilters,
            ...filters,
          });
        } catch (error) {
          console.error("Restaurant search failed:", error);
          return searchRestaurantCatalog(restaurantDiscovery.restaurants, trimmed, {
            ...discoveryFilters,
            ...filters,
          });
        }
      },
      getRestaurantMenuSections: (restaurantId: string) => {
        const liveSections = buildLiveMenuSections(
          restaurantId,
          adminRestaurants,
        );

        return liveSections.length > 0
          ? liveSections
          : buildDiscoveryMenuSections(
              restaurantId,
              restaurantDiscovery.restaurants,
            );
      },
      addRestaurantMenuItem: async (
        restaurantId: string,
        item: RestaurantMenuItemDraft,
      ) => {
        const trimmedName = item.name.trim();
        if (!trimmedName) {
          return;
        }

        const previousRestaurants = adminRestaurants;
        const itemId = `${restaurantId}-custom-${slugifyMenuId(trimmedName) || "item"}-${Date.now()}`;
        const nextMenuItems = updateLocalRestaurantMenuItems(
          restaurantId,
          (items) => [
            {
              id: itemId,
              name: trimmedName,
              price: normalizeMenuPrice(item.price),
              available: true,
              description: item.description?.trim() ?? "",
              category: item.category?.trim() || "New & featured",
              isNew: true,
              popular: false,
            },
            ...items,
          ],
        );

        await persistRestaurantMenuItems(
          restaurantId,
          nextMenuItems,
          previousRestaurants,
        );
      },
      removeRestaurantMenuItem: async (
        restaurantId: string,
        itemId: string,
      ) => {
        const previousRestaurants = adminRestaurants;
        const staticEntry = getStaticMenuItem(restaurantId, itemId);
        const nextMenuItems = updateLocalRestaurantMenuItems(
          restaurantId,
          (items) => {
            const existing = items.find((item) => item.id === itemId);

            if (existing?.isNew || itemId.includes("-custom-")) {
              return items.filter((item) => item.id !== itemId);
            }

            if (existing) {
              return items.map((item) =>
                item.id === itemId ? { ...item, available: false } : item,
              );
            }

            if (staticEntry) {
              return [
                toAdminMenuItem(restaurantId, itemId, { available: false }),
                ...items,
              ];
            }

            return items;
          },
        );

        await persistRestaurantMenuItems(
          restaurantId,
          nextMenuItems,
          previousRestaurants,
        );
      },
      toggleRestaurantMenuItemFeatured: async (
        restaurantId: string,
        itemId: string,
      ) => {
        const previousRestaurants = adminRestaurants;
        const nextMenuItems = updateLocalRestaurantMenuItems(
          restaurantId,
          (items) => {
            const existing = items.find((item) => item.id === itemId);

            if (existing) {
              return items.map((item) =>
                item.id === itemId
                  ? { ...item, popular: !item.popular }
                  : item,
              );
            }

            return [
              toAdminMenuItem(restaurantId, itemId, {
                popular: !getStaticMenuItem(restaurantId, itemId)?.item.popular,
              }),
              ...items,
            ];
          },
        );

        await persistRestaurantMenuItems(
          restaurantId,
          nextMenuItems,
          previousRestaurants,
        );
      },
      updateAdminOrderStatus: async (
        orderId: string,
        status: AdminOrderStatus,
      ) => {
        const previousOrders = adminOrders;
        const matchingOrder = adminOrders.find((order) => order.id === orderId);
        const nextEta = getStatusEta(status);

        setAdminOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  eta: nextEta,
                  issue: status === "Completed" ? null : order.issue,
                }
              : order,
          ),
        );

        if (matchingOrder) {
          const optimisticOrder = {
            ...matchingOrder,
            status,
            eta: nextEta,
            issue: status === "Completed" ? null : matchingOrder.issue,
          };
          setCurrentOrder((current) =>
            syncCurrentOrderFromAdminOrder(current, optimisticOrder),
          );
        }

        try {
          await adminServiceRef.current?.updateAdminOrderStatus?.(
            orderId,
            status,
          );
        } catch (error) {
          setAdminOrders(previousOrders);
          if (matchingOrder) {
            setCurrentOrder((current) =>
              syncCurrentOrderFromAdminOrder(current, matchingOrder),
            );
          }

          if (isPermissionDenied(error)) {
            return;
          }

          console.error("Failed to update admin order status:", error);
        }
      },
      reportOrderIssue: async ({ orderId, type, description }) => {
        if (!currentUser) {
          throw new Error("Sign in is required to report an issue.");
        }
        const { reportOrderIssue, summarizeIssueForBanner } = await import(
          "./Firebase/orderIssues"
        );
        const summary = summarizeIssueForBanner(type, description);

        // Optimistic local update so the customer sees the issue reflected
        // immediately on their order.
        setAdminOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  issue: summary,
                  issueReport: {
                    type,
                    description: description.trim(),
                    reportedAt: new Date().toISOString(),
                    reportedBy: currentUser.uid,
                    status: "open",
                    resolution: null,
                  },
                }
              : order,
          ),
        );

        try {
          await reportOrderIssue({
            orderId,
            reportedBy: currentUser.uid,
            type,
            description,
          });
        } catch (error) {
          console.error("Failed to report order issue:", error);
          throw error;
        }
      },
      resolveOrderIssue: async ({ orderId, action, notes }) => {
        if (!currentUser) {
          throw new Error("Sign in is required to resolve an issue.");
        }
        const { resolveOrderIssue } = await import("./Firebase/orderIssues");
        const previous = adminOrders;

        // Optimistically clear the issue banner.
        setAdminOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  issue: null,
                  issueReport: order.issueReport
                    ? {
                        ...order.issueReport,
                        status: "resolved" as const,
                        resolution: {
                          action,
                          notes: notes.trim(),
                          resolvedAt: new Date().toISOString(),
                          resolvedBy: currentUser.uid,
                        },
                      }
                    : order.issueReport,
                }
              : order,
          ),
        );

        try {
          await resolveOrderIssue({
            orderId,
            resolvedBy: currentUser.uid,
            action,
            notes,
          });
        } catch (error) {
          setAdminOrders(previous);
          console.error("Failed to resolve order issue:", error);
          throw error;
        }
      },
      cancelAdminOrder: async (orderId, reason) => {
        const previous = adminOrders;
        const trimmedReason = reason.trim() || "Cancelled by admin";

        setAdminOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? { ...order, status: "Completed", issue: trimmedReason }
              : order,
          ),
        );

        try {
          const firestoreModule = await import(
            "@react-native-firebase/firestore"
          );
          await firestoreModule
            .default()
            .collection("orders")
            .doc(orderId)
            .update({
              status: "cancelled",
              adminStatus: "Completed",
              issue: trimmedReason,
              updatedAt: firestoreModule.default.FieldValue.serverTimestamp(),
            });
        } catch (error) {
          setAdminOrders(previous);
          console.error("Failed to cancel order:", error);
          throw error;
        }
      },
      toggleAdminMenuItemAvailability: async (
        restaurantId: string,
        itemId: string,
      ) => {
        const previousRestaurants = adminRestaurants;
        const nextMenuItems = updateLocalRestaurantMenuItems(
          restaurantId,
          (items) => {
            const existing = items.find((item) => item.id === itemId);

            if (existing) {
              return items.map((item) =>
                item.id === itemId
                  ? { ...item, available: !item.available }
                  : item,
              );
            }

            const staticEntry = getStaticMenuItem(restaurantId, itemId);
            if (!staticEntry) {
              return items;
            }

            return [
              toAdminMenuItem(restaurantId, itemId, {
                available: !(staticEntry.item.available ?? true),
              }),
              ...items,
            ];
          },
        );

        await persistRestaurantMenuItems(
          restaurantId,
          nextMenuItems,
          previousRestaurants,
        );
      },
      updateAdminMenuItemPrice: async (
        restaurantId: string,
        itemId: string,
        price: string,
      ) => {
        const previousRestaurants = adminRestaurants;
        const normalizedPrice = normalizeMenuPrice(price);
        const nextMenuItems = updateLocalRestaurantMenuItems(
          restaurantId,
          (items) => {
            const existing = items.find((item) => item.id === itemId);

            if (existing) {
              return items.map((item) =>
                item.id === itemId
                  ? { ...item, price: normalizedPrice }
                  : item,
              );
            }

            const staticEntry = getStaticMenuItem(restaurantId, itemId);
            if (!staticEntry) {
              return items;
            }

            return [
              toAdminMenuItem(restaurantId, itemId, {
                price: normalizedPrice,
              }),
              ...items,
            ];
          },
        );

        try {
          await adminServiceRef.current?.saveRestaurantMenuItems?.(
            restaurantId,
            nextMenuItems,
          );
        } catch (error) {
          setAdminRestaurants(previousRestaurants);

          if (!isPermissionDenied(error)) {
            console.error("Failed to update menu item price:", error);
          }
        }
      },
      approveRestaurant: async (restaurantId: string) => {
        const previousRestaurants = adminRestaurants;

        setAdminRestaurants((current) =>
          current.map((restaurant) =>
            restaurant.id === restaurantId &&
            restaurant.status === "Needs Approval"
              ? { ...restaurant, status: "Live" }
              : restaurant,
          ),
        );

        try {
          await adminServiceRef.current?.approveRestaurant?.(restaurantId);
        } catch (error) {
          if (!isPermissionDenied(error)) {
            console.error("Failed to approve restaurant:", error);
          }
          setAdminRestaurants(previousRestaurants);
        }
      },
      updateRestaurantPrepTime: async (
        restaurantId: string,
        prepTime: string,
      ) => {
        const previousRestaurants = adminRestaurants;

        setAdminRestaurants((current) =>
          current.map((restaurant) =>
            restaurant.id === restaurantId
              ? { ...restaurant, avgPrepTime: prepTime }
              : restaurant,
          ),
        );

        try {
          await adminServiceRef.current?.updateRestaurantPrepTime?.(
            restaurantId,
            prepTime,
          );
        } catch (error) {
          if (!isPermissionDenied(error)) {
            console.error("Failed to update restaurant prep time:", error);
          }
          setAdminRestaurants(previousRestaurants);
        }
      },
      claimDriverAssignment: async (orderId: string) => {
        const activeDriver = driverProfiles.find(
          (driver) => driver.id === selectedDriverId,
        );
        if (!activeDriver) {
          return;
        }

        const previousOrders = adminOrders;
        const previousDrivers = driverProfiles;
        const matchingOrder = adminOrders.find((order) => order.id === orderId);
        const optimisticOrder = matchingOrder
          ? {
              ...matchingOrder,
              driver: activeDriver.name,
              driverId: activeDriver.id,
              driverName: activeDriver.name,
              status: "Ready for Driver" as const,
              eta: "Pickup pending",
              issue: null,
            }
          : undefined;

        setAdminOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  driver: activeDriver.name,
                  driverId: activeDriver.id,
                  driverName: activeDriver.name,
                  status: "Ready for Driver",
                  eta: "Pickup pending",
                  issue: null,
                }
              : order,
          ),
        );
        setDriverProfiles((current) =>
          current.map((driver) =>
            driver.id === selectedDriverId
              ? { ...driver, status: "Delivering" }
              : driver,
          ),
        );
        if (optimisticOrder) {
          setCurrentOrder((current) =>
            syncCurrentOrderFromAdminOrder(current, optimisticOrder),
          );
        }

        try {
          await adminServiceRef.current?.claimDriverAssignment?.(
            orderId,
            selectedDriverId,
          );
        } catch (error) {
          if (!isPermissionDenied(error)) {
            console.error("Failed to claim driver assignment:", error);
          }
          setAdminOrders(previousOrders);
          setDriverProfiles(previousDrivers);
          if (matchingOrder) {
            setCurrentOrder((current) =>
              syncCurrentOrderFromAdminOrder(current, matchingOrder),
            );
          }
        }
      },
      completeDriverDelivery: async (orderId: string) => {
        const activeDriver = driverProfiles.find(
          (driver) => driver.id === selectedDriverId,
        );
        const previousOrders = adminOrders;
        const previousDrivers = driverProfiles;
        const previousHistory = orderHistory;
        const matchingOrder = adminOrders.find((order) => order.id === orderId);
        const optimisticOrder = matchingOrder
          ? {
              ...matchingOrder,
              status: "Completed" as const,
              eta: "Delivered",
              issue: null,
            }
          : undefined;

        setAdminOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "Completed",
                  eta: "Delivered",
                  issue: null,
                }
              : order,
          ),
        );
        setDriverProfiles((current) =>
          current.map((driver) =>
            driver.id === selectedDriverId
              ? { ...driver, status: "Available" }
              : driver,
          ),
        );
        if (optimisticOrder) {
          setCurrentOrder((current) =>
            syncCurrentOrderFromAdminOrder(current, optimisticOrder),
          );
        }
        if (activeDriver) {
          setOrderHistory((current) =>
            syncOrderHistoryDelivery(current, orderId, activeDriver.name),
          );
        }

        try {
          await adminServiceRef.current?.completeDriverDelivery?.(
            orderId,
            selectedDriverId,
          );
        } catch (error) {
          if (!isPermissionDenied(error)) {
            console.error("Failed to complete driver delivery:", error);
          }
          setAdminOrders(previousOrders);
          setDriverProfiles(previousDrivers);
          setOrderHistory(previousHistory);
          if (matchingOrder) {
            setCurrentOrder((current) =>
              syncCurrentOrderFromAdminOrder(current, matchingOrder),
            );
          }
        }
      },
      placeOrder: async () => {
        if (cartItems.length === 0) {
          return null;
        }

        try {
          const subtotal = getCartSubtotal(cartItems);
          const taxes = getCartTaxes(cartItems);
          const tip = getTipAmount(cartItems, selectedTip, customTip);
          const total = subtotal + taxes + checkoutPricing.deliveryFee + tip;
          const restaurantNames = [
            ...new Set(cartItems.map((item) => item.restaurantName)),
          ];

          let orderId: string;

          if (currentUser) {
            const { processCheckout } = await import("./Firebase/checkout");

            orderId = await processCheckout({
              userId: currentUser.uid,
              restaurantId: cartItems[0]?.restaurantId ?? selectedRestaurantId,
              restaurantName:
                restaurantNames.length === 1
                  ? restaurantNames[0]
                  : "FusionYum Mixed Order",
              items: cartItems.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                specialInstructions: "",
              })),
              subtotal,
              taxes,
              deliveryFee: checkoutPricing.deliveryFee,
              tip,
              totalAmount: total,
              deliveryAddress: profile.address,
              deliveryNote: profile.deliveryNote,
              specialInstructions: "",
              paymentMethodId: selectedCardId,
            });
          } else {
            console.log("Using guest checkout mode - user not authenticated");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            orderId = `GUEST-${Date.now()}`;
          }

          const items = cartItems.map(
            (item) => `${item.name} x${item.quantity}`,
          );
          const nextOrder: CustomerOrder = {
            id: orderId,
            restaurant:
              restaurantNames.length === 1
                ? restaurantNames[0]
                : "FusionYum Mixed Order",
            placedAt: formatPlacedAt(),
            eta:
              restaurantNames.length === 1
                ? "Estimated: 18-25 min"
                : "Estimated: 25-35 min",
            address: profile.address,
            total: formatCurrency(total),
            items,
            statuses: buildCustomerStatuses("Pending"),
          };

          setCurrentOrder(nextOrder);
          setOrderHistory((current) => [
            {
              id: nextOrder.id,
              restaurant: nextOrder.restaurant,
              status: "In Progress",
              date: "Just now | Order in progress",
              total: nextOrder.total,
              items: nextOrder.items,
              accent: "#b45309",
            },
            ...current,
          ]);
          setAdminOrders((current) => [
            {
              id: nextOrder.id,
              customer: profile.fullName,
              restaurantId: cartItems[0]?.restaurantId ?? selectedRestaurantId,
              restaurant: nextOrder.restaurant,
              total: nextOrder.total,
              status: "Pending",
              placedAt: "Just now",
              eta: nextOrder.eta.replace("Estimated: ", ""),
              driver: unassignedDriverLabel,
              driverId: null,
              driverName: null,
              deliveryAddress: profile.address,
              issue: null,
            },
            ...current,
          ]);
          setCartItems([]);
          return orderId;
        } catch (error) {
          console.error("Checkout error:", error);
          throw error;
        }
      },
    }),
    [
      cartItems,
      cartQuantity,
      customTip,
      currentOrder,
      currentUser,
      defaultRestaurant,
      discoveryFilters,
      driverProfiles,
      favoriteIds,
      adminFeedback,
      adminOrders,
      adminRestaurants,
      joinedRewards,
      orderHistory,
      profile,
      recentSearches,
      restaurantDataLoading,
      restaurantDiscovery,
      rewardsEmail,
      savedCardsExpanded,
      savedLocationOptions,
      savedSearches,
      searchQuery,
      selectedCardId,
      selectedDriverId,
      selectedPartnerRestaurantId,
      selectedRestaurantId,
      selectedTip,
      sessionMode,
      settings,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error(
      "useAppState must be used within AppStateProvider",
    );
  }

  return context;
}

export function getCartSubtotal(value: number | CartItem[]) {
  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  const fallbackItem = menuByRestaurantId["featured-2"]?.[0]?.items[0];
  return parsePrice(fallbackItem?.price ?? "$0.00") * value;
}

export function getCartTaxes(value: number | CartItem[]) {
  if (Array.isArray(value)) {
    return value.length > 0
      ? getCartSubtotal(value) * checkoutPricing.taxRate
      : 0;
  }

  return value > 0 ? getCartSubtotal(value) * checkoutPricing.taxRate : 0;
}

export function getTipAmount(
  value: number | CartItem[],
  selectedTip: string,
  customTip: string,
) {
  const parsedCustomTip = Number.parseFloat(customTip || "0");

  if (parsedCustomTip > 0) {
    return parsedCustomTip;
  }

  const rate = Number.parseInt(selectedTip.replace("%", ""), 10);

  if (Number.isNaN(rate)) {
    return 0;
  }

  return (getCartSubtotal(value) * rate) / 100;
}

export function getCartItemCount(value: number | CartItem[]) {
  return resolveQuantity(value);
}

export function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
