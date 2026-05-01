import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FadeInView from "./FadeInView";
import { useAppState } from "./appState";
import { colors, spacing, typography } from "./theme";

const headerTopPadding = (StatusBar.currentHeight ?? 0) + 18;

export default function RestaurantDashboardScreen() {
  const {
    adminOrders,
    adminRestaurants,
    getRestaurantMenuSections,
    logout,
    selectedPartnerRestaurantId,
    setSelectedPartnerRestaurant,
  } = useAppState();

  const restaurant = useMemo(
    () => adminRestaurants.find((entry) => entry.id === selectedPartnerRestaurantId) ?? adminRestaurants[0],
    [adminRestaurants, selectedPartnerRestaurantId],
  );

  const liveMenuItems = useMemo(
    () => (restaurant ? getRestaurantMenuSections(restaurant.id).flatMap((section) => section.items) : []),
    [getRestaurantMenuSections, restaurant],
  );

  const metrics = useMemo(() => {
    const restaurantOrders = adminOrders.filter((order) => order.restaurantId === restaurant?.id);
    return {
      active: restaurantOrders.filter((order) => order.status !== "Completed").length,
      ready: restaurantOrders.filter((order) => order.status === "Ready for Driver").length,
      pausedItems: liveMenuItems.filter((item) => !item.available).length,
    };
  }, [adminOrders, liveMenuItems, restaurant]);

  if (!restaurant) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.dismissTo("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable
        accessibilityLabel="Exit restaurant console"
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

        <FadeInView delay={80} style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Restaurant Console</Text>
            <Text style={styles.title}>{restaurant.name}</Text>
            <Text style={styles.subtitle}>
              Keep prep times current, move orders through the kitchen, and control menu availability.
            </Text>
          </View>
        </FadeInView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {adminRestaurants.map((entry) => {
            const active = entry.id === restaurant.id;
            return (
              <Pressable
                key={entry.id}
                style={[styles.selectorChip, active && styles.selectorChipActive]}
                onPress={() => setSelectedPartnerRestaurant(entry.id)}
              >
                <Text style={[styles.selectorText, active && styles.selectorTextActive]}>{entry.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

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
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 20,
    paddingTop: headerTopPadding,
    paddingBottom: 36,
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
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  headerSpacer: {
    width: 44,
    height: 44,
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
  selectorRow: { gap: 10, paddingRight: 20 },
  selectorChip: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  selectorChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  selectorTextActive: { color: colors.background },
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
