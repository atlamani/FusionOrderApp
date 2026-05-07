import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import StaffAccessGate from "./StaffAccessGate";
import { unassignedDriverLabel } from "./appData";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getRolePortalTopInset,
  rolePortalHeaderSize,
} from "./rolePortalLayout";
import { colors, spacing, typography } from "./theme";

export default function DriverAssignmentsScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getRolePortalTopInset(insets.top);
  const {
    adminOrders,
    claimDriverAssignment,
    driverProfiles,
    selectedDriverId,
  } = useAppState();

  const activeDriver = useMemo(
    () =>
      driverProfiles.find((driver) => driver.id === selectedDriverId),
    [driverProfiles, selectedDriverId],
  );

  const readyOrders = useMemo(
    () =>
      adminOrders.filter(
        (order) =>
          order.status === "Ready for Driver" &&
          (order.driverId == null ||
            !order.driver ||
            order.driver === unassignedDriverLabel),
      ),
    [adminOrders],
  );
  const activeOrders = useMemo(
    () =>
      adminOrders.filter(
        (order) =>
          (order.status === "Ready for Driver" ||
            order.status === "Out for Delivery") &&
          (order.driverId === selectedDriverId ||
            order.driver === activeDriver?.name),
      ),
    [activeDriver?.name, adminOrders, selectedDriverId],
  );

  if (!activeDriver) {
    return (
      <StaffAccessGate role="driver">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No driver profile assigned</Text>
            <Text style={styles.emptyText}>
              This account needs a driverId claim before it can claim assignments.
            </Text>
          </View>
        </SafeAreaView>
      </StaffAccessGate>
    );
  }

  return (
    <StaffAccessGate role="driver">
      <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerTopPadding },
        ]}
      >
        <FadeInView delay={40} style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={16}
            style={styles.backButton}
            onPress={() => goBackOrReplace("/driver-dashboard")}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>ASSIGNMENTS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ready for pickup</Text>
          {readyOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No unassigned ready orders at the moment.
              </Text>
            </View>
          ) : (
            readyOrders.map((order, index) => (
              <FadeInView
                key={order.id}
                delay={90 + index * 40}
                style={styles.orderCard}
              >
                <View style={styles.cardTop}>
                  <View style={styles.copy}>
                    <Text style={styles.restaurant}>{order.restaurant}</Text>
                    <Text style={styles.meta}>
                      {order.customer} | {order.total} | ETA {order.eta}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>Ready</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.primaryAction}
                  onPress={async () => {
                    await claimDriverAssignment(order.id);
                    router.push({
                      pathname: "/driver-route",
                      params: { orderId: order.id },
                    });
                  }}
                >
                  <Text style={styles.primaryActionText}>Claim Delivery</Text>
                </Pressable>
              </FadeInView>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My active drops</Text>
          {activeOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {activeDriver?.name ?? "This driver"} has no active deliveries
                right now.
              </Text>
            </View>
          ) : (
            activeOrders.map((order, index) => (
              <FadeInView
                key={order.id}
                delay={220 + index * 40}
                style={styles.orderCard}
              >
                <View style={styles.cardTop}>
                  <View style={styles.copy}>
                    <Text style={styles.restaurant}>{order.restaurant}</Text>
                    <Text style={styles.meta}>
                      {order.customer} | {order.total} | ETA {order.eta}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>
                      {order.status === "Ready for Driver"
                        ? "Awaiting pickup"
                        : "On route"}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.secondaryAction}
                  onPress={() =>
                    router.push({
                      pathname: "/driver-route",
                      params: { orderId: order.id },
                    })
                  }
                >
                  <Text style={styles.secondaryActionText}>
                    {order.status === "Ready for Driver"
                      ? "Open Pickup Route"
                      : "Open Delivery Route"}
                  </Text>
                </Pressable>
              </FadeInView>
            ))
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </StaffAccessGate>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: rolePortalHeaderSize,
    height: rolePortalHeaderSize,
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
  headerSpacer: { width: rolePortalHeaderSize },
  section: { gap: 12 },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  emptyCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.primary,
    textAlign: "center",
  },
  orderCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  copy: { flex: 1, gap: 4 },
  restaurant: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  meta: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surfaceDeep,
  },
  primaryAction: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
  secondaryAction: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryActionText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
});
