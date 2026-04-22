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
import { CustomButton } from "./customButton";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

const quickLinks = [
  {
    id: "orders",
    title: "Live Orders",
    detail: "Monitor kitchen progress, delivery readiness, and issues.",
    icon: "shopping-bag",
    route: "/admin-orders",
  },
  {
    id: "restaurants",
    title: "Restaurants",
    detail:
      "Approve locations, review prep times, and manage menu availability.",
    icon: "grid",
    route: "/admin-restaurants",
  },
  {
    id: "feedback",
    title: "Feedback",
    detail: "Review ratings, flagged comments, and service quality trends.",
    icon: "message-circle",
    route: "/admin-feedback",
  },
  {
    id: "analytics",
    title: "Analytics",
    detail:
      "Track throughput, quality, partner readiness, and staffing signals.",
    icon: "bar-chart-2",
    route: "/admin-analytics",
  },
] as const;

export default function AdminDashboardScreen() {
  const { adminFeedback, adminOrders, adminRestaurants, logout } =
    usePrototypeState();

  const metrics = useMemo(() => {
    const liveOrders = adminOrders.filter(
      (order) => order.status !== "Completed",
    ).length;
    const flaggedFeedback = adminFeedback.filter(
      (entry) => entry.flagged,
    ).length;
    const needsApproval = adminRestaurants.filter(
      (restaurant) => restaurant.status === "Needs Approval",
    ).length;

    return {
      liveOrders,
      flaggedFeedback,
      needsApproval,
    };
  }, [adminFeedback, adminOrders, adminRestaurants]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={40} style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Manager Console</Text>
            <Text style={styles.title}>FusionYum Ops at a glance</Text>
            <Text style={styles.subtitle}>
              Review active orders, partner readiness, fulfillment health, and
              quality signals in one place.
            </Text>
          </View>
          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace("/");
            }}
          >
            <Feather name="log-out" size={18} color={colors.background} />
          </Pressable>
        </FadeInView>

        <View style={styles.metricGrid}>
          <FadeInView delay={90} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.liveOrders}</Text>
            <Text style={styles.metricLabel}>Live orders</Text>
          </FadeInView>
          <FadeInView delay={130} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.needsApproval}</Text>
            <Text style={styles.metricLabel}>Awaiting approval</Text>
          </FadeInView>
          <FadeInView delay={170} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.flaggedFeedback}</Text>
            <Text style={styles.metricLabel}>Flagged reviews</Text>
          </FadeInView>
        </View>

        <FadeInView delay={220} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today&apos;s focus</Text>
          <Text style={styles.summaryCopy}>
            Pizza operations are trending slower than target, one dessert
            partner needs approval, and delivery feedback needs a quick review
            before the evening rush.
          </Text>
          <View style={styles.summaryActions}>
            <CustomButton
              title="Open Live Orders"
              variant="secondary"
              onPress={() => router.push("/admin-orders")}
            />
            <CustomButton
              title="View Analytics"
              variant="surface"
              onPress={() => router.push("/admin-analytics")}
            />
          </View>
        </FadeInView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Management Areas</Text>
        </View>

        {quickLinks.map((link, index) => (
          <FadeInView
            key={link.id}
            delay={270 + index * 50}
            style={styles.linkCard}
          >
            <View style={styles.linkIcon}>
              <Feather name={link.icon} size={18} color={colors.background} />
            </View>
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Text style={styles.linkDetail}>{link.detail}</Text>
            </View>
            <Pressable
              style={styles.linkButton}
              onPress={() => router.push(link.route as never)}
            >
              <Feather name="arrow-right" size={18} color={colors.primary} />
            </Pressable>
          </FadeInView>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Restaurant management</Text>
        </View>

        {adminRestaurants.map((restaurant, index) => (
          <FadeInView
            key={restaurant.id}
            delay={470 + index * 40}
            style={styles.restaurantCard}
          >
            <View style={styles.restaurantCardTop}>
              <View style={styles.restaurantCopy}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantDetail}>
                  {restaurant.cuisine} · Prep {restaurant.avgPrepTime} ·{" "}
                  {restaurant.manager}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{restaurant.status}</Text>
              </View>
            </View>

            <Text style={styles.restaurantMenuCount}>
              {restaurant.menuItems.length} menu items ready for availability
              and price controls
            </Text>

            <View style={styles.restaurantActions}>
              <Pressable
                style={styles.linkButton}
                onPress={() =>
                  router.push(`/admin-restaurant?id=${restaurant.id}`)
                }
              >
                <Feather name="menu" size={18} color={colors.primary} />
              </Pressable>
            </View>
          </FadeInView>
        ))}
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
  hero: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 20,
    flexDirection: "row",
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
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 30,
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
    gap: 14,
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
  summaryActions: { gap: 10 },
  sectionHeader: { paddingTop: 4 },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
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
  linkButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
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
});
