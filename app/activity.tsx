import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function ActivityScreen() {
  const { adminOrders, currentOrder, profile } = usePrototypeState();

  const liveOpsOrder = useMemo(
    () => adminOrders.find((order) => order.id === currentOrder?.id),
    [adminOrders, currentOrder?.id],
  );

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No active order</Text>
          <Text style={styles.emptyCopy}>Place an order to preview live tracking, support, and delivery updates.</Text>
          <Pressable style={styles.emptyButton} onPress={() => router.push("/home")}>
            <Text style={styles.emptyButtonText}>Browse Restaurants</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const activeStage =
    liveOpsOrder?.status === "Pending"
      ? 1
      : liveOpsOrder?.status === "Preparing"
        ? 2
        : liveOpsOrder?.status === "Ready for Driver"
          ? 2
          : liveOpsOrder?.status === "Out for Delivery"
            ? 3
            : liveOpsOrder?.status === "Completed"
              ? 4
              : 1;

  const statusLabel =
    liveOpsOrder?.status === "Pending"
      ? "Queued"
      : liveOpsOrder?.status === "Preparing"
        ? "Preparing"
        : liveOpsOrder?.status === "Ready for Driver"
          ? "Ready for Pickup"
          : liveOpsOrder?.status === "Out for Delivery"
            ? "Out for Delivery"
            : liveOpsOrder?.status === "Completed"
              ? "Delivered"
              : "In Progress";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>ACTIVITY</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.switcher}>
          <View style={styles.switcherActive}>
            <Text style={styles.switcherActiveText}>Track Order</Text>
          </View>
          <Pressable style={styles.switcherIdle} onPress={() => router.push("/activity-history")}>
            <Text style={styles.switcherIdleText}>Order History</Text>
          </Pressable>
        </FadeInView>

        <FadeInView delay={150} style={styles.mapCard}>
          <Text style={styles.liveBadge}>LIVE</Text>
          <View style={styles.routeLine} />
          <View style={styles.mapPin}>
            <Feather name={activeStage >= 3 ? "truck" : "map-pin"} size={18} color={colors.background} />
          </View>
        </FadeInView>

        <FadeInView delay={210} style={styles.infoCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Order #{currentOrder.id}</Text>
              <Text style={styles.orderPlaced}>{currentOrder.placedAt}</Text>
            </View>
            <View style={styles.statusPill}>
              <Feather name="clock" size={14} color={colors.primary} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>

          <Text style={styles.label}>From</Text>
          <Text style={styles.value}>{currentOrder.restaurant}</Text>

          <Text style={styles.label}>Items</Text>
          {currentOrder.items.map((item) => (
            <Text key={item} style={styles.itemRow}>
              - {item}
            </Text>
          ))}

          <View style={styles.detailRow}>
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={styles.detailText}>{currentOrder.eta}</Text>
          </View>

          {liveOpsOrder?.driver && liveOpsOrder.driver !== "Unassigned" ? (
            <View style={styles.detailRow}>
              <Feather name="truck" size={16} color={colors.primary} />
              <Text style={styles.detailText}>{`${liveOpsOrder.driver} is handling your delivery`}</Text>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={styles.detailText}>{profile.address}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{currentOrder.total}</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryAction} onPress={() => router.push(`/order-receipt?orderId=${currentOrder.id}`)}>
              <Text style={styles.secondaryActionText}>View Receipt</Text>
            </Pressable>
            <Pressable style={styles.primaryAction} onPress={() => router.push("/help-center?topic=order")}>
              <Text style={styles.primaryActionText}>Get Help</Text>
            </Pressable>
          </View>
        </FadeInView>

        <FadeInView delay={270} style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Status</Text>
          {currentOrder.statuses.map((status, index) => (
            <View key={status.id} style={styles.timelineRow}>
              <View style={[styles.timelineIcon, index < activeStage ? styles.timelineIconActive : undefined]}>
                <Feather
                  name={index < 2 ? "check-circle" : index === 2 ? "package" : "map-pin"}
                  size={16}
                  color={index < activeStage ? colors.background : colors.primary}
                />
              </View>
              <View style={styles.timelineCopy}>
                <Text style={styles.timelineLabel}>{status.title}</Text>
                <Text style={styles.timelineDetail}>{status.detail}</Text>
              </View>
            </View>
          ))}
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: { fontFamily: typography.display, fontSize: 28, color: colors.primary },
  emptyCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
  },
  emptyButton: {
    minWidth: 180,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyButtonText: { fontFamily: typography.display, fontSize: 15, color: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontFamily: typography.display, fontSize: 22, color: colors.primary },
  headerSpacer: { width: 40 },
  switcher: { flexDirection: "row", gap: 8 },
  switcherActive: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  switcherIdle: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  switcherActiveText: { fontFamily: typography.display, fontSize: 12, color: colors.background },
  switcherIdleText: { fontFamily: typography.display, fontSize: 12, color: colors.primary },
  mapCard: {
    height: 220,
    borderRadius: 18,
    backgroundColor: "#D8CFB7",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  liveBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
    color: colors.background,
    fontFamily: typography.display,
    fontSize: 11,
  },
  routeLine: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(58, 77, 57, 0.18)",
  },
  mapPin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  orderId: { fontFamily: typography.display, fontSize: 18, color: colors.primary },
  orderPlaced: { fontFamily: typography.body, fontSize: 12, color: colors.textMuted },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  statusText: { fontFamily: typography.display, fontSize: 11, color: colors.primary },
  label: { fontFamily: typography.body, fontSize: 11, color: colors.textMuted },
  value: { fontFamily: typography.display, fontSize: 16, color: colors.primary },
  itemRow: { fontFamily: typography.body, fontSize: 13, color: colors.text },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { flex: 1, fontFamily: typography.body, fontSize: 13, color: colors.text },
  totalRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontFamily: typography.display, fontSize: 16, color: colors.primary },
  totalValue: { fontFamily: typography.display, fontSize: 18, color: colors.primary },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  primaryAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionText: { fontFamily: typography.display, fontSize: 13, color: colors.background },
  secondaryAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryActionText: { fontFamily: typography.display, fontSize: 13, color: colors.primary },
  timelineCard: {
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  timelineTitle: { fontFamily: typography.display, fontSize: 18, color: colors.primary },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineIconActive: { backgroundColor: colors.surface },
  timelineCopy: { flex: 1, gap: 2 },
  timelineLabel: { fontFamily: typography.display, fontSize: 14, color: colors.primary },
  timelineDetail: { fontFamily: typography.body, fontSize: 12, color: colors.textMuted },
});
