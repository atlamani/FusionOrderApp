import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
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
import { useUserLocation } from "./services/useUserLocation";
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
    publishDriverLocation,
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
  // For deliveries the source of truth is the order's deliveryAddress.
  // Falling back to `profile.address` was wrong here — `profile` is the
  // signed-in driver's profile, not the customer's, so a driver with an
  // unset customer address ended up seeing their own home as the drop
  // destination. Now we show the customer address when present and hide
  // the row entirely when it's missing rather than render a misleading
  // value.
  const routeAddress = pickupComplete
    ? activeOrder?.deliveryAddress?.trim()
      ? activeOrder.deliveryAddress
      : null
    : activeOrder?.restaurant
      ? `${activeOrder.restaurant} pickup`
      : null;
  const routeEtaLabel = pickupComplete ? "Customer ETA" : "Pickup ETA";

  // Use the actual restaurant's coordinates when available (Google Places
  // results carry lat/lng); fall back to a stable offset for partner restaurants.
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
  // Pull the customer's geocoded delivery coords off the order doc so
  // the destination pin lands at the address the customer entered, not
  // an offset from the pickup location.
  const liveOrderDoc = useMemo(() => {
    return adminOrders.find((entry) => entry.id === activeOrder?.id) as
      | { deliveryLatitude?: number; deliveryLongitude?: number }
      | undefined;
  }, [activeOrder?.id, adminOrders]);
  const destinationCoord = useMemo(
    () =>
      getDeliveryCoordinate(pickupCoord, {
        latitude: liveOrderDoc?.deliveryLatitude,
        longitude: liveOrderDoc?.deliveryLongitude,
      }),
    [liveOrderDoc?.deliveryLatitude, liveOrderDoc?.deliveryLongitude, pickupCoord],
  );

  // Pull live GPS while a delivery is in progress so the customer's
  // tracking screen can plot the driver. Throttled by useUserLocation
  // (10s / 50m) plus an additional sanity guard here so we never write
  // more than one position per ~15s even on rapid updates.
  const userLocation = useUserLocation();
  const lastPublishRef = useRef<{ ms: number; lat: number; lng: number } | null>(
    null,
  );

  useEffect(() => {
    if (!activeOrder) return;
    if (activeOrder.status !== "Out for Delivery") return;
    const lat = userLocation.latitude;
    const lng = userLocation.longitude;
    if (lat == null || lng == null) return;

    const now = Date.now();
    const last = lastPublishRef.current;
    // First sample: publish immediately so the customer sees the driver on
    // the map within the first GPS read. Subsequent samples are throttled
    // to ~15s OR a meaningful movement (~22m), whichever fires first, so
    // we don't burn a write on every minor jitter.
    if (!last) {
      lastPublishRef.current = { ms: now, lat, lng };
      void publishDriverLocation(activeOrder.id, lat, lng);
      return;
    }
    const movedEnough =
      Math.abs(last.lat - lat) > 0.0002 ||
      Math.abs(last.lng - lng) > 0.0002;
    const dueByTime = now - last.ms > 15_000;
    if (!movedEnough && !dueByTime) return;

    lastPublishRef.current = { ms: now, lat, lng };
    void publishDriverLocation(activeOrder.id, lat, lng);
  }, [
    activeOrder,
    publishDriverLocation,
    userLocation.latitude,
    userLocation.longitude,
  ]);

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

          {routeAddress ? (
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={16} color={colors.surfaceDeep} />
              <Text style={styles.detailText}>{routeAddress}</Text>
            </View>
          ) : pickupComplete ? (
            <View style={styles.detailRow}>
              <Feather
                name="alert-circle"
                size={16}
                color={colors.warning}
              />
              <Text style={[styles.detailText, styles.detailTextWarning]}>
                Delivery address unavailable — contact customer support.
              </Text>
            </View>
          ) : null}

          {pickupComplete ? (
            userLocation.error ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retry location permission"
                style={styles.locationCardError}
                onPress={() => userLocation.refetch()}
              >
                <Feather name="alert-triangle" size={16} color={colors.danger} />
                <View style={styles.locationCardCopy}>
                  <Text style={styles.locationCardTitle}>
                    Location sharing off
                  </Text>
                  <Text style={styles.locationCardDetail}>
                    {userLocation.error}. Tap to retry — the customer can&apos;t
                    see you on the map without it.
                  </Text>
                </View>
              </Pressable>
            ) : userLocation.latitude == null ? (
              <View style={styles.locationCardWaiting}>
                <Feather name="navigation" size={16} color={colors.warning} />
                <View style={styles.locationCardCopy}>
                  <Text style={styles.locationCardTitle}>
                    Waiting for GPS...
                  </Text>
                  <Text style={styles.locationCardDetail}>
                    Allow Location when prompted so the customer can track your
                    drop.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.locationCardLive}>
                <Feather name="radio" size={16} color={colors.success} />
                <View style={styles.locationCardCopy}>
                  <Text style={styles.locationCardTitle}>
                    Sharing live location
                  </Text>
                  <Text style={styles.locationCardDetail}>
                    Customer sees your pin update every ~15 seconds.
                  </Text>
                </View>
              </View>
            )
          ) : null}

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
  detailTextWarning: {
    color: colors.warning,
  },
  locationCardLive: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#ECFDF3",
  },
  locationCardWaiting: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFF4E6",
  },
  locationCardError: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
  },
  locationCardCopy: { flex: 1, gap: 2 },
  locationCardTitle: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  locationCardDetail: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
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
