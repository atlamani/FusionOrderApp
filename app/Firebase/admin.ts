import firestore from "@react-native-firebase/firestore";
import {
  adminFeedback as mockAdminFeedback,
  adminOrders as mockAdminOrders,
  adminRestaurants as mockAdminRestaurants,
  driverProfiles as mockDriverProfiles,
} from "../mockData";
import type {
  AdminFeedback,
  AdminOrder,
  AdminOrderStatus,
  AdminRestaurant,
  AdminRestaurantMenuItem,
  AdminSeedResult,
  DriverProfile,
  OrderStatus,
  OrderTimelineStatus,
} from "./types";

type Unsubscribe = () => void;

const ORDERS_COLLECTION = "orders";
const RESTAURANTS_COLLECTION = "adminRestaurants";
const FEEDBACK_COLLECTION = "adminFeedback";
const DRIVERS_COLLECTION = "drivers";

const ADMIN_ORDER_STATUS_TO_ORDER_STATUS: Record<
  AdminOrderStatus,
  OrderStatus
> = {
  Pending: "pending",
  Preparing: "preparing",
  "Ready for Driver": "ready",
  "Out for Delivery": "out_for_delivery",
  Completed: "delivered",
};

const ORDER_STATUS_TO_ADMIN_STATUS: Record<OrderStatus, AdminOrderStatus> = {
  pending: "Pending",
  confirmed: "Pending",
  preparing: "Preparing",
  ready: "Ready for Driver",
  out_for_delivery: "Out for Delivery",
  delivered: "Completed",
  cancelled: "Pending",
};

function isPermissionDenied(error: unknown) {
  const code = (error as { code?: string } | undefined)?.code;
  return code === "firestore/permission-denied";
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function parseCurrency(value: unknown, fallback: string) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatCurrency(value);
  }

  if (typeof value === "string" && value.trim()) {
    if (value.trim().startsWith("$")) {
      return value.trim();
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? formatCurrency(parsed) : fallback;
  }

  return fallback;
}

function sanitizeString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function sanitizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeOrderStatus(value: unknown): OrderStatus {
  const status = sanitizeString(value, "pending") as OrderStatus;
  return status in ORDER_STATUS_TO_ADMIN_STATUS ? status : "pending";
}

function isOrderTimelineStatus(value: unknown): value is OrderTimelineStatus {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value &&
    "detail" in value
  );
}

function normalizeAdminOrderStatus(value: unknown): AdminOrderStatus {
  const status = sanitizeString(value, "Pending") as AdminOrderStatus;
  return status in ADMIN_ORDER_STATUS_TO_ORDER_STATUS ? status : "Pending";
}

function resolveAdminOrderStatus(
  data: Record<string, unknown> | undefined,
  fallback: AdminOrder,
): AdminOrderStatus {
  const orderData = data ?? {};
  const explicitAdminStatus = orderData.adminStatus;

  if (typeof explicitAdminStatus === "string") {
    return normalizeAdminOrderStatus(explicitAdminStatus);
  }

  if (typeof orderData.status === "string") {
    if (orderData.status in ADMIN_ORDER_STATUS_TO_ORDER_STATUS) {
      return normalizeAdminOrderStatus(orderData.status);
    }

    return ORDER_STATUS_TO_ADMIN_STATUS[normalizeOrderStatus(orderData.status)];
  }

  return fallback.status;
}

function sanitizeMenuItem(
  item: Partial<AdminRestaurantMenuItem> | undefined,
  fallback: AdminRestaurantMenuItem,
): AdminRestaurantMenuItem {
  const popularValue =
    item?.popular === undefined ? fallback.popular : item.popular;

  return {
    id: sanitizeString(item?.id, fallback.id),
    name: sanitizeString(item?.name, fallback.name),
    price: parseCurrency(item?.price, fallback.price),
    available: sanitizeBoolean(item?.available, fallback.available),
    ...(popularValue === undefined
      ? {}
      : { popular: sanitizeBoolean(popularValue, false) }),
  };
}

