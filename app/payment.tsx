import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
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

type SplitPaymentCard = {
  id: string;
  amount: number;
  isCustom: boolean;
};

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
  const [splitCards, setSplitCards] = useState<SplitPaymentCard[]>([]);
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");

  const subtotal = getCartSubtotal(cartItems);
  const taxes = getCartTaxes(cartItems);
  const tipAmount = getTipAmount(cartItems, selectedTip, customTip);
  const total = subtotal + taxes + 5 + tipAmount;
  const hasItems = cartItems.length > 0;
  const itemCount = getCartItemCount(cartItems);

  // Calculate split amounts
  const splitAmounts = useMemo(() => {
    if (!splitPayEnabled || splitCards.length === 0) return [];

    const customCards = splitCards.filter((card) => card.isCustom);
    const equalCards = splitCards.filter((card) => !card.isCustom);

    if (splitMode === "equal") {
      const equalAmount = total / splitCards.length;
      return splitCards.map((card) => ({
        ...card,
        amount: equalAmount,
      }));
    } else {
      // Custom mode - distribute remaining amount equally among non-custom cards
      const customTotal = customCards.reduce(
        (sum, card) => sum + card.amount,
        0,
      );
      const remainingTotal = total - customTotal;
      const remainingCards = equalCards.length;

      if (remainingCards === 0) {
        // All cards are custom, just return as is
        return splitCards;
      }

      const equalAmount = remainingTotal / remainingCards;
      return splitCards.map((card) =>
        card.isCustom ? card : { ...card, amount: equalAmount },
      );
    }
  }, [splitCards, total, splitMode, splitPayEnabled]);

  const addSplitCard = (cardId: string) => {
    if (splitCards.length >= 5) return;

    const card = savedCards.find((c) => c.id === cardId);
    if (!card) return;

    // Check if card is already added
    if (splitCards.some((c) => c.id === cardId)) return;

    setSplitCards((prev) => [
      ...prev,
      {
        id: cardId,
        amount: 0,
        isCustom: false,
      },
    ]);
  };

  const removeSplitCard = (cardId: string) => {
    setSplitCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const toggleCardCustom = (cardId: string) => {
    setSplitCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, isCustom: !card.isCustom } : card,
      ),
    );
  };

  const updateCardAmount = (cardId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setSplitCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, amount: numAmount } : card,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>PAYMENT</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView
          delay={90}
          style={[styles.card, !savedCardsExpanded && styles.collapsedCard]}
        >
          <Pressable
            style={styles.rowHeader}
            onPress={toggleSavedCardsExpanded}
          >
            <Text style={styles.cardTitle}>
              Saved Cards ({savedCards.length})
            </Text>
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
                    style={[
                      styles.savedCard,
                      isSelected && styles.savedCardSelected,
                    ]}
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
                        <Text style={styles.savedCardMeta}>
                          **** **** **** {card.last4}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.savedCardRight}>
                      <Text style={styles.savedCardExpiry}>{card.expiry}</Text>
                      {isSelected ? (
                        <View style={styles.selectedDot} />
                      ) : (
                        <View style={styles.unselectedDot} />
                      )}
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
              <BrandLogo
                brand="discover"
                type="payment"
                imageStyle={styles.discoverLogo}
              />
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
            <Text style={styles.checkboxLabel}>
              Save this card for future purchases
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={210} style={styles.card}>
          <View style={styles.rowHeader}>
            <Text style={styles.cardTitle}>Split Pay</Text>
            <Pressable
              style={styles.enableButton}
              onPress={() => setSplitPayEnabled((current) => !current)}
            >
              <Text style={styles.enableButtonText}>
                {splitPayEnabled ? "Enabled" : "Enable"}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.splitPayCopy}>
            Split the bill between up to 5 cards. Choose equal split or set
            custom amounts.
          </Text>
          {splitPayEnabled ? (
            <View style={styles.splitPayContent}>
              {/* Split Mode Toggle */}
              <View style={styles.splitModeRow}>
                <Pressable
                  style={[
                    styles.splitModeButton,
                    splitMode === "equal" && styles.splitModeButtonActive,
                  ]}
                  onPress={() => setSplitMode("equal")}
                >
                  <Text
                    style={[
                      styles.splitModeText,
                      splitMode === "equal" && styles.splitModeTextActive,
                    ]}
                  >
                    Split Equally
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.splitModeButton,
                    splitMode === "custom" && styles.splitModeButtonActive,
                  ]}
                  onPress={() => setSplitMode("custom")}
                >
                  <Text
                    style={[
                      styles.splitModeText,
                      splitMode === "custom" && styles.splitModeTextActive,
                    ]}
                  >
                    Custom Amounts
                  </Text>
                </Pressable>
              </View>

              {/* Selected Cards for Split Pay */}
              {splitCards.length > 0 && (
                <View style={styles.splitCardsList}>
                  {splitCards.map((splitCard) => {
                    const card = savedCards.find((c) => c.id === splitCard.id);
                    if (!card) return null;

                    const splitAmount =
                      splitAmounts.find((sa) => sa.id === splitCard.id)
                        ?.amount || 0;

                    return (
                      <View key={splitCard.id} style={styles.splitCardItem}>
                        <View style={styles.splitCardInfo}>
                          <View style={styles.splitCardLogoWrap}>
                            <BrandLogo
                              brand={
                                card.brand === "VISA"
                                  ? "visa"
                                  : card.brand === "MASTERCARD"
                                    ? "mastercard"
                                    : "amex"
                              }
                              type="payment"
                              imageStyle={styles.splitCardLogo}
                            />
                          </View>
                          <View style={styles.splitCardCopy}>
                            <Text style={styles.splitCardName}>
                              {card.holder}
                            </Text>
                            <Text style={styles.splitCardMeta}>
                              **** **** **** {card.last4}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.splitCardControls}>
                          {splitMode === "custom" && (
                            <View style={styles.customAmountRow}>
                              <Pressable
                                style={[
                                  styles.customToggle,
                                  splitCard.isCustom &&
                                    styles.customToggleActive,
                                ]}
                                onPress={() => toggleCardCustom(splitCard.id)}
                              >
                                <Text
                                  style={[
                                    styles.customToggleText,
                                    splitCard.isCustom &&
                                      styles.customToggleTextActive,
                                  ]}
                                >
                                  {splitCard.isCustom ? "Custom" : "Auto"}
                                </Text>
                              </Pressable>
                              {splitCard.isCustom && (
                                <View style={styles.amountInput}>
                                  <Text style={styles.currencySymbol}>$</Text>
                                  <TextInput
                                    style={styles.amountField}
                                    value={splitCard.amount.toFixed(2)}
                                    onChangeText={(value) =>
                                      updateCardAmount(splitCard.id, value)
                                    }
                                    placeholder="0.00"
                                    placeholderTextColor="rgba(0,0,0,0.5)"
                                    keyboardType="numeric"
                                  />
                                </View>
                              )}
                            </View>
                          )}
                          <Text style={styles.splitAmount}>
                            {formatCurrency(splitAmount)}
                          </Text>
                          <Pressable
                            style={styles.removeCardButton}
                            onPress={() => removeSplitCard(splitCard.id)}
                          >
                            <Feather name="x" size={16} color={colors.danger} />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Add Card Section */}
              {splitCards.length < 5 && (
                <View style={styles.addCardSection}>
                  <Text style={styles.addCardTitle}>Add Payment Method</Text>
                  <View style={styles.availableCardsList}>
                    {savedCards
                      .filter(
                        (card) => !splitCards.some((sc) => sc.id === card.id),
                      )
                      .map((card) => (
                        <Pressable
                          key={card.id}
                          style={styles.availableCard}
                          onPress={() => addSplitCard(card.id)}
                        >
                          <View style={styles.availableCardLogoWrap}>
                            <BrandLogo
                              brand={
                                card.brand === "VISA"
                                  ? "visa"
                                  : card.brand === "MASTERCARD"
                                    ? "mastercard"
                                    : "amex"
                              }
                              type="payment"
                              imageStyle={styles.availableCardLogo}
                            />
                          </View>
                          <View style={styles.availableCardCopy}>
                            <Text style={styles.availableCardName}>
                              {card.brand}
                            </Text>
                            <Text style={styles.availableCardMeta}>
                              **** {card.last4}
                            </Text>
                          </View>
                          <Feather
                            name="plus"
                            size={16}
                            color={colors.primary}
                          />
                        </Pressable>
                      ))}
                  </View>
                </View>
              )}

              {/* Split Summary */}
              {splitCards.length > 0 && (
                <View style={styles.splitSummary}>
                  <View style={styles.splitSummaryRow}>
                    <Text style={styles.splitSummaryLabel}>Total Split</Text>
                    <Text style={styles.splitSummaryValue}>
                      {formatCurrency(
                        splitAmounts.reduce(
                          (sum, card) => sum + card.amount,
                          0,
                        ),
                      )}
                    </Text>
                  </View>
                  {splitAmounts.reduce((sum, card) => sum + card.amount, 0) !==
                    total && (
                    <Text style={styles.splitWarning}>
                      Split total doesn&apos;t match order total
                    </Text>
                  )}
                </View>
              )}
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
          style={[
            styles.footerButton,
            !hasItems && styles.footerButtonDisabled,
          ]}
          onPress={() => {
            if (hasItems) {
              placeOrder();
              router.push("/order-placed");
            } else {
              router.replace("/checkout");
            }
          }}
        >
          <Text style={styles.footerButtonText}>
            {hasItems ? "Confirm Order" : "Return to Checkout"}
          </Text>
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
  // Split Pay Styles
  splitPayContent: {
    gap: 16,
  },
  splitModeRow: {
    flexDirection: "row",
    gap: 8,
  },
  splitModeButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  splitModeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  splitModeText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  splitModeTextActive: {
    color: colors.white,
  },
  splitCardsList: {
    gap: 12,
  },
  splitCardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    gap: 12,
  },
  splitCardInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  splitCardLogoWrap: {
    width: 32,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  splitCardLogo: {
    width: 24,
    height: 16,
  },
  splitCardCopy: {
    flex: 1,
  },
  splitCardName: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  splitCardMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
  },
  splitCardControls: {
    alignItems: "flex-end",
    gap: 8,
  },
  customAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  customToggleText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text,
  },
  customToggleTextActive: {
    color: colors.white,
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
  },
  currencySymbol: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
    marginRight: 4,
  },
  amountField: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
    textAlign: "right",
  },
  splitAmount: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
    minWidth: 60,
    textAlign: "right",
  },
  removeCardButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  addCardSection: {
    gap: 12,
  },
  addCardTitle: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.text,
  },
  availableCardsList: {
    gap: 8,
  },
  availableCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  availableCardLogoWrap: {
    width: 32,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  availableCardLogo: {
    width: 24,
    height: 16,
  },
  availableCardCopy: {
    flex: 1,
  },
  availableCardName: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  availableCardMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
  },
  splitSummary: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    gap: 8,
  },
  splitSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  splitSummaryLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  splitSummaryValue: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  splitWarning: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.danger,
    textAlign: "center",
  },
});
