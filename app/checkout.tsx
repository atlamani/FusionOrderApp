import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { checkoutOrder } from "./mockData";
import { colors, typography } from "./theme";

export default function CheckoutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <View>
              <View style={styles.addressTitleRow}>
                <Feather name="map-pin" size={16} color={colors.surface} />
                <Text style={styles.addressTitle}>Delivery Address</Text>
              </View>
              <Text style={styles.addressValue}>{checkoutOrder.address}</Text>
              <Text style={styles.addressEta}>{checkoutOrder.eta}</Text>
            </View>
            <Pressable style={styles.editButton}>
              <Feather name="edit-2" size={16} color={colors.surfaceDeep} />
            </Pressable>
          </View>
          <View style={styles.mapPlaceholder} />
        </View>

        <View style={styles.sectionHeader}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.sectionHeaderText}>CHECKOUT</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle}>Your Order</Text>
            <Pressable style={styles.pillButton}>
              <Text style={styles.pillButtonText}>+ Add Items</Text>
            </Pressable>
          </View>
          <Text style={styles.restaurantLabel}>From {checkoutOrder.restaurant}</Text>

          <View style={styles.orderRow}>
            <View style={styles.orderCopy}>
              <Text style={styles.orderItem}>{checkoutOrder.item.name}</Text>
              <Text style={styles.orderPrice}>{checkoutOrder.item.priceEach}</Text>
            </View>
            <View style={styles.quantityWrap}>
              <View style={styles.quantityControl}>
                <Pressable style={styles.quantityButton}>
                  <Feather name="minus" size={14} color={colors.text} />
                </Pressable>
                <Text style={styles.quantityValue}>{checkoutOrder.item.quantity}</Text>
                <Pressable style={styles.quantityButton}>
                  <Feather name="plus" size={14} color={colors.text} />
                </Pressable>
              </View>
              <Pressable style={styles.deleteButton}>
                <Feather name="trash-2" size={14} color="#dc2626" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tip Your Driver</Text>
          <View style={styles.tipRow}>
            {checkoutOrder.tipOptions.map((tip) => {
              const isActive = tip === checkoutOrder.selectedTip;
              return (
                <Pressable key={tip} style={[styles.tipOption, isActive && styles.tipOptionActive]}>
                  <Text style={[styles.tipOptionText, isActive && styles.tipOptionTextActive]}>{tip}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Custom Tip</Text>
          <View style={styles.currencyInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.currencyField}
              value={checkoutOrder.customTip}
              placeholder="0.00"
              placeholderTextColor="rgba(0,0,0,0.5)"
            />
          </View>

          <View style={styles.tipAmountRow}>
            <Text style={styles.tipAmountLabel}>Tip Amount</Text>
            <Text style={styles.tipAmountValue}>{checkoutOrder.tipAmount}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{checkoutOrder.summary.subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{checkoutOrder.summary.deliveryFee}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes</Text>
            <Text style={styles.summaryValue}>{checkoutOrder.summary.taxes}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Driver Tip</Text>
            <Text style={styles.summaryValue}>{checkoutOrder.summary.driverTip}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{checkoutOrder.summary.total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.footerButton} onPress={() => router.push("/payment")}>
          <Text style={styles.footerButtonText}>Proceed to Payment · {checkoutOrder.summary.total}</Text>
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
    paddingTop: 110,
    paddingHorizontal: 16,
    paddingBottom: 110,
    gap: 24,
  },
  addressCard: {
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
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  addressTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
  },
  addressValue: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  addressEta: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    height: 192,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  sectionHeader: {
    marginHorizontal: -16,
    backgroundColor: colors.surface,
    minHeight: 96,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeaderText: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.white,
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
  cardTopRow: {
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
  pillButton: {
    paddingHorizontal: 16,
    minHeight: 36,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  pillButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.surface,
  },
  restaurantLabel: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.surface,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  orderCopy: {
    flex: 1,
    gap: 4,
  },
  orderItem: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
  },
  orderPrice: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
  },
  quantityWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 8,
    minHeight: 36,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.text,
    minWidth: 24,
    textAlign: "center",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  tipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  tipOption: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  tipOptionActive: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tipOptionText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.text,
  },
  tipOptionTextActive: {
    color: colors.white,
  },
  inputLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.7)",
  },
  currencyInput: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.9,
    borderColor: colors.background,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currencySymbol: {
    fontFamily: typography.display,
    fontSize: 16,
    color: "rgba(0,0,0,0.6)",
  },
  currencyField: {
    flex: 1,
    fontFamily: typography.display,
    fontSize: 16,
    color: "rgba(0,0,0,0.5)",
  },
  tipAmountRow: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "rgba(115,144,114,0.1)",
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tipAmountLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.7)",
  },
  tipAmountValue: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.surface,
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
