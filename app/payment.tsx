import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import BrandLogo from "./BrandLogo";
import FadeInView from "./FadeInView";
import { savedCards } from "./mockData";
import {
  formatCurrency,
  getCartItemCount,
  getCartSubtotal,
  getCartTaxes,
  getTipAmount,
  usePrototypeState,
} from "./prototypeState";
import { colors, typography } from "./theme";

export default function PaymentScreen() {
  const {
    cartItems,
    customTip,
    placeOrder,
    savedCardsExpanded,
    selectedCardId,
    selectedTip,
    toggleSavedCardsExpanded,
    selectCard,
  } = usePrototypeState();
  const [splitPayEnabled, setSplitPayEnabled] = useState(false);

  const subtotal = getCartSubtotal(cartItems);
  const taxes = getCartTaxes(cartItems);
  const tipAmount = getTipAmount(cartItems, selectedTip, customTip);
  const total = subtotal + taxes + 5 + tipAmount;
  const hasItems = cartItems.length > 0;
  const itemCount = getCartItemCount(cartItems);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>PAYMENT</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={[styles.card, !savedCardsExpanded && styles.collapsedCard]}>
          <Pressable style={styles.rowHeader} onPress={toggleSavedCardsExpanded}>
            <Text style={styles.cardTitle}>Saved Cards ({savedCards.length})</Text>
            <Feather
              name={savedCardsExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.text}
            />
          </Pressable>

          {savedCardsExpanded ? (
            <View style={styles.savedCardsList}>
              {savedCards.map((card) => {
                const isSelected = card.id === selectedCardId;

                return (
                  <Pressable
                    key={card.id}
                    style={[styles.savedCard, isSelected && styles.savedCardSelected]}
                    onPress={() => selectCard(card.id)}
                  >
                    <View style={styles.savedCardLeft}>
                      <View style={styles.savedCardLogoWrap}>
                        <BrandLogo
                          brand={
                            card.brand === "VISA"
                              ? "visa"
                              : card.brand === "MASTERCARD"
                                ? "mastercard"
                                : "amex"
                          }
                          type="payment"
                          imageStyle={styles.savedCardLogo}
                        />
                      </View>
                      <View style={styles.savedCardCopy}>
                        <Text style={styles.savedCardName}>{card.holder}</Text>
                        <Text style={styles.savedCardMeta}>**** **** **** {card.last4}</Text>
                      </View>
                    </View>
                    <View style={styles.savedCardRight}>
                      <Text style={styles.savedCardExpiry}>{card.expiry}</Text>
                      {isSelected ? <View style={styles.selectedDot} /> : <View style={styles.unselectedDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </FadeInView>

        <FadeInView delay={150} style={styles.card}>
          <Text style={styles.cardTitle}>Add New Card</Text>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <BrandLogo brand="visa" type="payment" />
            </View>
            <View style={styles.brandBadge}>
              <BrandLogo brand="mastercard" type="payment" />
            </View>
            <View style={styles.brandBadge}>
              <BrandLogo brand="amex" type="payment" />
            </View>
            <View style={styles.brandBadge}>
              <BrandLogo brand="discover" type="payment" imageStyle={styles.discoverLogo} />
            </View>
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
            <View style={styles.checkbox}>
              <Feather name="check" size={12} color={colors.surfaceDeep} />
            </View>
            <Text style={styles.checkboxLabel}>Save this card for future purchases</Text>
          </View>
        </FadeInView>

        <FadeInView delay={210} style={styles.card}>
          <View style={styles.rowHeader}>
            <Text style={styles.cardTitle}>Split Pay</Text>
            <Pressable style={styles.enableButton} onPress={() => setSplitPayEnabled((current) => !current)}>
              <Text style={styles.enableButtonText}>{splitPayEnabled ? "Enabled" : "Enable"}</Text>
            </Pressable>
          </View>
          <Text style={styles.splitPayCopy}>
            Invite a friend to cover drinks or dessert. This stays mock-only in the prototype.
          </Text>
          {splitPayEnabled ? (
            <View style={styles.splitPayActive}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={styles.splitPayActiveText}>Split pay invite ready to send after confirmation.</Text>
            </View>
          ) : null}
        </FadeInView>

        <FadeInView delay={270} style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{itemCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>$5.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes</Text>
            <Text style={styles.summaryValue}>{formatCurrency(taxes)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tip ({selectedTip})</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tipAmount)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </FadeInView>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.footerButton, !hasItems && styles.footerButtonDisabled]}
          onPress={() => {
            if (hasItems) {
              placeOrder();
              router.push("/order-placed");
            } else {
              router.replace("/checkout");
            }
          }}
        >
          <Text style={styles.footerButtonText}>{hasItems ? "Confirm Order" : "Return to Checkout"}</Text>
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
  collapsedCard: {
    minHeight: 60,
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
    minHeight: 72,
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  savedCardSelected: {
    borderColor: colors.surface,
  },
  savedCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  savedCardLogoWrap: {
    width: 78,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  savedCardLogo: {
    width: 56,
    height: 20,
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
  savedCardRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  savedCardExpiry: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
  },
  selectedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.surface,
  },
  unselectedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.25)",
    backgroundColor: colors.white,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  brandBadge: {
    minWidth: 78,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  discoverLogo: {
    width: 46,
    height: 16,
  },
  inputMock: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
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
    borderColor: "rgba(0,0,0,0.15)",
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.7)",
  },
  enableButton: {
    minWidth: 88,
    minHeight: 37,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
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
  splitPayCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(0,0,0,0.7)",
  },
  splitPayActive: {
    borderRadius: 14,
    backgroundColor: "#ECFDF3",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  splitPayActiveText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.success,
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
  footerButtonDisabled: {
    opacity: 0.5,
  },
  footerButtonText: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.white,
  },
});
