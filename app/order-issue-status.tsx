import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import {
  ORDER_ISSUE_RESOLUTION_LABELS,
  ORDER_ISSUE_TYPE_LABELS,
} from "./Firebase/orderIssues";
import { getOrder, subscribeToOrderUpdates } from "./Firebase/orders";
import type {
  Order,
  OrderIssueReport,
  OrderIssueResolution,
} from "./Firebase/types";
import { goBackOrReplace } from "./navigation";
import { getSafeHeaderTopPadding } from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

type TimelineEntry = {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  timestamp: string;
  highlight?: boolean;
};

function timestampToMs(value: unknown): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const stamp = value as { toMillis?: () => number; toDate?: () => Date };
  if (typeof stamp.toMillis === "function") return stamp.toMillis();
  if (typeof stamp.toDate === "function") return stamp.toDate().getTime();
  return 0;
}

function formatTimestamp(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildTimeline(issueReport: OrderIssueReport): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  const reportedMs = timestampToMs(issueReport.reportedAt);

  entries.push({
    id: "reported",
    icon: "alert-circle",
    title: "You reported this order",
    body: `${ORDER_ISSUE_TYPE_LABELS[issueReport.type] ?? "Issue"}: ${
      issueReport.description || "No description provided."
    }`,
    timestamp: formatTimestamp(reportedMs),
  });

  if (issueReport.status === "in_progress") {
    entries.push({
      id: "reviewing",
      icon: "eye",
      title: "A manager is reviewing your order",
      body: "We'll send a resolution once we've taken a closer look.",
      timestamp: "",
    });
  }

  if (issueReport.status === "resolved" && issueReport.resolution) {
    const resolution: OrderIssueResolution = issueReport.resolution;
    const resolvedMs = timestampToMs(resolution.resolvedAt);
    entries.push({
      id: "reviewed",
      icon: "user-check",
      title: "A manager reviewed your order",
      body: "Thanks for the feedback — here's what we did about it.",
      timestamp: formatTimestamp(
        Math.max(resolvedMs - 60_000, reportedMs + 60_000),
      ),
    });
    entries.push({
      id: "resolved",
      icon: "check-circle",
      title:
        ORDER_ISSUE_RESOLUTION_LABELS[resolution.action] ?? "Issue resolved",
      body:
        resolution.customerMessage ??
        resolution.notes ??
        "Your report has been resolved.",
      timestamp: formatTimestamp(resolvedMs),
      highlight: true,
    });
  }

  return entries;
}

