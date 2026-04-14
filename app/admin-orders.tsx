import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

const orderFilters = [
  "All",
  "Pending",
  "Preparing",
  "Ready for Driver",
] as const;

const nextManagerStatus: Record<
  "Pending" | "Preparing" | "Ready for Driver",
  "Preparing" | "Ready for Driver" | null
> = {
  Pending: "Preparing",
  Preparing: "Ready for Driver",
  "Ready for Driver": null,
};

export default function AdminOrdersScreen() {
  const { adminOrders, updateAdminOrderStatus } = usePrototypeState();
  const [activeFilter, setActiveFilter] =
    useState<(typeof orderFilters)[number]>("All");

  const visibleOrders = useMemo(
    () =>
      adminOrders.filter(
        (order) => activeFilter === "All" || order.status === activeFilter,
      ),
    [activeFilter, adminOrders],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>LIVE ORDERS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {orderFilters.map((filter) => {
            const active = filter === activeFilter;
            return (
              <Pressable
                key={filter}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visibleOrders.map((order, index) => (
          <FadeInView
            key={order.id}
            delay={100 + index * 50}
            style={styles.orderCard}
          >
            <View style={styles.orderTop}>
              <View style={styles.orderCopy}>
                <Text style={styles.orderRestaurant}>{order.restaurant}</Text>
                <Text
                  style={styles.orderMeta}
                >{`${order.customer} · ${order.placedAt} · ETA ${order.eta}`}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{order.status}</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View>
                <Text style={styles.infoLabel}>Driver</Text>
                <Text style={styles.infoValue}>{order.driver}</Text>
              </View>
              <View>
                <Text style={styles.infoLabel}>Total</Text>
                <Text style={styles.infoValue}>{order.total}</Text>
              </View>
            </View>

            {order.issue ? (
              <View style={styles.issueBanner}>
                <Feather name="alert-circle" size={16} color={colors.warning} />
                <Text style={styles.issueText}>{order.issue}</Text>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              {order.status === "Pending" ||
              order.status === "Preparing" ||
              order.status === "Ready for Driver"
                ? (() => {
                    const currentStatus = order.status;
                    const nextStatus = nextManagerStatus[currentStatus];

                    return nextStatus ? (
                      <Pressable
                        style={styles.primaryAction}
                        onPress={() => {
                          updateAdminOrderStatus(order.id, nextStatus);
                        }}
                      >
                        <Text style={styles.primaryActionText}>
                          {currentStatus === "Pending"
                            ? "Start Preparing"
                            : "Mark Ready for Driver"}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={styles.completedPill}>
                        <Text style={styles.completedPillText}>
                          Waiting for Driver
                        </Text>
                      </View>
                    );
                  })()
                : null}
            </View>
          </FadeInView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    gap: spacing.lg,
  },
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
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  headerSpacer: { width: 40 },
  filterRow: { gap: 10, paddingRight: 20 },
  filterChip: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: colors.surface,
    borderColor: colors.surface,
  },
  filterText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  filterTextActive: { color: colors.white },
  orderCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  orderTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  orderCopy: { flex: 1, gap: 4 },
  orderRestaurant: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  orderMeta: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surfaceDeep,
  },
  infoGrid: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.text,
  },
  issueBanner: {
    borderRadius: 16,
    backgroundColor: "#FFF4E6",
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  issueText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.warning,
  },
  actionRow: { flexDirection: "row", justifyContent: "flex-end" },
  primaryAction: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
  completedPill: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  completedPillText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.success,
  },
});
