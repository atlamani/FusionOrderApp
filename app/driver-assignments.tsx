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

export default function DriverAssignmentsScreen() {
  const {
    adminOrders,
    claimDriverAssignment,
    driverProfiles,
    selectedDriverId,
  } = usePrototypeState();

  const activeDriver = useMemo(
    () =>
      driverProfiles.find((driver) => driver.id === selectedDriverId) ??
      driverProfiles[0],
    [driverProfiles, selectedDriverId],
  );

  const readyOrders = useMemo(
    () => adminOrders.filter((order) => order.status === "Ready for Driver"),
    [adminOrders],
  );
  const activeOrders = useMemo(
    () =>
      adminOrders.filter(
        (order) =>
          (order.status === "Ready for Driver" ||
            order.status === "Out for Delivery") &&
          order.driver === activeDriver?.name,
      ),
    [activeDriver?.name, adminOrders],
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
          <Text style={styles.headerTitle}>ASSIGNMENTS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ready for pickup</Text>
          {readyOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No ready orders at the moment.
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
                      {order.customer} · {order.total} · ETA {order.eta}
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
                    router.push("/driver-route");
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
                      {order.customer} · {order.total} · ETA {order.eta}
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
                  onPress={() => router.push("/driver-route")}
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