function sanitizeAdminOrder(
  id: string,
  data: Record<string, unknown> | undefined,
  fallback?: AdminOrder,
): AdminOrder {
  const baseFallback =
    fallback ??
    mockAdminOrders.find((order) => order.id === id) ??
    mockAdminOrders[0];
  const orderData = (data ?? {}) as Record<string, unknown>;
  const resolvedIssue =
    orderData.issue === null
      ? null
      : sanitizeString(orderData.issue, baseFallback?.issue ?? "") || null;

  return {
    id: sanitizeString(orderData.id, id),
    customer: sanitizeString(
      orderData.customer,
      baseFallback?.customer ?? "Customer",
    ),
    restaurantId: sanitizeString(
      orderData.restaurantId,
      baseFallback?.restaurantId ?? "",
    ),
    restaurant: sanitizeString(
      orderData.restaurant,
      sanitizeString(
        orderData.restaurantName,
        baseFallback?.restaurant ?? "Restaurant",
      ),
    ),
    total: parseCurrency(
      orderData.totalAmount ?? orderData.total,
      baseFallback?.total ?? "$0.00",
    ),
    status: resolveAdminOrderStatus(orderData, baseFallback),
    placedAt: sanitizeString(
      orderData.placedAt,
      typeof orderData.createdAt === "string"
        ? orderData.createdAt
        : (baseFallback?.placedAt ?? "Just now"),
    ),
    eta: sanitizeString(orderData.eta, baseFallback?.eta ?? "18 min"),
    driver: sanitizeString(
      orderData.driver,
      sanitizeString(
        orderData.driverName,
        baseFallback?.driver ?? "Unassigned",
      ),
    ),
    issue: resolvedIssue,
  };
}

function sanitizeRestaurant(
  id: string,
  data: Partial<AdminRestaurant> | undefined,
  fallback?: AdminRestaurant,
): AdminRestaurant {
  const baseFallback =
    fallback ??
    mockAdminRestaurants.find((restaurant) => restaurant.id === id) ??
    mockAdminRestaurants[0];

  const fallbackMenuItems = baseFallback?.menuItems ?? [];
  const storedMenuItems = Array.isArray(data?.menuItems) ? data.menuItems : [];
  const mergedMenuItems = fallbackMenuItems.map((fallbackItem, index) => {
    const storedItem = storedMenuItems.find(
      (item) => item?.id === fallbackItem.id,
    );
    return sanitizeMenuItem(
      storedItem,
      fallbackItem ??
        ({
          id: `item-${index}`,
          name: "Menu Item",
          price: "$0.00",
          available: true,
        } as AdminRestaurantMenuItem),
    );
  });

  const extraStoredItems = storedMenuItems
    .filter(
      (item) =>
        item?.id &&
        !fallbackMenuItems.some((fallbackItem) => fallbackItem.id === item.id),
    )
    .map((item, index) =>
      sanitizeMenuItem(item, {
        id: item?.id ?? `extra-item-${index}`,
        name: "Menu Item",
        price: "$0.00",
        available: true,
      }),
    );

  return {
    id: sanitizeString(data?.id, id),
    name: sanitizeString(data?.name, baseFallback?.name ?? "Restaurant"),
    cuisine: sanitizeString(data?.cuisine, baseFallback?.cuisine ?? "General"),
    status:
      data?.status === "Live" ||
      data?.status === "Needs Approval" ||
      data?.status === "Busy"
        ? data.status
        : (baseFallback?.status ?? "Needs Approval"),
    avgPrepTime: sanitizeString(
      data?.avgPrepTime,
      baseFallback?.avgPrepTime ?? "20 min",
    ),
    manager: sanitizeString(data?.manager, baseFallback?.manager ?? "Manager"),
    menuItems:
      mergedMenuItems.length > 0
        ? [...mergedMenuItems, ...extraStoredItems]
        : [...fallbackMenuItems],
  };
}

function sanitizeFeedback(
  id: string,
  data: Partial<AdminFeedback> | undefined,
  fallback?: AdminFeedback,
): AdminFeedback {
  const baseFallback =
    fallback ??
    mockAdminFeedback.find((entry) => entry.id === id) ??
    mockAdminFeedback[0];

  return {
    id: sanitizeString(data?.id, id),
    restaurantId: sanitizeString(
      data?.restaurantId,
      baseFallback?.restaurantId ?? "",
    ),
    restaurant: sanitizeString(
      data?.restaurant,
      baseFallback?.restaurant ?? "Restaurant",
    ),
    rating:
      typeof data?.rating === "number" && Number.isFinite(data.rating)
        ? data.rating
        : (baseFallback?.rating ?? 5),
    category:
      data?.category === "Delivery" ||
      data?.category === "Food Quality" ||
      data?.category === "Packaging" ||
      data?.category === "Support"
        ? data.category
        : (baseFallback?.category ?? "Support"),
    author: sanitizeString(data?.author, baseFallback?.author ?? "Anonymous"),
    text: sanitizeString(data?.text, baseFallback?.text ?? ""),
    createdAt: sanitizeString(
      data?.createdAt,
      baseFallback?.createdAt ?? "Just now",
    ),
    flagged: sanitizeBoolean(data?.flagged, baseFallback?.flagged ?? false),
  };
}

