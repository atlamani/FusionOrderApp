import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function RestaurantOrdersScreen() {
  const { adminOrders, selectedPartnerRestaurantId, updateAdminOrderStatus } = usePrototypeState();

  const orders = useMemo(
    () => adminOrders.filter((order) => order.restaurantId === selectedPartnerRestaurantId),
    [adminOrders, selectedPartnerRestaurantId],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>KITCHEN QUEUE</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        {orders.map((order, index) => (
          <FadeInView key={order.id} delay={90 + index * 50} style={styles.orderCard}>
            <View style={styles.cardTop}>
              <View style={styles.copy}>
                <Text style={styles.customer}>{order.customer}</Text>
                <Text style={styles.meta}>{`${order.id} · ${order.placedAt} · ${order.total}`}</Text>
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
  customer: { fontFamily: typography.display, fontSize: 20, color: colors.primary },
  meta: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
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
