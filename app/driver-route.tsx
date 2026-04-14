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
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function DriverRouteScreen() {
  const {
    adminOrders,
    completeDriverDelivery,
    driverProfiles,
    profile,
    selectedDriverId,
    updateAdminOrderStatus,
  } = usePrototypeState();

  const activeDriver = useMemo(
    () =>
      driverProfiles.find((driver) => driver.id === selectedDriverId) ??
      driverProfiles[0],
    [driverProfiles, selectedDriverId],
  );
  const activeOrder = useMemo(() => {
    const matchingDriverOrder = adminOrders.find(
      (order) =>
        (order.status === "Ready for Driver" ||
          order.status === "Out for Delivery") &&
        order.driver === activeDriver?.name,
    );

    if (matchingDriverOrder) {
      return matchingDriverOrder;
    }

    return adminOrders.find(
      (order) =>
        order.status === "Ready for Driver" ||
        order.status === "Out for Delivery",
    );
  }, [activeDriver?.name, adminOrders]);

  const pickupComplete = activeOrder?.status === "Out for Delivery";
  const routeStageLabel = pickupComplete ? "EN ROUTE" : "AWAITING PICKUP";
  const routeHeadline = pickupComplete
    ? "Drive to customer"
    : "Head to the restaurant";
  const routeAddress = pickupComplete
    ? profile.address
    : `${activeOrder?.restaurant} pickup`;
  const routeEtaLabel = pickupComplete ? "Customer ETA" : "Pickup ETA";

  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No active route</Text>
          <Text style={styles.emptyCopy}>
            Claim a ready order to preview the delivery route flow.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.replace("/driver-assignments")}
          >
            <Text style={styles.emptyButtonText}>Open Assignments</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>ROUTE VIEW</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.mapCard}>
          <Text style={styles.liveBadge}>{routeStageLabel}</Text>
          <View style={styles.routeLoop} />
          <View style={styles.pinA}>
            <Feather name="shopping-bag" size={16} color={colors.background} />
          </View>
          <View style={styles.pinB}>
            <Feather name="home" size={16} color={colors.background} />
          </View>
        </FadeInView>

        <FadeInView delay={150} style={styles.infoCard}>
          <Text style={styles.restaurant}>{activeOrder.restaurant}</Text>
          <Text style={styles.stageTitle}>{routeHeadline}</Text>
          <Text
            style={styles.meta}
          >{`${activeOrder.customer} · ${activeOrder.total} · ${routeEtaLabel} ${activeOrder.eta}`}</Text>

          <View style={styles.detailRow}>
            <Feather name="truck" size={16} color={colors.surfaceDeep} />
            <Text
              style={styles.detailText}
            >{`${activeDriver?.name ?? "Driver"} · ${activeDriver?.vehicle ?? "Vehicle"}`}</Text>
          </View>

          <View style={styles.detailRow}>
            <Feather name="package" size={16} color={colors.surfaceDeep} />
            <Text
              style={styles.detailText}
            >{`Status: ${activeOrder.status}`}</Text>
          </View>

          <View style={styles.detailRow}>
            <Feather name="map-pin" size={16} color={colors.surfaceDeep} />
            <Text style={styles.detailText}>{routeAddress}</Text>
          </View>

          {!pickupComplete ? (
            <Pressable
              style={styles.primaryButton}
              onPress={async () => {
                await updateAdminOrderStatus(
                  activeOrder.id,
                  "Out for Delivery",
                );
              }}
            >
              <Text style={styles.primaryButtonText}>Mark Picked Up</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={styles.completeButton}
            onPress={async () => {
              await completeDriverDelivery(activeOrder.id);
              router.replace("/driver-dashboard");
            }}
          >
            <Text style={styles.completeButtonText}>Mark Delivered</Text>
          </Pressable>
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
    paddingBottom: 36,
    gap: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primary,
  },
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
  emptyButtonText: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.background,
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
  mapCard: {
    height: 220,
    borderRadius: 22,
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
  routeLoop: {
    position: "absolute",
    width: 190,
    height: 140,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(58, 77, 57, 0.18)",
    borderStyle: "dashed",
  },
  pinA: {
    position: "absolute",
    left: 52,
    top: 80,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  pinB: {
    position: "absolute",
    right: 52,
    bottom: 64,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  restaurant: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  stageTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.surfaceDeep,
  },
  meta: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.primary,
  },
  completeButton: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  completeButtonText: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.background,
  },
});