function sanitizeDriver(
  id: string,
  data: Partial<DriverProfile> | undefined,
  fallback?: DriverProfile,
): DriverProfile {
  const baseFallback =
    fallback ??
    mockDriverProfiles.find((driver) => driver.id === id) ??
    mockDriverProfiles[0];

  return {
    id: sanitizeString(data?.id, id),
    name: sanitizeString(data?.name, baseFallback?.name ?? "Driver"),
    vehicle: sanitizeString(data?.vehicle, baseFallback?.vehicle ?? "Vehicle"),
    zone: sanitizeString(data?.zone, baseFallback?.zone ?? "Zone"),
    status:
      data?.status === "Available" ||
      data?.status === "Delivering" ||
      data?.status === "Offline"
        ? data.status
        : (baseFallback?.status ?? "Offline"),
  };
}

async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  documents: T[],
) {
  const collectionRef = firestore().collection(collectionName);
  const snapshot = await collectionRef.get();
  const existingIds = new Set(snapshot.docs.map((doc) => doc.id));
  const missingDocuments = documents.filter(
    (document) => !existingIds.has(document.id),
  );

  if (missingDocuments.length === 0) {
    return false;
  }

  const batch = firestore().batch();
  missingDocuments.forEach((document) => {
    batch.set(collectionRef.doc(document.id), document, { merge: true });
  });
  await batch.commit();

  return true;
}

export async function ensureAdminSeedData(): Promise<AdminSeedResult> {
  try {
    const [ordersSeeded, restaurantsSeeded, feedbackSeeded, driversSeeded] =
      await Promise.all([
        seedCollectionIfEmpty(ORDERS_COLLECTION, mockAdminOrders),
        seedCollectionIfEmpty(RESTAURANTS_COLLECTION, mockAdminRestaurants),
        seedCollectionIfEmpty(FEEDBACK_COLLECTION, mockAdminFeedback),
        seedCollectionIfEmpty(DRIVERS_COLLECTION, mockDriverProfiles),
      ]);

    return {
      ordersSeeded,
      restaurantsSeeded,
      feedbackSeeded,
      driversSeeded,
    };
  } catch (error) {
    if (isPermissionDenied(error)) {
      return {
        ordersSeeded: false,
        restaurantsSeeded: false,
        feedbackSeeded: false,
        driversSeeded: false,
      };
    }

    throw error;
  }
}

