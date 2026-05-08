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
import { useAppState } from "./appState";
import {
  getRolePortalTopInset,
  rolePortalHeaderSidePadding,
  rolePortalHeaderSize,
} from "./rolePortalLayout";
import { countMenuItems, getAdminMetrics } from "./services/roleMetrics";
import { colors, spacing, typography } from "./theme";
import LogoutButton from "../components/LogoutButton";

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
    title: "Fleet Snapshot",
    icon: "navigation",
    route: "/admin-analytics",
  },
  {
    id: "support",
    title: "Support Inbox",
    icon: "message-circle",
    route: "/admin-support",
  },
] as const;

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getRolePortalTopInset(insets.top);
  const {
    adminFeedback,
    adminOrders,
    adminRestaurants,
    driverProfiles,
    getRestaurantMenuSections,
  } = useAppState();

  const metrics = useMemo(() => {
    return getAdminMetrics({
      feedback: adminFeedback,
      orders: adminOrders,
      restaurants: adminRestaurants,
      drivers: driverProfiles,
    });
  }, [adminFeedback, adminOrders, adminRestaurants, driverProfiles]);

  const restaurantsWithMenu = useMemo(
    () =>
      adminRestaurants.map((restaurant) => ({
        ...restaurant,
        menuItemCount: countMenuItems(getRestaurantMenuSections(restaurant.id)),
      })),
    [adminRestaurants, getRestaurantMenuSections],
  );

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
    <StaffAccessGate role="admin">
      <SafeAreaView style={styles.safeArea}>
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

        <FadeInView delay={80} style={styles.titleBlock}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Manage platform operations, partner approvals, fleet health, and service quality.</Text>
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Partner Oversight</Text>
        </View>

        {restaurantsWithMenu.map((restaurant, index) => (
          <FadeInView key={restaurant.id} delay={500 + index * 40} style={styles.restaurantCard}>
            <View style={styles.restaurantCardTop}>
              <View style={styles.restaurantCopy}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantDetail}>
                  {restaurant.cuisine} - Prep {restaurant.avgPrepTime} - {restaurant.manager}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{restaurant.status}</Text>
              </View>
            </View>

            <Text style={styles.restaurantMenuCount}>
              {restaurant.menuItemCount} menu items ready for availability and price controls
            </Text>

            <View style={styles.restaurantActions}>
              <Pressable
                accessibilityLabel={`Manage ${restaurant.name} menu`}
                accessibilityRole="button"
                style={({ pressed }) => [styles.linkButton, pressed && styles.pressedButton]}
                onPress={() => router.push(`/admin-restaurant?id=${restaurant.id}`)}
              >
                <Feather name="menu" size={18} color={colors.primary} />
              </Pressable>
            </View>
          </FadeInView>
        ))}

        <FadeInView delay={620}>
          <LogoutButton
            accessibilityLabel="Log out of admin account"
            message="You'll need to sign back in to continue managing the platform."
          />
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
    left: rolePortalHeaderSidePadding,
    width: rolePortalHeaderSize,
    height: rolePortalHeaderSize,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  headerSpacer: {
    width: rolePortalHeaderSize,
    height: rolePortalHeaderSize,
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
  sectionHeader: { paddingTop: 4 },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  restaurantCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  restaurantCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  restaurantCopy: { flex: 1, minWidth: 0, gap: 4 },
  restaurantName: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
    flexShrink: 1,
  },
  restaurantDetail: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    flexShrink: 1,
  },
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
  restaurantMenuCount: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
  },
  restaurantActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  linkButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  pressedButton: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  pressedTile: {
    opacity: 0.82,
    transform: [{ scale: 0.975 }],
  },
});
