import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import StaffAccessGate from "./StaffAccessGate";
import { useAppState } from "./appState";
import { unassignedDriverLabel } from "./appData";
import {
  getRolePortalTopInset,
  rolePortalHeaderSidePadding,
  rolePortalHeaderSize,
} from "./rolePortalLayout";
import { getDriverMetrics } from "./services/roleMetrics";
import { colors, spacing, typography } from "./theme";

export default function DriverDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getRolePortalTopInset(insets.top);
  const { adminOrders, driverProfiles, logout, selectedDriverId } = useAppState();

  const activeDriver = useMemo(
    () => driverProfiles.find((driver) => driver.id === selectedDriverId),
    [driverProfiles, selectedDriverId],
  );

  const metrics = useMemo(() => {
    return getDriverMetrics({
      orders: adminOrders,
      driverName: activeDriver?.name,
      unassignedLabel: unassignedDriverLabel,
    });
  }, [activeDriver?.name, adminOrders]);

  if (!activeDriver) {
    return (
      <StaffAccessGate role="driver">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No driver profile assigned</Text>
            <Text style={styles.emptyCopy}>
              This account needs a driverId claim before it can open the courier console.
            </Text>
          </View>
        </SafeAreaView>
      </StaffAccessGate>
    );
  }

  const handleLogout = () => {
    logout();
    router.dismissTo("/");
  };

  return (
    <StaffAccessGate role="driver">
      <SafeAreaView style={styles.safeArea}>
      <Pressable
        accessibilityLabel="Exit driver console"
        accessibilityRole="button"
        hitSlop={18}
        style={({ pressed }) => [
          styles.floatingExitButton,
          { top: headerTopPadding },
          pressed && styles.pressedButton,
        ]}
        onPress={handleLogout}
      >
        <Feather name="arrow-left" size={20} color={colors.background} />
      </Pressable>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerTopPadding },
        ]}
      >
        <FadeInView delay={40} style={styles.navRow}>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={80} style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Driver Console</Text>
            <Text style={styles.title}>{activeDriver.name}</Text>
            <Text style={styles.subtitle}>{`${activeDriver.vehicle} | ${activeDriver.zone} | ${activeDriver.status}`}</Text>
          </View>
        </FadeInView>

        <FadeInView delay={100} style={styles.identityCard}>
          <View style={styles.identityIcon}>
            <Feather name="lock" size={16} color={colors.background} />
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.identityTitle}>Signed-in driver profile</Text>
            <Text style={styles.identityText}>
              {activeDriver.name} only. Other driver profiles are visible to managers, not couriers.
            </Text>
          </View>
        </FadeInView>

        <View style={styles.metricGrid}>
          <FadeInView delay={90} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.readyPool}</Text>
            <Text style={styles.metricLabel}>Ready to claim</Text>
          </FadeInView>
          <FadeInView delay={130} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.assigned}</Text>
            <Text style={styles.metricLabel}>Active drops</Text>
          </FadeInView>
          <FadeInView delay={170} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.completed}</Text>
            <Text style={styles.metricLabel}>Completed today</Text>
          </FadeInView>
        </View>

        <FadeInView delay={220} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Shift snapshot</Text>
          <Text style={styles.summaryCopy}>
            {metrics.assigned > 0
              ? "You have an active drop in progress. Open route view to complete delivery."
              : "No active route yet. Claim a ready order to start your next run."}
          </Text>
        </FadeInView>

        <View style={styles.linkStack}>
          <Pressable style={styles.linkCard} onPress={() => router.push("/driver-assignments")}>
            <View style={styles.linkIcon}>
              <Feather name="package" size={18} color={colors.background} />
            </View>
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>Assignments</Text>
              <Text style={styles.linkDetail}>Claim ready orders and review active deliveries.</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </Pressable>

          <Pressable style={styles.linkCard} onPress={() => router.push("/driver-route")}>
            <View style={styles.linkIcon}>
              <Feather name="map" size={18} color={colors.background} />
            </View>
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>Route View</Text>
              <Text style={styles.linkDetail}>See your current drop and mark delivery complete.</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </Pressable>
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
  emptyTitle: { fontFamily: typography.display, fontSize: 28, color: colors.primary, textAlign: "center" },
  emptyCopy: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: "center" },
  navRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 10,
    elevation: 10,
  },
  floatingExitButton: {
    position: "absolute",
    left: rolePortalHeaderSidePadding,
    width: rolePortalHeaderSize,
    height: rolePortalHeaderSize,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  headerSpacer: {
    width: rolePortalHeaderSize,
    height: rolePortalHeaderSize,
  },
  pressedButton: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  hero: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 16,
  },
  heroCopy: { flex: 1, gap: 6 },
  eyebrow: { fontFamily: typography.body, fontSize: 12, color: "rgba(255,255,255,0.78)" },
  title: { fontFamily: typography.display, fontSize: 30, color: colors.white },
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.88)" },
  identityCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  identityIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  identityCopy: { flex: 1, gap: 3 },
  identityTitle: { fontFamily: typography.display, fontSize: 15, color: colors.primary },
  identityText: { fontFamily: typography.body, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  metricGrid: { flexDirection: "row", gap: 10 },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  metricValue: { fontFamily: typography.display, fontSize: 28, color: colors.primary },
  metricLabel: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  summaryCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  summaryTitle: { fontFamily: typography.display, fontSize: 22, color: colors.primary },
  summaryCopy: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.text },
  linkStack: { gap: 12 },
  linkCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  linkCopy: { flex: 1, gap: 4 },
  linkTitle: { fontFamily: typography.display, fontSize: 18, color: colors.primary },
  linkDetail: { fontFamily: typography.body, fontSize: 13, lineHeight: 18, color: colors.textMuted },
});