export function subscribeToAdminOrders(
  onData: (orders: AdminOrder[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackMap = new Map(mockAdminOrders.map((item) => [item.id, item]));

  return firestore()
    .collection(ORDERS_COLLECTION)
    .onSnapshot(
      (snapshot) => {
        const orders = snapshot.docs.map((doc) =>
          sanitizeAdminOrder(
            doc.id,
            doc.data() as Record<string, unknown>,
            fallbackMap.get(doc.id),
          ),
        );

        onData(orders.length > 0 ? orders : mockAdminOrders);
      },
      (error) => {
        onData(mockAdminOrders);
        if (!isPermissionDenied(error)) {
          onError?.(error);
        }
      },
    );
}

export function subscribeToAdminRestaurants(
  onData: (restaurants: AdminRestaurant[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackMap = new Map(
    mockAdminRestaurants.map((item) => [item.id, item]),
  );

  return firestore()
    .collection(RESTAURANTS_COLLECTION)
    .onSnapshot(
      (snapshot) => {
        const restaurants = snapshot.docs.map((doc) =>
          sanitizeRestaurant(
            doc.id,
            doc.data() as Partial<AdminRestaurant>,
            fallbackMap.get(doc.id),
          ),
        );

        onData(restaurants.length > 0 ? restaurants : mockAdminRestaurants);
      },
      (error) => {
        onData(mockAdminRestaurants);
        if (!isPermissionDenied(error)) {
          onError?.(error);
        }
      },
    );
}

export function subscribeToAdminFeedback(
  onData: (feedback: AdminFeedback[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackMap = new Map(mockAdminFeedback.map((item) => [item.id, item]));

  return firestore()
    .collection(FEEDBACK_COLLECTION)
    .onSnapshot(
      (snapshot) => {
        const feedback = snapshot.docs.map((doc) =>
          sanitizeFeedback(
            doc.id,
            doc.data() as Partial<AdminFeedback>,
            fallbackMap.get(doc.id),
          ),
        );

        onData(feedback.length > 0 ? feedback : mockAdminFeedback);
      },
      (error) => {
        onData(mockAdminFeedback);
        if (!isPermissionDenied(error)) {
          onError?.(error);
        }
      },
    );
}

export function subscribeToDriverProfiles(
  onData: (drivers: DriverProfile[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackMap = new Map(
    mockDriverProfiles.map((item) => [item.id, item]),
  );

  return firestore()
    .collection(DRIVERS_COLLECTION)
    .onSnapshot(
      (snapshot) => {
        const drivers = snapshot.docs.map((doc) =>
          sanitizeDriver(
            doc.id,
            doc.data() as Partial<DriverProfile>,
            fallbackMap.get(doc.id),
          ),
        );

        onData(drivers.length > 0 ? drivers : mockDriverProfiles);
      },
      (error) => {
        onData(mockDriverProfiles);
        if (!isPermissionDenied(error)) {
          onError?.(error);
        }
      },
    );
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
): Promise<void> {
  await firestore()
    .collection(ORDERS_COLLECTION)
    .doc(orderId)
    .set(
      {
        status: ADMIN_ORDER_STATUS_TO_ORDER_STATUS[status],
        adminStatus: status,
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
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function approveRestaurant(restaurantId: string): Promise<void> {
  await firestore().collection(RESTAURANTS_COLLECTION).doc(restaurantId).set(
    {
      status: "Live",
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function toggleRestaurantMenuItemAvailability(
  restaurantId: string,
  menuItemId: string,
): Promise<void> {
  const restaurantRef = firestore()
    .collection(RESTAURANTS_COLLECTION)
    .doc(restaurantId);
  const snapshot = await restaurantRef.get();
  const restaurant = sanitizeRestaurant(
    restaurantId,
    snapshot.data() as Partial<AdminRestaurant> | undefined,
    mockAdminRestaurants.find((entry) => entry.id === restaurantId),
  );

  const menuItems = restaurant.menuItems.map((item) =>
    item.id === menuItemId ? { ...item, available: !item.available } : item,
  );

  await restaurantRef.set(
    {
      menuItems,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateRestaurantMenuItemPrice(
  restaurantId: string,
  menuItemId: string,
  price: string,
): Promise<void> {
  const restaurantRef = firestore()
    .collection(RESTAURANTS_COLLECTION)
    .doc(restaurantId);
  const snapshot = await restaurantRef.get();
  const restaurant = sanitizeRestaurant(
    restaurantId,
    snapshot.data() as Partial<AdminRestaurant> | undefined,
    mockAdminRestaurants.find((entry) => entry.id === restaurantId),
  );

  const menuItems = restaurant.menuItems.map((item) =>
    item.id === menuItemId
      ? { ...item, price: parseCurrency(price, item.price) }
      : item,
  );

  await restaurantRef.set(
    {
      menuItems,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateRestaurantPrepTime(
  restaurantId: string,
  prepTime: string,
): Promise<void> {
  await firestore().collection(RESTAURANTS_COLLECTION).doc(restaurantId).set(
    {
      avgPrepTime: prepTime,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function claimDriverAssignment(
  orderId: string,
  driverId: string,
): Promise<void> {
  const driver = sanitizeDriver(
    driverId,
    (
      await firestore().collection(DRIVERS_COLLECTION).doc(driverId).get()
    ).data() as Partial<DriverProfile> | undefined,
    mockDriverProfiles.find((entry) => entry.id === driverId),
  );

  const batch = firestore().batch();
  const updatedAt = firestore.FieldValue.serverTimestamp();

  batch.set(
    firestore().collection(ORDERS_COLLECTION).doc(orderId),
    {
      status: ADMIN_ORDER_STATUS_TO_ORDER_STATUS["Ready for Driver"],
      adminStatus: "Ready for Driver",
      driver: driver.name,
      driverId: driver.id,
      driverName: driver.name,
      eta: "Pickup pending",
      issue: null,
      updatedAt,
    },
    { merge: true },
  );

  batch.set(
    firestore().collection(DRIVERS_COLLECTION).doc(driver.id),
    {
      status: "Delivering",
      updatedAt,
    },
    { merge: true },
  );

  await batch.commit();
}

export async function completeDriverDelivery(
  orderId: string,
  driverId?: string,
): Promise<void> {
  const batch = firestore().batch();
  const updatedAt = firestore.FieldValue.serverTimestamp();

  batch.set(
    firestore().collection(ORDERS_COLLECTION).doc(orderId),
    {
      status: ADMIN_ORDER_STATUS_TO_ORDER_STATUS.Completed,
      adminStatus: "Completed",
      eta: "Delivered",
      issue: null,
      updatedAt,
    },
    { merge: true },
  );

  if (driverId) {
    batch.set(
      firestore().collection(DRIVERS_COLLECTION).doc(driverId),
      {
        status: "Available",
        updatedAt,
      },
      { merge: true },
    );
  }

  await batch.commit();
}

export {
  ADMIN_ORDER_STATUS_TO_ORDER_STATUS,
  DRIVERS_COLLECTION,
  FEEDBACK_COLLECTION,
  ORDER_STATUS_TO_ADMIN_STATUS,
  ORDERS_COLLECTION,
  RESTAURANTS_COLLECTION
};

