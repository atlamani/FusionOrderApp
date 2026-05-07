import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import {
  adminFeedback as seedAdminFeedback,
  adminOrders as seedAdminOrders,
  adminRestaurants as seedAdminRestaurants,
  driverProfiles as seedDriverProfiles,
  unassignedDriverLabel,
} from "../appData";
import type {
  AdminFeedback,
  AdminOrder,
  AdminOrderStatus,
  AdminRestaurant,
  AdminRestaurantMenuItem,
  AdminSeedResult,
  DriverProfile,
  OrderStatus,
} from "./types";

type Unsubscribe = () => void;
type FirestoreQuery =
  FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>;
type StaffScope =
  | { mode: "admin" }
  | { mode: "restaurant"; restaurantId: string }
  | { mode: "googleAggregator" }
  | { mode: "driver"; driverId: string }
  | { mode: "member" };
type StaffClaims = {
  admin?: unknown;
  restaurantId?: unknown;
  driverId?: unknown;
  googleAggregator?: unknown;
};

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

// School-project demo convenience: signing in with this email is treated
// as the Google aggregator even when the `googleAggregator: true` custom
// claim hasn't been provisioned yet.
const GOOGLE_AGGREGATOR_DEMO_EMAILS = new Set(["google@fusionyum.com"]);

function isGoogleAggregatorDemoEmail(email: string | null | undefined) {
  if (!email) return false;
  return GOOGLE_AGGREGATOR_DEMO_EMAILS.has(email.trim().toLowerCase());
}

