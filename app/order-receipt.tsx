import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { savedCards } from "./mockData";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function OrderReceiptScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const { currentOrder, orderHistory, profile, selectedCardId } = usePrototypeState();
  const order = useMemo(
    () => {
      const entries = currentOrder ? [currentOrder, ...orderHistory] : orderHistory;
      return entries.find((entry) => entry.id === params.orderId) ?? currentOrder ?? orderHistory[0];
    },
    [currentOrder, orderHistory, params.orderId],
  );
  const paymentCard = savedCards.find((card) => card.id === selectedCardId) ?? savedCards[0];

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No receipt available yet</Text>
          <Text style={styles.emptyCopy}>Place an order or open a previous receipt from activity history.</Text>
          <Pressable style={styles.primaryAction} onPress={() => router.replace("/home")}>
            <Text style={styles.primaryActionText}>Browse Restaurants</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>RECEIPT</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.card}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.restaurant}>{order.restaurant}</Text>
          <Text style={styles.dateText}>Receipt generated for demo review</Text>
        </FadeInView>

        <FadeInView delay={160} style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          <View style={styles.itemList}>
            {order.items.map((item) => (
              <View key={item} style={styles.itemRow}>
                <Text style={styles.itemName}>{item}</Text>
                <Text style={styles.itemPrice}>Included</Text>
              </View>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={220} style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Paid with</Text>
            <Text style={styles.metaValue}>
              {paymentCard.brand} ending in {paymentCard.last4}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Delivery to</Text>
            <Text style={styles.metaValue}>{profile.address}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.total}</Text>
          </View>
        </FadeInView>

        <FadeInView delay={280} style={styles.actions}>
          <Pressable style={styles.primaryAction} onPress={() => router.push("/help-center?topic=payment")}>
            <Text style={styles.primaryActionText}>Need Billing Help?</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => router.push("/activity-history")}>
            <Text style={styles.secondaryActionText}>Back to History</Text>
          </Pressable>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 26,
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
  headerSpacer: {
    width: 40,
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: spacing.md,
  },
  orderId: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  restaurant: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primary,
  },
  dateText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  itemList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  itemPrice: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.surfaceDeep,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  metaLabel: {
    width: 92,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  metaValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  totalValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.surface,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionText: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.background,
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryActionText: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.primary,
  },
});
