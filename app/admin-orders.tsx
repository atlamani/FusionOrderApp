import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import StaffAccessGate from "./StaffAccessGate";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  ORDER_ISSUE_RESOLUTION_LABELS,
  ORDER_ISSUE_TYPE_LABELS,
  REFUND_DESTINATION_LABELS,
} from "./Firebase/orderIssues";
import type {
  OrderIssueRefundDestination,
  OrderIssueResolutionAction,
} from "./Firebase/types";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

// Admin sees the full order pipeline as a read-only oversight view.
// Per Level 1 DFD, the restaurant role handles Preparing / Ready for Driver
// transitions; admin's responsibility is approvals, analytics, escalations,
// and customer support (issue resolution + cancellation).
const orderFilters = [
  "All",
  "Pending",
  "Preparing",
  "Ready for Driver",
  "Out for Delivery",
  "Completed",
] as const;

const RESOLUTION_OPTIONS: OrderIssueResolutionAction[] = [
  "refund",
  "credit",
  "redelivery",
  "no_action",
];

const DESTINATION_OPTIONS: OrderIssueRefundDestination[] = ["card", "credit"];

function parseOrderTotalToNumber(total: string): number | null {
  const parsed = Number.parseFloat(total.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function AdminOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const { adminOrders, resolveOrderIssue, cancelAdminOrder } = useAppState();
  const [activeFilter, setActiveFilter] =
    useState<(typeof orderFilters)[number]>("All");
  const [resolvingOrderId, setResolvingOrderId] = useState<string | null>(null);
  const [resolutionAction, setResolutionAction] =
    useState<OrderIssueResolutionAction>("refund");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionDestination, setResolutionDestination] =
    useState<OrderIssueRefundDestination>("card");
  const [resolutionAmount, setResolutionAmount] = useState("");
  const [submittingResolution, setSubmittingResolution] = useState(false);

  const handleSubmitResolution = async () => {
    if (!resolvingOrderId) return;
    setSubmittingResolution(true);
    try {
      const movesMoney =
        resolutionAction === "refund" || resolutionAction === "credit";
      const parsedAmount = movesMoney
        ? Number.parseFloat(resolutionAmount)
        : undefined;
      if (
        movesMoney &&
        (parsedAmount === undefined || !Number.isFinite(parsedAmount) || parsedAmount <= 0)
      ) {
        Alert.alert(
          "Enter an amount",
          "Refunds and credits need a dollar amount greater than $0.",
        );
        setSubmittingResolution(false);
        return;
      }

      await resolveOrderIssue({
        orderId: resolvingOrderId,
        action: resolutionAction,
        notes: resolutionNotes,
        refundDestination: movesMoney
          ? resolutionAction === "credit"
            ? "credit"
            : resolutionDestination
          : undefined,
        refundAmount: parsedAmount,
      });
      setResolvingOrderId(null);
      setResolutionNotes("");
      setResolutionAction("refund");
      setResolutionAmount("");
      setResolutionDestination("card");
    } catch (error) {
      Alert.alert(
        "Couldn't resolve issue",
        "Something went wrong saving the resolution. Please try again.",
      );
    } finally {
      setSubmittingResolution(false);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      "Cancel this order?",
      "The customer will be notified and the order will move to Completed.",
      [
        { text: "Keep order", style: "cancel" },
        {
          text: "Cancel order",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAdminOrder(orderId, "Cancelled by admin");
            } catch (error) {
              Alert.alert("Couldn't cancel", "Please try again.");
            }
          },
        },
      ],
    );
  };

  const visibleOrders = useMemo(
    () =>
      adminOrders.filter(
        (order) => activeFilter === "All" || order.status === activeFilter,
      ),
    [activeFilter, adminOrders],
  );

  return (
    <StaffAccessGate role="admin">
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
            onPress={() => goBackOrReplace("/admin-dashboard")}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>LIVE ORDERS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {orderFilters.map((filter) => {
            const active = filter === activeFilter;
            return (
              <Pressable
                key={filter}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visibleOrders.length === 0 ? (
          <FadeInView delay={100} style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No orders in this view</Text>
            <Text style={styles.emptyCopy}>
              Change the filter or wait for new customer checkouts to enter the live queue.
            </Text>
          </FadeInView>
        ) : null}

        {visibleOrders.map((order, index) => (
          <FadeInView
            key={order.id}
            delay={100 + index * 50}
            style={styles.orderCard}
          >
            <View style={styles.orderTop}>
              <View style={styles.orderCopy}>
                <Text style={styles.orderRestaurant}>{order.restaurant}</Text>
                <Text
                  style={styles.orderMeta}
                >{`${order.customer} | ${order.placedAt} | ETA ${order.eta}`}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{order.status}</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View>
                <Text style={styles.infoLabel}>Driver</Text>
                <Text style={styles.infoValue}>{order.driver}</Text>
              </View>
              <View>
                <Text style={styles.infoLabel}>Total</Text>
                <Text style={styles.infoValue}>{order.total}</Text>
              </View>
            </View>

            {order.issue ? (
              <View style={styles.issueBanner}>
                <View style={styles.issueRow}>
                  <Feather name="alert-circle" size={16} color={colors.warning} />
                  <View style={styles.issueCopy}>
                    {order.issueReport ? (
                      <Text style={styles.issueCategory}>
                        {ORDER_ISSUE_TYPE_LABELS[order.issueReport.type] ?? "Reported"}
                      </Text>
                    ) : null}
                    <Text style={styles.issueText}>{order.issue}</Text>
                  </View>
                </View>
                {order.issueReport &&
                order.issueReport.status !== "resolved" ? (
                  <Pressable
                    accessibilityLabel={`Resolve issue on order ${order.id}`}
                    accessibilityRole="button"
                    style={styles.issueResolveButton}
                    onPress={() => {
                      setResolvingOrderId(order.id);
                      setResolutionAction("refund");
                      setResolutionNotes("");
                      setResolutionDestination("card");
                      const total = parseOrderTotalToNumber(order.total);
                      setResolutionAmount(total ? total.toFixed(2) : "");
                    }}
                  >
                    <Text style={styles.issueResolveText}>Resolve Issue</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {order.issueReport?.status === "resolved" &&
            order.issueReport.resolution ? (
              <View style={styles.resolutionBanner}>
                <Feather name="check-circle" size={14} color={colors.success} />
                <Text style={styles.resolutionText}>
                  {order.issueReport.resolution.customerMessage ??
                    `${ORDER_ISSUE_RESOLUTION_LABELS[order.issueReport.resolution.action]}${
                      order.issueReport.resolution.notes
                        ? ` — ${order.issueReport.resolution.notes}`
                        : ""
                    }`}
                </Text>
              </View>
            ) : null}

            {resolvingOrderId === order.id ? (
              <View style={styles.resolveCard}>
                <Text style={styles.resolveTitle}>Resolution action</Text>
                <View style={styles.resolveOptions}>
                  {RESOLUTION_OPTIONS.map((option) => {
                    const active = option === resolutionAction;
                    return (
                      <Pressable
                        key={option}
                        style={[
                          styles.resolveOption,
                          active && styles.resolveOptionActive,
                        ]}
                        onPress={() => setResolutionAction(option)}
                      >
                        <Text
                          style={[
                            styles.resolveOptionText,
                            active && styles.resolveOptionTextActive,
                          ]}
                        >
                          {ORDER_ISSUE_RESOLUTION_LABELS[option]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {resolutionAction === "refund" ? (
                  <>
                    <Text style={styles.resolveSubLabel}>Send refund to</Text>
                    <View style={styles.resolveOptions}>
                      {DESTINATION_OPTIONS.map((option) => {
                        const active = option === resolutionDestination;
                        return (
                          <Pressable
                            key={option}
                            style={[
                              styles.resolveOption,
                              active && styles.resolveOptionActive,
                            ]}
                            onPress={() => setResolutionDestination(option)}
                          >
                            <Text
                              style={[
                                styles.resolveOptionText,
                                active && styles.resolveOptionTextActive,
                              ]}
                            >
                              {option === "card"
                                ? "Original card"
                                : "FusionYum credit"}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : null}

                {resolutionAction === "refund" ||
                resolutionAction === "credit" ? (
                  <>
                    <Text style={styles.resolveSubLabel}>Amount</Text>
                    <View style={styles.resolveAmountRow}>
                      <Text style={styles.resolveAmountSymbol}>$</Text>
                      <TextInput
                        accessibilityLabel="Resolution amount in dollars"
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor="rgba(31, 42, 31, 0.44)"
                        style={styles.resolveAmountInput}
                        value={resolutionAmount}
                        onChangeText={setResolutionAmount}
                      />
                      <Text style={styles.resolveAmountHint}>
                        of {order.total}
                      </Text>
                    </View>
                  </>
                ) : null}

                <TextInput
                  accessibilityLabel="Resolution notes"
                  multiline
                  placeholder="Add notes for the customer record (optional)"
                  placeholderTextColor="rgba(31, 42, 31, 0.44)"
                  style={styles.resolveInput}
                  value={resolutionNotes}
                  onChangeText={setResolutionNotes}
                />
                <View style={styles.resolveActions}>
                  <Pressable
                    style={[styles.resolveActionButton, styles.resolveCancel]}
                    disabled={submittingResolution}
                    onPress={() => {
                      setResolvingOrderId(null);
                      setResolutionNotes("");
                    }}
                  >
                    <Text style={styles.resolveCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.resolveActionButton, styles.resolveConfirm]}
                    disabled={submittingResolution}
                    onPress={handleSubmitResolution}
                  >
                    <Text style={styles.resolveConfirmText}>
                      {submittingResolution ? "Saving..." : "Save Resolution"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {/*
             * Per the Level 1 DFD, the restaurant role transitions orders
             * Preparing -> Ready for Driver. The admin's only direct order
             * actions are escalations: cancellation and issue resolution.
             */}
            {order.status === "Pending" ||
            order.status === "Preparing" ||
            order.status === "Ready for Driver" ||
            order.status === "Out for Delivery" ? (
              <View style={styles.actionRow}>
                <View style={styles.statusHint}>
                  <Feather name="info" size={12} color={colors.textMuted} />
                  <Text style={styles.statusHintText}>
                    {order.status === "Pending" ||
                    order.status === "Preparing"
                      ? "Restaurant marks Preparing / Ready"
                      : order.status === "Ready for Driver"
                        ? "Awaiting driver pickup"
                        : "Driver delivering"}
                  </Text>
                </View>
                {order.status !== "Out for Delivery" ? (
                  <Pressable
                    accessibilityLabel={`Cancel order ${order.id}`}
                    accessibilityRole="button"
                    style={styles.cancelOrderButton}
                    onPress={() => handleCancelOrder(order.id)}
                  >
                    <Text style={styles.cancelOrderText}>Cancel Order</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: safeHeaderButtonSize,
    height: safeHeaderButtonSize,
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
  headerSpacer: { width: safeHeaderButtonSize },
  filterRow: { gap: 10, paddingRight: 20 },
  filterChip: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: colors.surface,
    borderColor: colors.surface,
  },
  filterText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  filterTextActive: { color: colors.white },
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
  orderTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  orderCopy: { flex: 1, gap: 4 },
  orderRestaurant: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  orderMeta: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surfaceDeep,
  },
  infoGrid: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.text,
  },
  issueBanner: {
    borderRadius: 16,
    backgroundColor: "#FFF4E6",
    padding: 12,
    gap: 10,
  },
  issueRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  issueCopy: { flex: 1, gap: 2 },
  issueCategory: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.warning,
    letterSpacing: 0.5,
  },
  issueText: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  issueResolveButton: {
    alignSelf: "flex-start",
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.warning,
    justifyContent: "center",
    alignItems: "center",
  },
  issueResolveText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  resolutionBanner: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#ECFDF3",
  },
  resolutionText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.success,
  },
  resolveCard: {
    borderRadius: 16,
    backgroundColor: colors.background,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resolveTitle: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  resolveSubLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  resolveAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  resolveAmountSymbol: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  resolveAmountInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  resolveAmountHint: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  resolveOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resolveOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resolveOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  resolveOptionText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.primary,
  },
  resolveOptionTextActive: {
    color: colors.background,
  },
  resolveInput: {
    minHeight: 64,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
    textAlignVertical: "top",
  },
  resolveActions: {
    flexDirection: "row",
    gap: 8,
  },
  resolveActionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  resolveCancel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resolveCancelText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  resolveConfirm: {
    backgroundColor: colors.primary,
  },
  resolveConfirmText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.background,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cancelOrderButton: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelOrderText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.danger,
  },
  statusHint: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusHintText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