async function getStaffScope(): Promise<StaffScope> {
  const user = auth().currentUser;
  if (!user) {
    return { mode: "member" };
  }

  const tokenResult = await user.getIdTokenResult();
  const claims = tokenResult.claims as StaffClaims;

  if (claims.admin === true) {
    return { mode: "admin" };
  }

  if (
    claims.googleAggregator === true ||
    isGoogleAggregatorDemoEmail(user.email)
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

function subscribeWithScope(
  setup: () => Promise<Unsubscribe | undefined>,
  onError?: (error: unknown) => void,
): Unsubscribe {
  let unsubscribe: Unsubscribe | undefined;
  let cancelled = false;

  setup()
    .then((nextUnsubscribe) => {
      if (cancelled) {
        nextUnsubscribe?.();
        return;
      }

      unsubscribe = nextUnsubscribe;
    })
    .catch((error) => {
      if (!isPermissionDenied(error)) {
        onError?.(error);
      }
    });

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

function getDriverName(driverId: string) {
  return (
    seedDriverProfiles.find((driver) => driver.id === driverId)?.name ?? ""
  );
}

function getSeedOrdersForScope(scope: StaffScope) {
  if (scope.mode === "admin") {
    return seedAdminOrders;
  }

  if (scope.mode === "googleAggregator") {
    // The aggregator account fulfills any order whose restaurantId came
    // from Google Places (we tag those with a `google-` prefix).
    return seedAdminOrders.filter((order) =>
      order.restaurantId.startsWith("google-"),
    );
  }

  if (scope.mode === "restaurant") {
    return seedAdminOrders.filter(
      (order) => order.restaurantId === scope.restaurantId,
    );
  }

  if (scope.mode === "driver") {
    const driverName = getDriverName(scope.driverId);

    return seedAdminOrders.filter(
      (order) =>
        order.driverId === scope.driverId ||
        order.driver === driverName ||
        (order.status === "Ready for Driver" &&
          (order.driverId == null || order.driver === unassignedDriverLabel)),
    );
  }

  return [];
}

function getSeedRestaurantsForScope(scope: StaffScope) {
  if (scope.mode === "admin") {
    return seedAdminRestaurants;
  }

  if (scope.mode === "restaurant") {
    return seedAdminRestaurants.filter(
      (restaurant) => restaurant.id === scope.restaurantId,
    );
  }

  return [];
}

function getSeedFeedbackForScope(scope: StaffScope) {
  if (scope.mode === "admin") {
    return seedAdminFeedback;
  }

  if (scope.mode === "restaurant") {
    return seedAdminFeedback.filter(
      (feedback) => feedback.restaurantId === scope.restaurantId,
    );
  }

  return [];
}

function getSeedDriversForScope(scope: StaffScope) {
  if (scope.mode === "admin") {
    return seedDriverProfiles;
  }

  if (scope.mode === "driver") {
    return seedDriverProfiles.filter((driver) => driver.id === scope.driverId);
  }

  return [];
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
    description: sanitizeString(item?.description, fallback.description ?? ""),
    category: sanitizeString(item?.category, fallback.category ?? ""),
    isNew: sanitizeBoolean(item?.isNew, fallback.isNew ?? false),
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
    seedAdminOrders.find((order) => order.id === id) ??
    seedAdminOrders[0];
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
        baseFallback?.driver ?? unassignedDriverLabel,
      ),
    ),
    driverId:
      orderData.driverId === null
        ? null
        : sanitizeString(orderData.driverId, baseFallback?.driverId ?? "") ||
          null,
    driverName:
      orderData.driverName === null
        ? null
        : sanitizeString(
            orderData.driverName,
            baseFallback?.driverName ?? baseFallback?.driver ?? "",
          ) || null,
    deliveryAddress: sanitizeString(
      orderData.deliveryAddress,
      baseFallback?.deliveryAddress ?? "",
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
    seedAdminRestaurants.find((restaurant) => restaurant.id === id) ??
    seedAdminRestaurants[0];

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
    seedAdminFeedback.find((entry) => entry.id === id) ??
    seedAdminFeedback[0];

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
    seedDriverProfiles.find((driver) => driver.id === id) ??
    seedDriverProfiles[0];

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
        seedCollectionIfEmpty(ORDERS_COLLECTION, seedAdminOrders),
        seedCollectionIfEmpty(RESTAURANTS_COLLECTION, seedAdminRestaurants),
        seedCollectionIfEmpty(FEEDBACK_COLLECTION, seedAdminFeedback),
        seedCollectionIfEmpty(DRIVERS_COLLECTION, seedDriverProfiles),
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

function subscribeToOrdersQuery(
  query: FirestoreQuery,
  fallbackOrders: AdminOrder[],
  onData: (orders: AdminOrder[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackMap = new Map(fallbackOrders.map((item) => [item.id, item]));

  return query.onSnapshot(
    (snapshot) => {
      const orders = snapshot.docs.map((doc) =>
        sanitizeAdminOrder(
          doc.id,
          doc.data() as Record<string, unknown>,
          fallbackMap.get(doc.id),
        ),
      );

      onData(orders.length > 0 ? orders : fallbackOrders);
    },
    (error) => {
      onData(fallbackOrders);
      if (isPermissionDenied(error)) {
        // Surface the silent failure so devs can spot a missing custom
        // claim or undeployed Firestore rules instead of seeing seed
        // orders forever. The UI still falls back so demos keep working.
        console.warn(
          "[admin] Order subscription denied by Firestore rules. " +
            "Confirm the signed-in account has the admin / restaurantId / " +
            "googleAggregator / driverId custom claim set, and that " +
            "firestore.rules has been deployed (firebase deploy --only firestore:rules).",
        );
      } else {
        onError?.(error);
      }
    },
  );
}

function subscribeToDriverOrders(
  driverId: string,
  onData: (orders: AdminOrder[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackOrders = getSeedOrdersForScope({ mode: "driver", driverId });
  const fallbackMap = new Map(fallbackOrders.map((item) => [item.id, item]));
  const readyOrders = new Map<string, AdminOrder>();
  const assignedOrders = new Map<string, AdminOrder>();
  let readyLoaded = false;
  let assignedLoaded = false;

  const emit = () => {
    if (!readyLoaded || !assignedLoaded) {
      return;
    }

    const merged = new Map<string, AdminOrder>();
    readyOrders.forEach((order, id) => merged.set(id, order));
    assignedOrders.forEach((order, id) => merged.set(id, order));
    const orders = [...merged.values()];
    onData(orders.length > 0 ? orders : fallbackOrders);
  };

  const applySnapshot = (
    target: Map<string, AdminOrder>,
    snapshot: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ) => {
    target.clear();
    snapshot.docs.forEach((doc) => {
      target.set(
        doc.id,
        sanitizeAdminOrder(
          doc.id,
          doc.data() as Record<string, unknown>,
          fallbackMap.get(doc.id),
        ),
      );
    });
  };

  const handleError = (error: unknown) => {
    onData(fallbackOrders);
    if (!isPermissionDenied(error)) {
      onError?.(error);
    }
  };

  const readyUnsubscribe = firestore()
    .collection(ORDERS_COLLECTION)
    .where("driverId", "==", null)
    .where("status", "in", ["ready", "Ready for Driver"])
    .onSnapshot(
      (snapshot) => {
        readyLoaded = true;
        applySnapshot(readyOrders, snapshot);
        emit();
      },
      handleError,
    );

  const assignedUnsubscribe = firestore()
    .collection(ORDERS_COLLECTION)
    .where("driverId", "==", driverId)
    .onSnapshot(
      (snapshot) => {
        assignedLoaded = true;
        applySnapshot(assignedOrders, snapshot);
        emit();
      },
      handleError,
    );

  return () => {
    readyUnsubscribe();
    assignedUnsubscribe();
  };
}

function subscribeToRestaurantsQuery(
  query: FirestoreQuery,
  fallbackRestaurants: AdminRestaurant[],
  onData: (restaurants: AdminRestaurant[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackMap = new Map(
    fallbackRestaurants.map((item) => [item.id, item]),
  );

  return query.onSnapshot(
    (snapshot) => {
      const restaurants = snapshot.docs.map((doc) =>
        sanitizeRestaurant(
          doc.id,
          doc.data() as Partial<AdminRestaurant>,
          fallbackMap.get(doc.id),
        ),
      );

      onData(restaurants.length > 0 ? restaurants : fallbackRestaurants);
    },
    (error) => {
      onData(fallbackRestaurants);
      if (!isPermissionDenied(error)) {
        onError?.(error);
      }
    },
  );
}

function subscribeToFeedbackQuery(
  query: FirestoreQuery,
  fallbackFeedback: AdminFeedback[],
  onData: (feedback: AdminFeedback[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackMap = new Map(fallbackFeedback.map((item) => [item.id, item]));

  return query.onSnapshot(
    (snapshot) => {
      const feedback = snapshot.docs.map((doc) =>
        sanitizeFeedback(
          doc.id,
          doc.data() as Partial<AdminFeedback>,
          fallbackMap.get(doc.id),
        ),
      );

      onData(feedback.length > 0 ? feedback : fallbackFeedback);
    },
    (error) => {
      onData(fallbackFeedback);
      if (!isPermissionDenied(error)) {
        onError?.(error);
      }
    },
  );
}

function subscribeToDriversQuery(
  query: FirestoreQuery,
  fallbackDrivers: DriverProfile[],
  onData: (drivers: DriverProfile[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const fallbackMap = new Map(fallbackDrivers.map((item) => [item.id, item]));

  return query.onSnapshot(
    (snapshot) => {
      const drivers = snapshot.docs.map((doc) =>
        sanitizeDriver(
          doc.id,
          doc.data() as Partial<DriverProfile>,
          fallbackMap.get(doc.id),
        ),
      );

      onData(drivers.length > 0 ? drivers : fallbackDrivers);
    },
    (error) => {
      onData(fallbackDrivers);
      if (!isPermissionDenied(error)) {
        onError?.(error);
      }
    },
  );
}

export function subscribeToAdminOrders(
  onData: (orders: AdminOrder[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return subscribeWithScope(async () => {
    const scope = await getStaffScope();
    const fallbackOrders = getSeedOrdersForScope(scope);

    if (scope.mode === "admin") {
      return subscribeToOrdersQuery(
        firestore().collection(ORDERS_COLLECTION),
        fallbackOrders,
        onData,
        onError,
      );
    }

    if (scope.mode === "restaurant") {
      return subscribeToOrdersQuery(
        firestore()
          .collection(ORDERS_COLLECTION)
          .where("restaurantId", "==", scope.restaurantId),
        fallbackOrders,
        onData,
        onError,
      );
    }

    if (scope.mode === "googleAggregator") {
      // Range query selects every order whose restaurantId starts with
      // "google-". The upper bound is just past "google." in lexicographic
      // order, so any "google-XXX" string falls below it. Using "google."
      // (period) as the upper bound is simpler and encoding-safe.
      return subscribeToOrdersQuery(
        firestore()
          .collection(ORDERS_COLLECTION)
          .where("restaurantId", ">=", "google-")
          .where("restaurantId", "<", "google."),
        fallbackOrders,
        onData,
        onError,
      );
    }

    if (scope.mode === "driver") {
      return subscribeToDriverOrders(scope.driverId, onData, onError);
    }

    onData(fallbackOrders);
    return undefined;
  }, onError);
}

export function subscribeToAdminRestaurants(
  onData: (restaurants: AdminRestaurant[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return subscribeWithScope(async () => {
    const scope = await getStaffScope();
    const fallbackRestaurants = getSeedRestaurantsForScope(scope);

    if (scope.mode === "admin") {
      return subscribeToRestaurantsQuery(
        firestore().collection(RESTAURANTS_COLLECTION),
        fallbackRestaurants,
        onData,
        onError,
      );
    }

    if (scope.mode === "restaurant") {
      const fallback = fallbackRestaurants[0];

      return firestore()
        .collection(RESTAURANTS_COLLECTION)
        .doc(scope.restaurantId)
        .onSnapshot(
          (snapshot) => {
            onData(
              snapshot.exists()
                ? [
                    sanitizeRestaurant(
                      snapshot.id,
                      snapshot.data() as Partial<AdminRestaurant>,
                      fallback,
                    ),
                  ]
                : fallbackRestaurants,
            );
          },
          (error) => {
            onData(fallbackRestaurants);
            if (!isPermissionDenied(error)) {
              onError?.(error);
            }
          },
        );
    }

    onData(fallbackRestaurants);
    return undefined;
  }, onError);
}

export function subscribeToAdminFeedback(
  onData: (feedback: AdminFeedback[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return subscribeWithScope(async () => {
    const scope = await getStaffScope();
    const fallbackFeedback = getSeedFeedbackForScope(scope);

    if (scope.mode === "admin") {
      return subscribeToFeedbackQuery(
        firestore().collection(FEEDBACK_COLLECTION),
        fallbackFeedback,
        onData,
        onError,
      );
    }

    if (scope.mode === "restaurant") {
      return subscribeToFeedbackQuery(
        firestore()
          .collection(FEEDBACK_COLLECTION)
          .where("restaurantId", "==", scope.restaurantId),
        fallbackFeedback,
        onData,
        onError,
      );
    }

    onData(fallbackFeedback);
    return undefined;
  }, onError);
}

export function subscribeToDriverProfiles(
  onData: (drivers: DriverProfile[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  return subscribeWithScope(async () => {
    const scope = await getStaffScope();
    const fallbackDrivers = getSeedDriversForScope(scope);

    if (scope.mode === "admin") {
      return subscribeToDriversQuery(
        firestore().collection(DRIVERS_COLLECTION),
        fallbackDrivers,
        onData,
        onError,
      );
    }

    if (scope.mode === "driver") {
      const fallback = fallbackDrivers[0];

      return firestore()
        .collection(DRIVERS_COLLECTION)
        .doc(scope.driverId)
        .onSnapshot(
          (snapshot) => {
            onData(
              snapshot.exists()
                ? [
                    sanitizeDriver(
                      snapshot.id,
                      snapshot.data() as Partial<DriverProfile>,
                      fallback,
                    ),
                  ]
                : fallbackDrivers,
            );
          },
          (error) => {
            onData(fallbackDrivers);
            if (!isPermissionDenied(error)) {
              onError?.(error);
            }
          },
        );
    }

    onData(fallbackDrivers);
    return undefined;
  }, onError);
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
    seedAdminRestaurants.find((entry) => entry.id === restaurantId),
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

export async function saveRestaurantMenuItems(
  restaurantId: string,
  menuItems: AdminRestaurantMenuItem[],
): Promise<void> {
  await firestore().collection(RESTAURANTS_COLLECTION).doc(restaurantId).set(
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
    seedAdminRestaurants.find((entry) => entry.id === restaurantId),
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
    seedDriverProfiles.find((entry) => entry.id === driverId),
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

