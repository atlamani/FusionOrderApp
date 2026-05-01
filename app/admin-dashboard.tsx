import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { useAppState } from "./appState";
import { colors, spacing, typography } from "./theme";

const headerTopPadding = (StatusBar.currentHeight ?? 0) + 18;

const adminActions = [
  {
    id: "orders",
    title: "Live Orders",
    icon: "shopping-bag",
    route: "/admin-orders",
  },
  {
    id: "restaurants",
    title: "Restaurants",
    icon: "grid",
    route: "/admin-restaurants",
  },
  {
    id: "feedback",
    title: "Flagged Feedback",
    icon: "flag",
    route: "/admin-feedback",
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: "bar-chart-2",
    route: "/admin-analytics",
  },
  {
    id: "approvals",
    title: "Approvals",
    icon: "check-square",
    route: "/admin-restaurants",
  },
  {
    id: "drivers",
    title: "Driver Status",
    icon: "navigation",
    route: "/driver-dashboard",
  },
] as const;

export default function AdminDashboardScreen() {
  const { adminFeedback, adminOrders, adminRestaurants, driverProfiles, logout } = useAppState();

  const handleLogout = () => {
    logout();
    router.dismissTo("/");
  };

  const metrics = useMemo(() => {
    const liveOrders = adminOrders.filter((order) => order.status !== "Completed").length;
    const completedOrders = adminOrders.filter((order) => order.status === "Completed").length;
    const flaggedFeedback = adminFeedback.filter((entry) => entry.flagged).length;
    const needsApproval = adminRestaurants.filter((restaurant) => restaurant.status === "Needs Approval").length;
    const availableDrivers = driverProfiles.filter((driver) => driver.status === "Available").length;
    const averageRating =
      adminFeedback.reduce((sum, entry) => sum + entry.rating, 0) / Math.max(adminFeedback.length, 1);

    return {
      availableDrivers,
      completedOrders,
      flaggedFeedback,
      liveOrders,
      needsApproval,
      averageRating: averageRating.toFixed(1),
    };
  }, [adminFeedback, adminOrders, adminRestaurants, driverProfiles]);

  const chartBars = useMemo(
    () => [
      { label: "Live", value: metrics.liveOrders, color: "#FF6565" },
      { label: "Done", value: metrics.completedOrders, color: "#F5B451" },
      { label: "Drivers", value: metrics.availableDrivers, color: "#7ED7A7" },
      { label: "Flags", value: metrics.flaggedFeedback, color: "#FF7A7A" },
      { label: "Queue", value: metrics.needsApproval, color: "#C09BFF" },
    ],
    [metrics],
  );

  const maxBarValue = Math.max(...chartBars.map((bar) => bar.value), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable
        accessibilityLabel="Exit admin dashboard"
        accessibilityRole="button"
        hitSlop={18}
        style={({ pressed }) => [styles.floatingExitButton, pressed && styles.pressedButton]}
        onPress={handleLogout}
      >
        <Feather name="arrow-left" size={20} color={colors.background} />
      </Pressable>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.navRow}>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={80} style={styles.titleBlock}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Manage operations, partners, reports, and service health.</Text>
        </FadeInView>

        <View style={styles.actionGrid}>
          {adminActions.map((action, index) => (
            <FadeInView key={action.id} delay={130 + index * 45} style={styles.actionCell}>
              <Pressable
                accessibilityLabel={`Open ${action.title}`}
                accessibilityRole="button"
                style={({ pressed }) => [styles.actionTile, pressed && styles.pressedTile]}
                onPress={() => router.push(action.route as never)}
              >
                <View style={styles.actionIcon}>
                  <Feather name={action.icon} size={34} color={colors.background} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </Pressable>
            </FadeInView>
          ))}
        </View>

        <FadeInView delay={440} style={styles.analyticsCard}>
          <View style={styles.analyticsHeader}>
            <View>
              <Text style={styles.sectionLabel}>ANALYTICS</Text>
              <Text style={styles.analyticsTitle}>Today&apos;s Pulse</Text>
            </View>
            <Pressable
              accessibilityLabel="Open analytics"
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.analyticsButton, pressed && styles.pressedButton]}
              onPress={() => router.push("/admin-analytics")}
            >
              <Feather name="arrow-up-right" size={18} color={colors.background} />
            </Pressable>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{metrics.liveOrders}</Text>
              <Text style={styles.statLabel}>Live</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{metrics.averageRating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{metrics.flaggedFeedback}</Text>
              <Text style={styles.statLabel}>Flags</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {chartBars.map((bar) => (
              <View key={bar.label} style={styles.chartColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max((bar.value / maxBarValue) * 100, 14)}%`,
                        backgroundColor: bar.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={500} style={styles.logoutRow}>
          <Pressable
            accessibilityLabel="Log out"
            accessibilityRole="button"
            hitSlop={10}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.pressedLink]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={18} color={colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
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
    paddingTop: headerTopPadding,
    paddingBottom: 40,
    gap: spacing.lg,
  },
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
    top: headerTopPadding,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  titleBlock: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 8,
    gap: 10,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 38,
    lineHeight: 44,
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 320,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  actionCell: {
    width: "47%",
    aspectRatio: 1,
  },
  actionTile: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  actionIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontFamily: typography.display,
    fontSize: 21,
    lineHeight: 25,
    color: colors.primary,
    textAlign: "center",
  },
  analyticsCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 18,
  },
  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  sectionLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
  },
  analyticsTitle: {
    fontFamily: typography.display,
    fontSize: 26,
    color: colors.white,
  },
  analyticsButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  statRow: {
    flexDirection: "row",
    gap: 10,
  },
  statPill: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingVertical: 12,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontFamily: typography.display,
    fontSize: 25,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  chart: {
    height: 144,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  chartColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  barTrack: {
    width: "100%",
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.34)",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  chartLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.78)",
  },
  logoutRow: {
    alignItems: "center",
    paddingTop: 4,
  },
  logoutButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
  },
  logoutText: {
    fontFamily: typography.body,
    fontSize: 25,
    color: colors.danger,
  },
  pressedButton: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  pressedLink: {
    opacity: 0.72,
  },
  pressedTile: {
    opacity: 0.82,
    transform: [{ scale: 0.975 }],
  },
});
