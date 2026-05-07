import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import StaffAccessGate from "./StaffAccessGate";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getRolePortalTopInset,
  rolePortalHeaderSize,
} from "./rolePortalLayout";
import { colors, spacing, typography } from "./theme";

export default function RestaurantOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getRolePortalTopInset(insets.top);
  const {
    adminOrders,
    selectedPartnerRestaurantId,
    sessionMode,
    updateAdminOrderStatus,
  } = useAppState();

  // The Google aggregator account fulfills orders for any restaurant
  // discovered via the Google Places API. Match every order whose
  // restaurantId carries the `google-` prefix instead of a single one.
  const isGoogleAggregator = sessionMode === "googleAggregator";

  const orders = useMemo(
    () =>
      isGoogleAggregator
        ? adminOrders.filter((order) =>
            order.restaurantId.startsWith("google-"),
          )
        : adminOrders.filter(
            (order) => order.restaurantId === selectedPartnerRestaurantId,
          ),
    [adminOrders, isGoogleAggregator, selectedPartnerRestaurantId],
  );

  return (
    <StaffAccessGate role="restaurant">
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
            onPress={() => goBackOrReplace("/restaurant-dashboard")}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {isGoogleAggregator ? "GOOGLE QUEUE" : "KITCHEN QUEUE"}
          </Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        {isGoogleAggregator ? (
          <FadeInView delay={70} style={styles.aggregatorBanner}>
            <Feather name="globe" size={16} color={colors.background} />
            <Text style={styles.aggregatorBannerText}>
              Showing every order placed against a restaurant discovered via
              Google Places. Each card shows the originating restaurant name.
            </Text>
          </FadeInView>
        ) : null}

        {orders.length === 0 ? (
          <FadeInView delay={90} style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No kitchen orders</Text>
            <Text style={styles.emptyCopy}>
              {isGoogleAggregator
                ? "Orders placed against any Google Places restaurant will appear here."
                : "New orders for this restaurant will appear here when customers check out."}
            </Text>
          </FadeInView>
        ) : null}

        {orders.map((order, index) => (
          <FadeInView key={order.id} delay={90 + index * 50} style={styles.orderCard}>
            <View style={styles.cardTop}>
              <View style={styles.copy}>
                {isGoogleAggregator ? (
                  <Text style={styles.restaurantTitle}>{order.restaurant}</Text>
                ) : null}
                <Text style={styles.customer}>{order.customer}</Text>
                <Text style={styles.meta}>{`${order.id} | ${order.placedAt} | ${order.total}`}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>

            <View style={styles.driverRow}>
              <Feather name="truck" size={15} color={colors.surfaceDeep} />
              <Text style={styles.driverText}>{order.driver}</Text>
            </View>

            {order.issue ? (
              <View style={styles.issueBanner}>
                <Text style={styles.issueText}>{order.issue}</Text>
              </View>
            ) : null}

            <View style={styles.actionRow}>
              {order.status === "Pending" ? (
                <Pressable style={styles.primaryAction} onPress={() => updateAdminOrderStatus(order.id, "Preparing")}>
                  <Text style={styles.primaryActionText}>Start Prep</Text>
                </Pressable>
              ) : order.status === "Preparing" ? (
                <Pressable
                  style={styles.primaryAction}
                  onPress={() => updateAdminOrderStatus(order.id, "Ready for Driver")}
                >
                  <Text style={styles.primaryActionText}>Mark Ready</Text>
                </Pressable>
              ) : (
                <View style={styles.donePill}>
                  <Text style={styles.doneText}>
                    {order.status === "Ready for Driver" ? "Waiting for pickup" : "Handed off"}
                  </Text>
                </View>
              )}
            </View>
          </FadeInView>
        ))}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: {
    width: rolePortalHeaderSize,
    height: rolePortalHeaderSize,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontFamily: typography.display, fontSize: 22, color: colors.primary },
  headerSpacer: { width: rolePortalHeaderSize },
  orderCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  emptyCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  emptyCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  copy: { flex: 1, gap: 4 },
  restaurantTitle: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.surface,
    letterSpacing: 0.5,
  },
  customer: { fontFamily: typography.display, fontSize: 20, color: colors.primary },
  meta: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  aggregatorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  aggregatorBannerText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.background,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: { fontFamily: typography.display, fontSize: 12, color: colors.surfaceDeep },
  driverRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  driverText: { fontFamily: typography.body, fontSize: 13, color: colors.text },
  issueBanner: {
    borderRadius: 14,
    backgroundColor: "#FFF4E6",
    padding: 10,
  },
  issueText: { fontFamily: typography.body, fontSize: 12, color: colors.warning },
  actionRow: { flexDirection: "row", justifyContent: "flex-end" },
  primaryAction: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  primaryActionText: { fontFamily: typography.display, fontSize: 14, color: colors.background },
  donePill: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#ECFDF3",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  doneText: { fontFamily: typography.display, fontSize: 14, color: colors.success },
});
