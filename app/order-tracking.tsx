import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FadeInView from "./FadeInView";
import { getOrder, subscribeToOrderUpdates } from "./Firebase/orders";
import { Order, OrderStatus } from "./Firebase/types";
import { useAppState, type CustomerOrder } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getDeliveryCoordinate,
  getRestaurantCoordinate,
} from "./services/mapCoords";
import { colors, typography } from "./theme";
import { MapPreview } from "../components/MapPreview";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: "clock" },
  { key: "confirmed", label: "Order Confirmed", icon: "check-circle" },
  { key: "preparing", label: "Preparing Food", icon: "coffee" },
  { key: "ready", label: "Ready for Pickup", icon: "package" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "truck" },
  { key: "delivered", label: "Delivered", icon: "check-circle" },
] as const;

type TrackingItem = {
  name: string;
  quantity: number;
  price?: number;
};

type TrackingOrder = {
  id: string;
  status: OrderStatus;
  restaurantName: string;
  orderedAt: string;
  items: TrackingItem[];
  subtotal?: number;
  taxes?: number;
  deliveryFee?: number;
  tip?: number;
  total: number | string;
  deliveryAddress?: string;
  deliveryNote?: string;
};

const adminStatusToTrackingStatus = (status?: string): OrderStatus => {
  switch (status) {
    case "Preparing":
      return "preparing";
    case "Ready for Driver":
      return "ready";
    case "Out for Delivery":
      return "out_for_delivery";
    case "Completed":
      return "delivered";
    case "Pending":
    default:
      return "pending";
  }
};

const formatMoney = (value: number | string) =>
  typeof value === "number" ? `$${value.toFixed(2)}` : value;

const parseCustomerItem = (item: string): TrackingItem => {
  const match = item.match(/\sx(\d+)$/i);
  return {
    name: item.replace(/\sx\d+$/i, "").trim(),
    quantity: match ? Number.parseInt(match[1], 10) : 1,
  };
};

const formatOrderTime = (value: Order["createdAt"]) => {
  if (!value) {
    return "Just now";
  }

  if (value instanceof Date) {
    return value.toLocaleTimeString();
  }

  if (typeof value === "string" || typeof value === "number") {
    return new Date(value).toLocaleTimeString();
  }

  const timestamp = value as { toDate?: () => Date };
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleTimeString();
  }

  return "Just now";
};

const fromFirebaseOrder = (order: Order): TrackingOrder => ({
  id: order.id,
  status: order.status,
  restaurantName: order.restaurantName,
  orderedAt: formatOrderTime(order.createdAt),
  items: order.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  })),
  subtotal: order.subtotal,
  taxes: order.taxes,
  deliveryFee: order.deliveryFee,
  tip: order.tip,
  total: order.total ?? order.totalAmount,
  deliveryAddress: order.deliveryAddress,
  deliveryNote: order.deliveryNote,
});

