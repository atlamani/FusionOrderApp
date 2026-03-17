import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { checkoutOrder, savedCards } from "./mockData";
import { colors, typography } from "./theme";

function BrandMark({ brand }: { brand: string }) {
  if (brand === "VISA") {
    return <Text style={[styles.brandText, { color: "#1D4ED8" }]}>VISA</Text>;
  }

  if (brand === "MASTERCARD") {
    return (
      <View style={styles.mastercardWrap}>
        <View style={[styles.mastercardCircle, { backgroundColor: "#EF4444" }]} />
        <View style={[styles.mastercardCircle, styles.mastercardOverlap, { backgroundColor: "#F59E0B" }]} />
      </View>
    );
  }

  return <Text style={[styles.brandText, { color: "#2563EB" }]}>AMEX</Text>;
}

export default function PaymentScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>PAYMENT</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <View style={styles.rowHeader}>
            <Text style={styles.cardTitle}>Saved Cards (3)</Text>
            <Feather name="chevron-up" size={20} color={colors.text} />
          </View>
          <View style={styles.savedCardsList}>
            {savedCards.map((card) => (
              <View key={card.id} style={styles.savedCard}>
                <View style={styles.savedCardLeft}>
                  <BrandMark brand={card.brand} />
                  <View style={styles.savedCardCopy}>
                    <Text style={styles.savedCardName}>{card.holder}</Text>
                    <Text style={styles.savedCardMeta}>**** **** **** {card.last4}</Text>
                  </View>
                </View>
                <Text style={styles.savedCardExpiry}>{card.expiry}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Card</Text>
          <View style={styles.brandRow}>
            <BrandMark brand="VISA" />
            <BrandMark brand="MASTERCARD" />
            <BrandMark brand="AMEX" />
            <Text style={[styles.brandText, { color: "#D97706" }]}>DISC</Text>
          </View>
          <View style={styles.inputMock}>
            <Text style={styles.inputText}>Card Number</Text>
          </View>
          <View style={styles.inputMock}>
            <Text style={styles.inputText}>Name on Card</Text>
          </View>
          <View style={styles.twoCol}>
            <View style={[styles.inputMock, styles.halfInput]}>
              <Text style={styles.inputText}>MM/YY</Text>
            </View>
            <View style={[styles.inputMock, styles.halfInput]}>
              <Text style={styles.inputText}>CVV</Text>
            </View>
          </View>
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox} />
            <Text style={styles.checkboxLabel}>Save this card for future purchases</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowHeader}>
            <Text style={styles.cardTitle}>Split Pay</Text>
            <Pressable style={styles.enableButton}>
              <Text style={styles.enableButtonText}>Enable</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{checkoutOrder.summary.deliveryFee}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tip (10%)</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>$5.00</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.footerButton} onPress={() => router.push("/order-placed")}>
          <Text style={styles.footerButtonText}>Confirm Order</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 120,
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 24,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    minHeight: 96,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    zIndex: 2,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.white,
  },
  headerSpacer: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.text,
  },
  savedCardsList: {
    gap: 12,
  },
  savedCard: {
    minHeight: 68,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  savedCardCopy: {
    gap: 2,
  },
  savedCardName: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.text,
  },
  savedCardMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
  },
  savedCardExpiry: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandText: {
    fontFamily: typography.display,
    fontSize: 14,
  },
  mastercardWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  mastercardCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  mastercardOverlap: {
    marginLeft: -6,
  },
  inputMock: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 0.638,
    borderColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  inputText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.5)",
  },
  twoCol: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.4)",
  },
  checkboxLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.7)",
  },
  enableButton: {
    minWidth: 88,
    minHeight: 37,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 0.638,
    borderColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  enableButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.text,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: typography.body,
    fontSize: 16,
    color: "rgba(0,0,0,0.7)",
  },
  summaryValue: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  totalLabel: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.text,
  },
  totalValue: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.surface,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  footerButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  footerButtonText: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.white,
  },
});
