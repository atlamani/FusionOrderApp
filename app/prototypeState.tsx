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
  allRestaurants,
  adminFeedback as initialAdminFeedback,
  adminOrders as initialAdminOrders,
  adminRestaurants as initialAdminRestaurants,
  currentOrder as initialCurrentOrder,
  driverProfiles as initialDriverProfiles,
  orderHistory as initialOrderHistory,
  savedAddresses,
} from "./mockData";

type PaymentCardId = "visa" | "mastercard" | "amex";
type SessionMode =
  | "signed-out"
  | "guest"
  | "member"
  | "admin"
  | "restaurant"
  | "driver";
type AdminOrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready for Driver"
  | "Out for Delivery"
  | "Completed";

type AdminOrder = (typeof initialAdminOrders)[number];
type AdminRestaurant = (typeof initialAdminRestaurants)[number];
type AdminFeedback = (typeof initialAdminFeedback)[number];
type DriverProfile = (typeof initialDriverProfiles)[number];

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
};

function isPermissionDenied(error: unknown) {
  return (
    (error as { code?: string } | undefined)?.code ===
    "firestore/permission-denied"
  );
}

function buildCustomerStatuses(status: AdminOrderStatus, driverName?: string) {
  const preparingDetail =
    status === "Pending"
      ? "Restaurant is reviewing your order"
      : "Restaurant is preparing your order";
  const deliveryDetail =
    status === "Out for Delivery"
      ? `${driverName && driverName !== "Unassigned" ? driverName : "Your driver"} is on the way`
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

type PrototypeStateValue = {
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
  orderHistory: typeof initialOrderHistory;
  adminOrders: typeof initialAdminOrders;
  adminRestaurants: typeof initialAdminRestaurants;
  adminFeedback: typeof initialAdminFeedback;
  driverProfiles: typeof initialDriverProfiles;
  addToCart: () => void;
  decreaseCart: () => void;
  addMenuItem: (item: { id: string; name: string; price: string }) => void;
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
  beginDriverSession: (driverId?: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateAddress: (address: string, deliveryNote?: string) => void;
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
  placeOrder: () => Promise<string | null>;
  updateAdminOrderStatus: (
    orderId: string,
    status: AdminOrderStatus,
  ) => Promise<void>;
  toggleAdminMenuItemAvailability: (
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

const PrototypeStateContext = createContext<PrototypeStateValue | null>(null);

const defaultProfile: UserProfile = {
  fullName: "John Doe",
  email: "john@fusionyum.com",
  phone: "(917) 555-0146",
  address: "1855 Broadway, New York, NY 10023",
  deliveryNote: "Leave it with the doorman if I am still on a call.",
  rewardsPoints: 320,
  rewardsTier: "Gold Member",
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
};

function parsePrice(value: string) {
  return Number.parseFloat(value.replace("$", ""));
}

function formatPlacedAt() {
  return "Today, 2:30 PM";
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
  return current.map((order) =>
    order.id === orderId
      ? {
          ...order,
          date: driverName ? `Today | Delivered by ${driverName}` : order.date,
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
    updateRestaurantMenuItemPrice: async () => undefined,
    approveRestaurant: async () => undefined,
    updateRestaurantPrepTime: async () => undefined,
    claimDriverAssignment: async () => undefined,
    completeDriverDelivery: async () => undefined,
    ensureAdminSeedData: async () => undefined,
  };
}

export function PrototypeStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultRestaurant = allRestaurants[1] ?? allRestaurants[0];
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "menu-1",
      name: "Tacos Numero 1",
      price: 12.99,
      quantity: 1,
      restaurantId: defaultRestaurant?.id ?? "featured-2",
      restaurantName: defaultRestaurant?.name ?? "Tacos Numero 1",
    },
  ]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    "featured-1",
    "featured-2",
    "nearby-1",
  ]);
  const [savedCardsExpanded, setSavedCardsExpanded] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<PaymentCardId>("visa");
  const [selectedTip, setSelectedTip] = useState("15%");
  const [customTip, setCustomTip] = useState("0.00");
  const [sessionMode, setSessionMode] = useState<SessionMode>("signed-out");
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [joinedRewards, setJoinedRewards] = useState(false);
  const [rewardsEmail, setRewardsEmail] = useState(defaultProfile.email);
  const [savedLocationOptions] = useState(savedAddresses);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    defaultRestaurant?.id ?? "",
  );
  const [selectedPartnerRestaurantId, setSelectedPartnerRestaurantId] =
    useState("featured-2");
  const [selectedDriverId, setSelectedDriverId] = useState("driver-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Tacos",
    "Dessert delivery",
    "Healthy bowls",
  ]);
  const [savedSearches, setSavedSearches] = useState<string[]>([
    "Pizza near campus",
  ]);
  const [discoveryFilters, setDiscoveryFilters] =
    useState<DiscoveryFilters>(defaultFilters);
  const [currentOrder, setCurrentOrder] = useState<CustomerOrder | null>(
    initialCurrentOrder,
  );
  const [orderHistory, setOrderHistory] = useState(initialOrderHistory);
  const [adminOrders, setAdminOrders] = useState(initialAdminOrders);
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
          try {
            await module.ensureAdminSeedData?.();
          } catch (error) {
            console.error("Error seeding admin collections:", error);
          }
        }
      } catch (error) {
        console.error(
          "Admin Firebase service unavailable, using mock fallback:",
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
  }, []);

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

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        setSessionMode("member");

        try {
          const firestoreProfile = await getUserProfile(user.uid);
          if (firestoreProfile) {
            const resolvedFullName = resolveProfileName(
              firestoreProfile.displayName || user.displayName,
              firestoreProfile.email || user.email,
              defaultProfile.fullName,
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
          } else {
            const resolvedFullName = resolveProfileName(
              user.displayName,
              user.email,
              defaultProfile.fullName,
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
        if (
          sessionMode !== "guest" &&
          sessionMode !== "admin" &&
          sessionMode !== "restaurant" &&
          sessionMode !== "driver"
        ) {
          setSessionMode("signed-out");
        }
      }
    });

    return unsubscribe;
  }, [sessionMode]);

  const cartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo<PrototypeStateValue>(
    () => ({
      cartItems,
      cartQuantity,
      favoriteIds,
      savedCardsExpanded,
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
      selectedRestaurantId,
      selectedPartnerRestaurantId,
      selectedDriverId,
      searchQuery,
      recentSearches,
      savedSearches,
      discoveryFilters,
      currentOrder,
      orderHistory,
      adminOrders,
      adminRestaurants,
      adminFeedback,
      driverProfiles,
      addToCart: () => {
        const restaurant =
          allRestaurants.find((entry) => entry.id === selectedRestaurantId) ??
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
              name: "Tacos Numero 1",
              price: 12.99,
              quantity: 1,
              restaurantId: restaurant?.id ?? "featured-2",
              restaurantName: restaurant?.name ?? "Taqueria La Mexicana",
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
      addMenuItem: (item) => {
        const restaurant =
          allRestaurants.find((entry) => entry.id === selectedRestaurantId) ??
          defaultRestaurant;
        setCartItems((current) => {
          const existing = current.find(
            (cartItem) =>
              cartItem.id === item.id &&
              cartItem.restaurantId ===
                (restaurant?.id ?? selectedRestaurantId),
          );

          if (existing) {
            return current.map((cartItem) =>
              cartItem.id === item.id &&
              cartItem.restaurantId === existing.restaurantId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem,
            );
          }

          return [
            ...current,
            {
              id: item.id,
              name: item.name,
              price: parsePrice(item.price),
              quantity: 1,
              restaurantId: restaurant?.id ?? selectedRestaurantId,
              restaurantName: restaurant?.name ?? "FusionYum",
            },
          ];
        });
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
                ? defaultProfile.fullName
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
      beginDriverSession: (driverId?: string) => {
        setSessionMode("driver");
        if (driverId) {
          setSelectedDriverId(driverId);
        }
      },
      logout: () => {
        signOutUser();
        setSessionMode("signed-out");
        setCartItems([]);
        setSelectedTip("15%");
        setCustomTip("0.00");
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
            return {
              id: `reorder-${orderId}-${index}`,
              name,
              price: 12.99,
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
          if (isPermissionDenied(error)) {
            return;
          }

          console.error("Failed to update admin order status:", error);
          setAdminOrders(previousOrders);
          if (matchingOrder) {
            setCurrentOrder((current) =>
              syncCurrentOrderFromAdminOrder(current, matchingOrder),
            );
          }
        }
      },
      toggleAdminMenuItemAvailability: async (
        restaurantId: string,
        itemId: string,
      ) => {
        const previousRestaurants = adminRestaurants;

        setAdminRestaurants((current) =>
          current.map((restaurant) =>
            restaurant.id === restaurantId
              ? {
                  ...restaurant,
                  menuItems: restaurant.menuItems.map((item) =>
                    item.id === itemId
                      ? { ...item, available: !item.available }
                      : item,
                  ),
                }
              : restaurant,
          ),
        );

        try {
          await adminServiceRef.current?.toggleRestaurantMenuItemAvailability?.(
            restaurantId,
            itemId,
          );
        } catch (error) {
          if (!isPermissionDenied(error)) {
            console.error("Failed to toggle menu item availability:", error);
          }
          setAdminRestaurants(previousRestaurants);
        }
      },
      updateAdminMenuItemPrice: async (
        restaurantId: string,
        itemId: string,
        price: string,
      ) => {
        const previousRestaurants = adminRestaurants;
        const normalizedPrice = price.trim().startsWith("$")
          ? price.trim()
          : `$${price.trim()}`;

        setAdminRestaurants((current) =>
          current.map((restaurant) =>
            restaurant.id === restaurantId
              ? {
                  ...restaurant,
                  menuItems: restaurant.menuItems.map((item) =>
                    item.id === itemId
                      ? { ...item, price: normalizedPrice }
                      : item,
                  ),
                }
              : restaurant,
          ),
        );

        try {
          await adminServiceRef.current?.updateRestaurantMenuItemPrice?.(
            restaurantId,
            itemId,
            normalizedPrice,
          );
        } catch (error) {
          if (!isPermissionDenied(error)) {
            console.error("Failed to update menu item price:", error);
          }
          setAdminRestaurants(previousRestaurants);
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
          const total = subtotal + taxes + 5 + tip;
          const restaurantNames = [
            ...new Set(cartItems.map((item) => item.restaurantName)),
          ];

          const { processCheckout, processCheckoutDemo } =
            await import("./Firebase/checkout");
          const { firebaseAuth } = await import("./Firebase/auth");
          const currentUser = firebaseAuth.currentUser;

          let orderId: string;

          if (currentUser) {
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
              deliveryFee: 5,
              tip,
              totalAmount: total,
              deliveryAddress: profile.address,
              deliveryNote: profile.deliveryNote,
              specialInstructions: "",
              paymentMethodId: selectedCardId,
            });
          } else {
            console.log("Using demo checkout mode - user not authenticated");
            orderId = await processCheckoutDemo({
              userId: `demo_${Date.now()}`,
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
              deliveryFee: 5,
              tip,
              totalAmount: total,
              deliveryAddress: profile.address,
              deliveryNote: profile.deliveryNote,
              specialInstructions: "",
              paymentMethodId: selectedCardId,
            });
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
              status: "Delivered",
              date: "Just now | Added from current prototype session",
              total: nextOrder.total,
              items: nextOrder.items,
              accent: "#016630",
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
              driver: "Unassigned",
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
    <PrototypeStateContext.Provider value={value}>
      {children}
    </PrototypeStateContext.Provider>
  );
}

export function usePrototypeState() {
  const context = useContext(PrototypeStateContext);

  if (!context) {
    throw new Error(
      "usePrototypeState must be used within PrototypeStateProvider",
    );
  }

  return context;
}

export function getCartSubtotal(value: number | CartItem[]) {
  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  return 8.99 * value;
}

export function getCartTaxes(value: number | CartItem[]) {
  if (Array.isArray(value)) {
    return value.length > 0 ? getCartSubtotal(value) * 0.082 : 0;
  }

  return value > 0 ? 0.74 * value : 0;
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