const fromCustomerOrder = (
  order: CustomerOrder,
  adminOrder: { status?: string } | undefined,
  fallbackAddress: string,
): TrackingOrder => ({
  id: order.id,
  status: adminStatusToTrackingStatus(adminOrder?.status),
  restaurantName: order.restaurant,
  orderedAt: order.placedAt,
  items: order.items.map(parseCustomerItem),
  total: order.total,
  deliveryAddress: order.address || fallbackAddress,
});

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const resolvedOrderId = Array.isArray(orderId) ? orderId[0] : orderId;
  const { adminOrders, currentOrder, profile, restaurants } = useAppState();
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localOrder = useMemo(() => {
    if (!resolvedOrderId || !currentOrder || currentOrder.id !== resolvedOrderId) {
      return null;
    }
    const matchingCurrentOrder = currentOrder;

    return fromCustomerOrder(
      matchingCurrentOrder,
      adminOrders.find((entry) => entry.id === matchingCurrentOrder.id),
      profile.address,
    );
  }, [adminOrders, currentOrder, profile.address, resolvedOrderId]);

  useEffect(() => {
    if (!resolvedOrderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    if (resolvedOrderId.startsWith("GUEST-")) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const loadLiveOrder = async () => {
      setLoading(!localOrder);
      setError(null);

      try {
        const initialOrder = await getOrder(resolvedOrderId);
        if (!isMounted) {
          return;
        }

        if (initialOrder) {
          setOrder(fromFirebaseOrder(initialOrder));
        }
        setLoading(false);

        unsubscribe = subscribeToOrderUpdates(
          resolvedOrderId,
          (updatedOrder: Order) => {
            if (!isMounted) {
              return;
            }
            setOrder(fromFirebaseOrder(updatedOrder));
            setLoading(false);
            setError(null);
          },
          () => {
            if (!isMounted) {
              return;
            }
            setLoading(false);
            if (!localOrder) {
              setError("Failed to load order details");
            }
          },
        );
      } catch (err: any) {
        console.error("Error loading order:", err);
        if (!isMounted) {
          return;
        }
        setLoading(false);
        if (!localOrder) {
          setError("Failed to load order details");
        }
      }
    };

    void loadLiveOrder();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [localOrder, resolvedOrderId]);

  const getCurrentStatusIndex = (status: OrderStatus): number => {
    return statusSteps.findIndex((step) => step.key === status);
  };

  const getStatusColor = (status: OrderStatus, stepKey: string): string => {
    const currentIndex = getCurrentStatusIndex(status);
    const stepIndex = statusSteps.findIndex((step) => step.key === stepKey);

    if (stepIndex < currentIndex) return colors.success;
    if (stepIndex === currentIndex) return colors.primary;
    return colors.text;
  };

  const displayOrder = order ?? localOrder;

  const orderRestaurant = useMemo(() => {
    if (!displayOrder?.restaurantName) return undefined;
    return restaurants.find(
      (entry) =>
        entry.name === displayOrder.restaurantName ||
        entry.id === displayOrder.restaurantName,
    );
  }, [displayOrder?.restaurantName, restaurants]);
  const pickupCoord = useMemo(
    () => getRestaurantCoordinate(orderRestaurant),
    [orderRestaurant],
  );
  const destinationCoord = useMemo(
    () => getDeliveryCoordinate(pickupCoord),
    [pickupCoord],
  );

  if (loading && !displayOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !displayOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorTitle}>Unable to Load Order</Text>
          <Text style={styles.errorMessage}>{error || "Order not found"}</Text>
          <Pressable style={styles.retryButton} onPress={() => goBackOrReplace("/activity")}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusIndex = Math.max(0, getCurrentStatusIndex(displayOrder.status));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={0} style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={16}
            style={styles.backButton}
            onPress={() => goBackOrReplace("/activity")}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={40} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{displayOrder.id.slice(-8)}</Text>
            <Text style={styles.orderStatus}>
              {statusSteps[currentStatusIndex]?.label || displayOrder.status}
            </Text>
          </View>

          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{displayOrder.restaurantName}</Text>
            <Text style={styles.orderTime}>
              Ordered at {displayOrder.orderedAt}
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={80} style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Order Progress</Text>

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const statusColor = getStatusColor(displayOrder.status, step.key);

            return (
              <View key={step.key} style={styles.stepContainer}>
                <View style={styles.stepIndicator}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: isCompleted
                          ? statusColor
                          : colors.background,
                      },
                    ]}
                  >
                    <Feather
                      name={step.icon as any}
                      size={16}
                      color={isCompleted ? colors.white : statusColor}
                    />
                  </View>
                  {index < statusSteps.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor:
                            index < currentStatusIndex
                              ? statusColor
                              : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: isCompleted ? statusColor : colors.textMuted,
                      },
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Text style={styles.stepDescription}>
                      {displayOrder.status === "preparing" &&
                        "Your food is being prepared"}
                      {displayOrder.status === "ready" &&
                        "Your order is ready for pickup"}
                      {displayOrder.status === "out_for_delivery" &&
                        "Your order is on the way"}
                      {displayOrder.status === "delivered" &&
                        "Your order has been delivered"}
                      {displayOrder.status === "pending" &&
                        "Your order is waiting for restaurant confirmation"}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </FadeInView>

        <FadeInView delay={120} style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Order Details</Text>

          {displayOrder.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              {typeof item.price === "number" ? (
                <Text style={styles.itemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              ) : null}
            </View>
          ))}

          <View style={styles.divider} />

          {typeof displayOrder.subtotal === "number" ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${displayOrder.subtotal.toFixed(2)}
              </Text>
            </View>
          ) : null}

          {typeof displayOrder.taxes === "number" ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${displayOrder.taxes.toFixed(2)}</Text>
            </View>
          ) : null}

          {typeof displayOrder.deliveryFee === "number" ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                ${displayOrder.deliveryFee.toFixed(2)}
              </Text>
            </View>
          ) : null}

          {typeof displayOrder.tip === "number" && displayOrder.tip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Driver Tip</Text>
              <Text style={styles.summaryValue}>${displayOrder.tip.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(displayOrder.total)}</Text>
          </View>
        </FadeInView>

        {displayOrder.deliveryAddress && (
          <FadeInView delay={160} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Feather name="map-pin" size={20} color={colors.primary} />
              <Text style={styles.addressTitle}>Delivery Address</Text>
            </View>
            <View style={styles.mapWrapper}>
              <MapPreview
                height={180}
                interactive={false}
                badge={
                  displayOrder.status === "out_for_delivery"
                    ? "On the way"
                    : displayOrder.status === "delivered"
                      ? "Delivered"
                      : "Tracking"
                }
                markers={[
                  {
                    coordinate: pickupCoord,
                    kind: "pickup",
                    label: displayOrder.restaurantName ?? "Restaurant",
                  },
                  {
                    coordinate: destinationCoord,
                    kind: "destination",
                    label: "You",
                  },
                ]}
              />
            </View>
            <Text style={styles.addressText}>{displayOrder.deliveryAddress}</Text>
            {displayOrder.deliveryNote && (
              <Text style={styles.deliveryNote}>
                Note: {displayOrder.deliveryNote}
              </Text>
            )}
          </FadeInView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.white,
  },
  content: {
    paddingTop: 110,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.text,
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
  },
  orderStatus: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  restaurantInfo: {
    marginBottom: 8,
  },
  restaurantName: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  orderTime: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  trackingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  trackingTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.text,
    marginBottom: 24,
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  stepIndicator: {
    alignItems: "center",
    marginRight: 16,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepLine: {
    width: 2,
    height: 32,
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontFamily: typography.display,
    fontSize: 16,
    marginBottom: 4,
  },
  stepDescription: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  detailsTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.text,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemName: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.text,
  },
  itemPrice: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.textMuted,
  },
  summaryValue: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
  },
  totalValue: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  addressTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
    marginLeft: 8,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  addressText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  deliveryNote: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});
