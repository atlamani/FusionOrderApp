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
} from "./Firebase/orderIssues";
import type { OrderIssueResolutionAction } from "./Firebase/types";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

const orderFilters = [
  "All",
  "Pending",
  "Preparing",
  "Ready for Driver",
] as const;

const nextManagerStatus: Record<
  "Pending" | "Preparing" | "Ready for Driver",
  "Preparing" | "Ready for Driver" | null
> = {
  Pending: "Preparing",
  Preparing: "Ready for Driver",
  "Ready for Driver": null,
};

const RESOLUTION_OPTIONS: OrderIssueResolutionAction[] = [
  "refund",
  "credit",
  "redelivery",
  "no_action",
];

export default function AdminOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const {
    adminOrders,
    updateAdminOrderStatus,
    resolveOrderIssue,
    cancelAdminOrder,
  } = useAppState();
  const [activeFilter, setActiveFilter] =
    useState<(typeof orderFilters)[number]>("All");
  const [resolvingOrderId, setResolvingOrderId] = useState<string | null>(null);
  const [resolutionAction, setResolutionAction] =
    useState<OrderIssueResolutionAction>("refund");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submittingResolution, setSubmittingResolution] = useState(false);

  const handleSubmitResolution = async () => {
    if (!resolvingOrderId) return;
    setSubmittingResolution(true);
    try {
      await resolveOrderIssue({
        orderId: resolvingOrderId,
        action: resolutionAction,
        notes: resolutionNotes,
      });
      setResolvingOrderId(null);
      setResolutionNotes("");
      setResolutionAction("refund");
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
                  Resolved · {ORDER_ISSUE_RESOLUTION_LABELS[order.issueReport.resolution.action]}
                  {order.issueReport.resolution.notes
                    ? ` — ${order.issueReport.resolution.notes}`
                    : ""}
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

            <View style={styles.actionRow}>
              {order.status === "Pending" ||
              order.status === "Preparing" ||
              order.status === "Ready for Driver"
                ? (() => {
                    const currentStatus = order.status;
                    const nextStatus = nextManagerStatus[currentStatus];

                    return (
                      <>
                        <Pressable
                          accessibilityLabel={`Cancel order ${order.id}`}
                          accessibilityRole="button"
                          style={styles.cancelOrderButton}
                          onPress={() => handleCancelOrder(order.id)}
                        >
                          <Text style={styles.cancelOrderText}>Cancel</Text>
                        </Pressable>
                        {nextStatus ? (
                          <Pressable
                            style={styles.primaryAction}
                            onPress={() => {
                              updateAdminOrderStatus(order.id, nextStatus);
                            }}
                          >
                            <Text style={styles.primaryActionText}>
                              {currentStatus === "Pending"
                                ? "Start Preparing"
                                : "Mark Ready for Driver"}
                            </Text>
                          </Pressable>
                        ) : (
                          <View style={styles.completedPill}>
                            <Text style={styles.completedPillText}>
                              Waiting for Driver
                            </Text>
                          </View>
                        )}
                      </>
                    );
                  })()
                : null}
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
  actionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
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
  primaryAction: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryActionText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
  completedPill: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  completedPillText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.success,
  },
});
