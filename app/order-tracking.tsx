import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FadeInView from "./FadeInView";
//import { getOrder, subscribeToOrderUpdates } from "./Firebase/orders";
import { subscribeToOrderUpdates } from "./Firebase/orders";
import { Order } from "./Firebase/types";
import { colors, typography } from "./theme";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: "clock" },
  { key: "confirmed", label: "Order Confirmed", icon: "check-circle" },
  { key: "preparing", label: "Preparing Food", icon: "chef-hat" },
  { key: "ready", label: "Ready for Pickup", icon: "package" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "truck" },
  { key: "delivered", label: "Delivered", icon: "check-circle" },
] as const;

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    // Load initial order data
    // const loadOrder = async () => {
    //   try {
    //     const orderData = await getOrder(orderId);
    //     if (orderData) {
    //       setOrder(orderData);
    //     } else {
    //       setError("Order not found");
    //     }
    //   } catch (err: any) {
    //     console.error("Error loading order:", err);
    //     setError("Failed to load order details");
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // loadOrder();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToOrderUpdates(
      orderId,
      (updatedOrder: Order) => {
        console.log("Order update received:", updatedOrder);
        setOrder(updatedOrder);
      },
    );

    return unsubscribe;
  }, [orderId]);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorTitle}>Unable to Load Order</Text>
          <Text style={styles.errorMessage}>{error || "Order not found"}</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex(order.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={0} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={40} style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{order.id.slice(-8)}</Text>
            <Text style={styles.orderStatus}>
              {statusSteps[currentStatusIndex]?.label || order.status}
            </Text>
          </View>

          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{order.restaurantName}</Text>
            <Text style={styles.orderTime}>
              Ordered at {new Date(order.createdAt as any).toLocaleTimeString()}
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={80} style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Order Progress</Text>

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const statusColor = getStatusColor(order.status, step.key);

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
                      {order.status === "preparing" &&
                        "Your food is being prepared"}
                      {order.status === "ready" &&
                        "Your order is ready for pickup"}
                      {order.status === "out_for_delivery" &&
                        "Your order is on the way"}
                      {order.status === "delivered" &&
                        "Your order has been delivered"}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </FadeInView>

        <FadeInView delay={120} style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Order Details</Text>

          {order.items.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ${order.subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${order.taxes.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              ${order.deliveryFee.toFixed(2)}
            </Text>
          </View>

          {order.tip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Driver Tip</Text>
              <Text style={styles.summaryValue}>${order.tip.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </FadeInView>

        {order.deliveryAddress && (
          <FadeInView delay={160} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Feather name="map-pin" size={20} color={colors.primary} />
              <Text style={styles.addressTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.addressText}>{order.deliveryAddress}</Text>
            {order.deliveryNote && (
              <Text style={styles.deliveryNote}>
                Note: {order.deliveryNote}
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
