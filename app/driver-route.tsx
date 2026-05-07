import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getRolePortalTopInset,
  rolePortalHeaderSize,
} from "./rolePortalLayout";
import {
  getDeliveryCoordinate,
  getRestaurantCoordinate,
} from "./services/mapCoords";
import { colors, spacing, typography } from "./theme";
import { MapPreview } from "../components/MapPreview";

export default function DriverRouteScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getRolePortalTopInset(insets.top);
  const params = useLocalSearchParams<{ orderId?: string }>();
  const {
    adminOrders,
    completeDriverDelivery,
    driverProfiles,
    profile,
    restaurants,
    selectedDriverId,
    updateAdminOrderStatus,
  } = useAppState();

  const activeDriver = useMemo(
    () =>
      driverProfiles.find((driver) => driver.id === selectedDriverId),
    [driverProfiles, selectedDriverId],
  );
  const activeOrder = useMemo(() => {
    const assignedOrders = adminOrders.filter(
      (order) =>
        (order.status === "Ready for Driver" ||
          order.status === "Out for Delivery") &&
        (order.driverId === selectedDriverId ||
          order.driver === activeDriver?.name),
    );

    return (
      assignedOrders.find((order) => order.id === params.orderId) ??
      assignedOrders[0]
    );
  }, [activeDriver?.name, adminOrders, params.orderId, selectedDriverId]);

  const pickupComplete = activeOrder?.status === "Out for Delivery";
  const routeStageLabel = pickupComplete ? "EN ROUTE" : "AWAITING PICKUP";
  const routeHeadline = pickupComplete
    ? "Drive to customer"
    : "Head to the restaurant";
  const routeAddress = pickupComplete
    ? activeOrder?.deliveryAddress || profile.address
    : `${activeOrder?.restaurant} pickup`;
  const routeEtaLabel = pickupComplete ? "Customer ETA" : "Pickup ETA";

  // Use the actual restaurant's coordinates when available (Google Places
  // results carry lat/lng); fall back to a stable offset for mock data.
  const orderRestaurant = useMemo(() => {
    if (!activeOrder?.restaurant) return undefined;
    return restaurants.find(
      (entry) =>
        entry.name === activeOrder.restaurant ||
        entry.id === activeOrder.restaurant,
    );
  }, [activeOrder?.restaurant, restaurants]);
  const pickupCoord = useMemo(
    () => getRestaurantCoordinate(orderRestaurant),
    [orderRestaurant],
  );
  const destinationCoord = useMemo(
    () => getDeliveryCoordinate(pickupCoord),
    [pickupCoord],
  );

  if (!activeOrder) {
    return (
      <StaffAccessGate role="driver">
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
          <Text style={styles.headerTitle}>ROUTE VIEW</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.mapCard}>
          <MapPreview
            badge={routeStageLabel}
            height={220}
            markers={[
              {
                coordinate: pickupCoord,
                kind: "pickup",
                label: activeOrder.restaurant,
              },
              {
                coordinate: destinationCoord,
                kind: "destination",
                label: "Customer",
              },
            ]}
          />
        </FadeInView>

        <FadeInView delay={150} style={styles.infoCard}>
          <Text style={styles.restaurant}>{activeOrder.restaurant}</Text>
          <Text style={styles.stageTitle}>{routeHeadline}</Text>
          <Text
            style={styles.meta}
          >{`${activeOrder.customer} | ${activeOrder.total} | ${routeEtaLabel} ${activeOrder.eta}`}</Text>

          <View style={styles.detailRow}>
            <Feather name="truck" size={16} color={colors.surfaceDeep} />
            <Text
              style={styles.detailText}
            >{`${activeDriver?.name ?? "Driver"} | ${activeDriver?.vehicle ?? "Vehicle"}`}</Text>
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
          ) : (
            <Pressable
              style={styles.completeButton}
              onPress={async () => {
                await completeDriverDelivery(activeOrder.id);
                router.replace("/driver-dashboard");
              }}
            >
              <Text style={styles.completeButtonText}>Mark Delivered</Text>
            </Pressable>
          )}
        </FadeInView>
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
  mapCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
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
