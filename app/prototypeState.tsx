import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, signOutUser } from "./Firebase/auth";
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
  updateAdminOrderStatus: (orderId: string, status: AdminOrderStatus) => void;
  toggleAdminMenuItemAvailability: (
    restaurantId: string,
    itemId: string,
  ) => void;
  approveRestaurant: (restaurantId: string) => void;
  updateRestaurantPrepTime: (restaurantId: string, prepTime: string) => void;
  claimDriverAssignment: (orderId: string) => void;
  completeDriverDelivery: (orderId: string) => void;
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
  const [adminFeedback] = useState(initialAdminFeedback);
  const [driverProfiles, setDriverProfiles] = useState(initialDriverProfiles);

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        // User is signed in with Firebase
        setSessionMode("member");
        // Update profile with Firebase user data
        setProfile((current) => ({
          ...current,
          fullName: user.displayName || current.fullName,
          email: user.email || current.email,
        }));
      } else {
        // User is signed out
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
      updateProfile: (patch: Partial<UserProfile>) =>
        setProfile((current) => {
          const next = { ...current, ...patch };
          if (patch.email) {
            setRewardsEmail(patch.email);
          }
          return next;
        }),
      updateAddress: (address: string, deliveryNote?: string) =>
        setProfile((current) => ({
          ...current,
          address,
          deliveryNote: deliveryNote ?? current.deliveryNote,
        })),
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
      updateAdminOrderStatus: (orderId: string, status: AdminOrderStatus) => {
        let updatedOrder:
          | {
              id: string;
              driver: string;
              eta: string;
            }
          | undefined;

        setAdminOrders((current) =>
          current.map((order) => {
            if (order.id !== orderId) {
              return order;
            }

            updatedOrder = {
              id: order.id,
              driver: order.driver,
              eta:
                status === "Pending"
                  ? "18 min"
                  : status === "Preparing"
                    ? "14 min"
                    : status === "Ready for Driver"
                      ? "9 min"
                      : status === "Out for Delivery"
                        ? "6 min"
                        : "Delivered",
            };

            return {
              ...order,
              status,
              eta: updatedOrder.eta,
              issue: status === "Completed" ? null : order.issue,
            };
          }),
        );

        if (updatedOrder) {
          const order = updatedOrder;
          setCurrentOrder((current) =>
            current?.id === order.id
              ? {
                  ...current,
                  eta:
                    order.eta === "Delivered"
                      ? "Delivered"
                      : `Estimated: ${order.eta}`,
                  statuses: buildCustomerStatuses(status, order.driver),
                }
              : current,
          );
        }
      },
      toggleAdminMenuItemAvailability: (restaurantId: string, itemId: string) =>
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
        ),
      approveRestaurant: (restaurantId: string) =>
        setAdminRestaurants((current) =>
          current.map((restaurant) =>
            restaurant.id === restaurantId &&
            restaurant.status === "Needs Approval"
              ? { ...restaurant, status: "Live" }
              : restaurant,
          ),
        ),
      updateRestaurantPrepTime: (restaurantId: string, prepTime: string) =>
        setAdminRestaurants((current) =>
          current.map((restaurant) =>
            restaurant.id === restaurantId
              ? { ...restaurant, avgPrepTime: prepTime }
              : restaurant,
          ),
        ),
      claimDriverAssignment: (orderId: string) => {
        const activeDriver = driverProfiles.find(
          (driver) => driver.id === selectedDriverId,
        );
        if (!activeDriver) {
          return;
        }

        setAdminOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  driver: activeDriver.name,
                  status: "Out for Delivery",
                  eta: "6 min",
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
        setCurrentOrder((current) =>
          current?.id === orderId
            ? {
                ...current,
                eta: "Estimated: 6 min",
                statuses: buildCustomerStatuses(
                  "Out for Delivery",
                  activeDriver.name,
                ),
              }
            : current,
        );
      },
      completeDriverDelivery: (orderId: string) => {
        const activeDriver = driverProfiles.find(
          (driver) => driver.id === selectedDriverId,
        );
        setAdminOrders((current) =>
          current.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "Completed",
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
        setCurrentOrder((current) =>
          current?.id === orderId
            ? {
                ...current,
                eta: "Delivered",
                statuses: buildCustomerStatuses(
                  "Completed",
                  activeDriver?.name,
                ),
              }
            : current,
        );
        if (activeDriver) {
          setOrderHistory((current) =>
            current.map((order) =>
              order.id === orderId
                ? {
                    ...order,
                    date: `Today | Delivered by ${activeDriver.name}`,
                    status: "Delivered",
                    accent: "#016630",
                  }
                : order,
            ),
          );
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

          // Import the checkout function dynamically to avoid circular imports
          const { processCheckout, processCheckoutDemo } =
            await import("./Firebase/checkout");

          // Get the current authenticated user
          const { firebaseAuth } = await import("./Firebase/auth");
          const currentUser = firebaseAuth.currentUser;

          let orderId: string;

          if (currentUser) {
            // User is authenticated, use Firebase checkout
            orderId = await processCheckout({
              userId: currentUser.uid, // Use the actual Firebase user ID
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
                specialInstructions: "", // Cart items don't have special instructions in this prototype
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
            // User is not authenticated, use demo checkout
            console.log("Using demo checkout mode - user not authenticated");
            orderId = await processCheckoutDemo({
              userId: `demo_${Date.now()}`, // Demo user ID
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
                specialInstructions: "", // Cart items don't have special instructions in this prototype
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

          // Update local state for UI
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