export default function OrderIssueStatusScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const resolvedOrderId = Array.isArray(orderId) ? orderId[0] : orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedOrderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const initial = await getOrder(resolvedOrderId);
        if (!cancelled && initial) {
          setOrder(initial);
        }
        unsubscribe = subscribeToOrderUpdates(
          resolvedOrderId,
          (updated) => {
            if (cancelled) return;
            setOrder(updated);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error("Order help subscription failed:", err);
            if (cancelled) return;
            setLoading(false);
            if (!order) {
              setError("Couldn't load this order's history.");
            }
          },
        );
      } catch (err) {
        console.error("Order help fetch failed:", err);
        if (!cancelled) {
          setLoading(false);
          setError("Couldn't load this order's history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
    // We intentionally don't depend on `order` since that would re-create
    // the subscription on every snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedOrderId]);

  const issueReport = order?.issueReport;
  const timeline = issueReport ? buildTimeline(issueReport) : [];

  const handleContact = () => {
    Linking.openURL("mailto:support@fusionyum.com").catch(() =>
      Alert.alert(
        "Email unavailable",
        "Reach us at support@fusionyum.com when you have email set up.",
      ),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
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
            onPress={() =>
              goBackOrReplace(
                resolvedOrderId
                  ? `/order-tracking?orderId=${encodeURIComponent(resolvedOrderId)}`
                  : "/activity",
              )
            }
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Help</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        {loading && !order ? (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>Loading...</Text>
          </View>
        ) : null}

        {error && !order ? (
          <View style={styles.placeholderCard}>
            <Feather name="alert-triangle" size={20} color={colors.warning} />
            <Text style={styles.placeholderTitle}>{error}</Text>
          </View>
        ) : null}

        {order && !issueReport ? (
          <View style={styles.placeholderCard}>
            <Feather name="info" size={20} color={colors.surface} />
            <Text style={styles.placeholderTitle}>No reports on this order</Text>
            <Text style={styles.placeholderCopy}>
              You haven&apos;t reported any issues on this order. If something
              came up, head back to the order and tap &quot;Report Issue.&quot;
            </Text>
          </View>
        ) : null}

        {issueReport ? (
          <FadeInView delay={70} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order</Text>
              <Text style={styles.summaryValue}>
                #{order?.id?.slice(-8) ?? ""}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Restaurant</Text>
              <Text style={styles.summaryValue}>
                {order?.restaurantName ?? "—"}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text
                style={[
                  styles.summaryValue,
                  issueReport.status === "resolved"
                    ? styles.summaryStatusResolved
                    : styles.summaryStatusOpen,
                ]}
              >
                {issueReport.status === "resolved"
                  ? "Resolved"
                  : "Awaiting review"}
              </Text>
            </View>
          </FadeInView>
        ) : null}

        {timeline.length > 0 ? (
          <FadeInView delay={120} style={styles.timelineCard}>
            <Text style={styles.timelineHeading}>Activity</Text>
            {timeline.map((entry, index) => (
              <View key={entry.id} style={styles.timelineRow}>
                <View
                  style={[
                    styles.timelineIconWrap,
                    entry.highlight && styles.timelineIconWrapHighlight,
                  ]}
                >
                  <Feather
                    name={entry.icon}
                    size={16}
                    color={entry.highlight ? colors.background : colors.surface}
                  />
                </View>
                <View style={styles.timelineCopy}>
                  <Text style={styles.timelineTitle}>{entry.title}</Text>
                  <Text style={styles.timelineBody}>{entry.body}</Text>
                  {entry.timestamp ? (
                    <Text style={styles.timelineTimestamp}>
                      {entry.timestamp}
                    </Text>
                  ) : null}
                </View>
                {index < timeline.length - 1 ? (
                  <View style={styles.timelineConnector} />
                ) : null}
              </View>
            ))}
          </FadeInView>
        ) : null}

        {issueReport ? (
          <FadeInView delay={160} style={styles.contactCard}>
            <Text style={styles.contactTitle}>Need more help?</Text>
            <Text style={styles.contactCopy}>
              We&apos;ll have a live support chat here soon. Until then, reach
              out and we&apos;ll get back to you within a few hours.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Contact FusionYum support"
              hitSlop={8}
              style={styles.contactButton}
              onPress={handleContact}
            >
              <Feather name="mail" size={16} color={colors.background} />
              <Text style={styles.contactButtonText}>Contact support</Text>
            </Pressable>
          </FadeInView>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSpacer: { width: 46 },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  placeholderCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
    alignItems: "center",
  },
  placeholderTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
    textAlign: "center",
  },
  placeholderCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryValue: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  summaryStatusOpen: {
    color: colors.warning,
  },
  summaryStatusResolved: {
    color: colors.success,
  },
  timelineCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 16,
  },
  timelineHeading: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 4,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
    position: "relative",
  },
  timelineIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineIconWrapHighlight: {
    backgroundColor: colors.success,
  },
  timelineCopy: {
    flex: 1,
    gap: 4,
    paddingBottom: 4,
  },
  timelineTitle: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  timelineBody: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  timelineTimestamp: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  timelineConnector: {
    position: "absolute",
    left: 15,
    top: 36,
    bottom: -16,
    width: 2,
    backgroundColor: colors.border,
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  contactTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  contactCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  contactButton: {
    marginTop: 4,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  contactButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
});
