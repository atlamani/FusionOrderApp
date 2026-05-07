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
import { getRestaurantMetrics } from "./services/roleMetrics";
import { colors, spacing, typography } from "./theme";

export default function RestaurantDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getRolePortalTopInset(insets.top);
  const {
    adminOrders,
    adminRestaurants,
    getRestaurantMenuSections,
    logout,
    selectedPartnerRestaurantId,
    sessionMode,
  } = useAppState();
  const isGoogleAggregator = sessionMode === "googleAggregator";

  const restaurant = useMemo(
    () => adminRestaurants.find((entry) => entry.id === selectedPartnerRestaurantId),
    [adminRestaurants, selectedPartnerRestaurantId],
  );

  const liveMenuItems = useMemo(
    () => (restaurant ? getRestaurantMenuSections(restaurant.id).flatMap((section) => section.items) : []),
    [getRestaurantMenuSections, restaurant],
  );

  const metrics = useMemo(() => {
    return getRestaurantMetrics({
      orders: adminOrders,
      restaurantId: restaurant?.id ?? "",
      menuItems: liveMenuItems,
    });
  }, [adminOrders, liveMenuItems, restaurant]);

  if (isGoogleAggregator) {
    // The aggregator account doesn't bind to a single partner restaurant
    // and the dashboard's metric widgets all require one. Send them to the
    // Google Queue (their actual workspace) when they hit this screen.
    return (
      <StaffAccessGate role="restaurant">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Google Places workspace</Text>
            <Text style={styles.emptyCopy}>
              You&apos;re signed in as the Google Places aggregator. Open the
              order queue to see every order placed against a Google-sourced
              restaurant.
            </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              style={styles.aggregatorButton}
              onPress={() => router.replace("/restaurant-orders")}
            >
              <Text style={styles.aggregatorButtonText}>
                Open Google Queue
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              style={styles.aggregatorSecondary}
              onPress={() => {
                logout();
                router.dismissTo("/");
              }}
            >
              <Text style={styles.aggregatorSecondaryText}>Sign out</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </StaffAccessGate>
    );
  }

  if (!restaurant) {
    return (
      <StaffAccessGate role="restaurant">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No restaurant assigned</Text>
            <Text style={styles.emptyCopy}>
              This account needs a restaurantId claim before it can open the partner console.
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
    <StaffAccessGate role="restaurant">
      <SafeAreaView style={styles.safeArea}>
      <Pressable
        accessibilityLabel="Exit restaurant console"
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
            <Text style={styles.eyebrow}>Restaurant Console</Text>
            <Text style={styles.title}>{restaurant.name}</Text>
            <Text style={styles.subtitle}>
              Keep prep times current, move orders through the kitchen, and control menu availability.
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={100} style={styles.identityCard}>
          <View style={styles.identityIcon}>
            <Feather name="lock" size={16} color={colors.background} />
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.identityTitle}>Signed-in location</Text>
            <Text style={styles.identityText}>
              {restaurant.name} only. Admin manages other locations from the manager console.
            </Text>
          </View>
        </FadeInView>

        <View style={styles.metricGrid}>
          <FadeInView delay={90} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.active}</Text>
            <Text style={styles.metricLabel}>Active orders</Text>
          </FadeInView>
          <FadeInView delay={130} style={styles.metricCard}>
            <Text style={styles.metricValue}>{restaurant.avgPrepTime}</Text>
            <Text style={styles.metricLabel}>Avg prep time</Text>
          </FadeInView>
          <FadeInView delay={170} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.pausedItems}</Text>
            <Text style={styles.metricLabel}>Paused menu items</Text>
          </FadeInView>
        </View>

        <FadeInView delay={220} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Shift snapshot</Text>
          <Text style={styles.summaryCopy}>
            {metrics.ready > 0
              ? `${metrics.ready} order${metrics.ready === 1 ? "" : "s"} ready for driver pickup right now.`
              : "No orders are waiting for driver pickup right now."}
          </Text>
        </FadeInView>

        <View style={styles.linkStack}>
          <Pressable style={styles.linkCard} onPress={() => router.push("/restaurant-orders")}>
            <View style={styles.linkIcon}>
              <Feather name="shopping-bag" size={18} color={colors.background} />
            </View>
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>Kitchen Queue</Text>
              <Text style={styles.linkDetail}>Advance order statuses and watch pickup readiness.</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </Pressable>

          <Pressable style={styles.linkCard} onPress={() => router.push("/restaurant-menu-controls" as never)}>
            <View style={styles.linkIcon}>
              <Feather name="menu" size={18} color={colors.background} />
            </View>
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>Menu Controls</Text>
              <Text style={styles.linkDetail}>Pause items, keep prep time current, and prep for rushes.</Text>
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
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primary,
    textAlign: "center",
  },
  emptyCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
  },
  aggregatorButton: {
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  aggregatorButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
  aggregatorSecondary: {
    marginTop: 6,
    minHeight: 40,
    paddingHorizontal: 22,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  aggregatorSecondaryText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
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
  eyebrow: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
  },
  title: { fontFamily: typography.display, fontSize: 30, color: colors.white },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.88)",
  },
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
  identityTitle: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.primary,
  },
  identityText: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
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
  metricValue: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primary,
  },
  metricLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  summaryTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  summaryCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
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
  linkTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  linkDetail: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
