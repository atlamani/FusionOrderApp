import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function AdminAnalyticsScreen() {
  const { adminFeedback, adminOrders, adminRestaurants, driverProfiles } = usePrototypeState();

  const metrics = useMemo(() => {
    const completed = adminOrders.filter((order) => order.status === "Completed").length;
    const live = adminOrders.filter((order) => order.status !== "Completed").length;
    const avgRating =
      adminFeedback.reduce((sum, entry) => sum + entry.rating, 0) / Math.max(adminFeedback.length, 1);
    const availableDrivers = driverProfiles.filter((driver) => driver.status === "Available").length;
    const approvalBacklog = adminRestaurants.filter((restaurant) => restaurant.status === "Needs Approval").length;

    return {
      completed,
      live,
      avgRating: avgRating.toFixed(1),
      availableDrivers,
      approvalBacklog,
    };
  }, [adminFeedback, adminOrders, adminRestaurants, driverProfiles]);

  const restaurantBreakdown = useMemo(
    () =>
      adminRestaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        orders: adminOrders.filter((order) => order.restaurantId === restaurant.id).length,
        pausedItems: restaurant.menuItems.filter((item) => !item.available).length,
      })),
    [adminOrders, adminRestaurants],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>ANALYTICS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.hero}>
          <Text style={styles.heroTitle}>Operations snapshot</Text>
          <Text style={styles.heroCopy}>
            A lightweight reporting view for throughput, quality, fulfillment, and partner health.
          </Text>
        </FadeInView>

        <View style={styles.metricGrid}>
          <FadeInView delay={130} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.live}</Text>
            <Text style={styles.metricLabel}>Live orders</Text>
          </FadeInView>
          <FadeInView delay={170} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.completed}</Text>
            <Text style={styles.metricLabel}>Completed today</Text>
          </FadeInView>
          <FadeInView delay={210} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.avgRating}</Text>
            <Text style={styles.metricLabel}>Avg rating</Text>
          </FadeInView>
        </View>

        <FadeInView delay={250} style={styles.insightCard}>
          <Text style={styles.sectionTitle}>Fulfillment Health</Text>
          <Text style={styles.insightText}>
            {metrics.availableDrivers} driver{metrics.availableDrivers === 1 ? "" : "s"} available,{" "}
            {metrics.approvalBacklog} restaurant{metrics.approvalBacklog === 1 ? "" : "s"} in approval backlog.
          </Text>
        </FadeInView>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Restaurant Breakdown</Text>
          {restaurantBreakdown.map((restaurant, index) => (
            <FadeInView key={restaurant.id} delay={300 + index * 40} style={styles.breakdownCard}>
              <View style={styles.breakdownCopy}>
                <Text style={styles.breakdownTitle}>{restaurant.name}</Text>
                <Text style={styles.breakdownMeta}>
                  {restaurant.orders} order{restaurant.orders === 1 ? "" : "s"} tracked today
                </Text>
              </View>
              <Text style={styles.breakdownValue}>
                {restaurant.pausedItems} paused item{restaurant.pausedItems === 1 ? "" : "s"}
              </Text>
            </FadeInView>
          ))}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontFamily: typography.display, fontSize: 22, color: colors.primary },
  headerSpacer: { width: 40 },
  hero: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 8,
  },
  heroTitle: { fontFamily: typography.display, fontSize: 28, color: colors.white },
  heroCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.86)",
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
  metricValue: { fontFamily: typography.display, fontSize: 28, color: colors.primary },
  metricLabel: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  insightCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  sectionBlock: { gap: 12 },
  sectionTitle: { fontFamily: typography.display, fontSize: 20, color: colors.primary },
  insightText: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.text },
  breakdownCard: {
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  breakdownCopy: { flex: 1, gap: 4 },
  breakdownTitle: { fontFamily: typography.display, fontSize: 17, color: colors.primary },
  breakdownMeta: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  breakdownValue: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.surfaceDeep,
    textAlign: "right",
  },
});
