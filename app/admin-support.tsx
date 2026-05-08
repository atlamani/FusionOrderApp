import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import StaffAccessGate from "./StaffAccessGate";
import {
  subscribeToSupportTickets,
  type SupportTicket,
} from "./Firebase/supportTickets";
import { goBackOrReplace } from "./navigation";
import { getSafeHeaderTopPadding } from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

function formatTimestamp(value: SupportTicket["createdAt"]): string {
  if (!value) return "";
  let ms = 0;
  if (value instanceof Date) ms = value.getTime();
  else if (typeof value === "number") ms = value;
  else if (typeof value === "string") {
    const parsed = Date.parse(value);
    ms = Number.isFinite(parsed) ? parsed : 0;
  } else {
    const stamp = value as { toMillis?: () => number; toDate?: () => Date };
    if (typeof stamp.toMillis === "function") ms = stamp.toMillis();
    else if (typeof stamp.toDate === "function") ms = stamp.toDate().getTime();
  }
  if (!ms) return "Just now";
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminSupportScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToSupportTickets(
      (next) => {
        setTickets(next);
        setLoading(false);
      },
      (error) => {
        console.error("Support inbox subscription failed:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const openTickets = tickets.filter((t) => t.status !== "resolved");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved");

  const openThread = (ticketId: string) => {
    router.push({ pathname: "/support-thread", params: { id: ticketId } });
  };

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
              accessibilityLabel="Back to admin dashboard"
              accessibilityRole="button"
              hitSlop={16}
              style={styles.backButton}
              onPress={() => goBackOrReplace("/admin-dashboard")}
            >
              <Feather name="arrow-left" size={18} color={colors.background} />
            </Pressable>
            <Text style={styles.headerTitle}>SUPPORT INBOX</Text>
            <View style={styles.headerSpacer} />
          </FadeInView>

          <FadeInView delay={80} style={styles.summaryCard}>
            <Feather name="message-circle" size={20} color={colors.surface} />
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryTitle}>
                {openTickets.length} open ticket
                {openTickets.length === 1 ? "" : "s"}
              </Text>
              <Text style={styles.summarySubtitle}>
                Customer support requests filed from Help Center → Start Chat.
              </Text>
            </View>
          </FadeInView>

          {loading ? (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>Loading tickets...</Text>
            </View>
          ) : null}

          {!loading && openTickets.length === 0 ? (
            <View style={styles.placeholderCard}>
              <Feather name="inbox" size={20} color={colors.surface} />
              <Text style={styles.placeholderTitle}>Inbox is clear</Text>
              <Text style={styles.placeholderCopy}>
                Nothing waiting on a manager response right now.
              </Text>
            </View>
          ) : null}

          {openTickets.map((ticket, index) => {
            const lastMessage =
              ticket.messages.length > 0
                ? ticket.messages[ticket.messages.length - 1]
                : null;
            return (
              <FadeInView
                key={ticket.id}
                delay={120 + index * 40}
                style={styles.ticketCard}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ticket ${ticket.ticketCode}`}
                  onPress={() => openThread(ticket.id)}
                >
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketCopy}>
                      <Text style={styles.ticketTopic}>
                        {ticket.ticketCode} · {ticket.topicLabel}
                      </Text>
                      <Text style={styles.ticketCustomer}>
                        {ticket.customerName}
                        {ticket.customerEmail
                          ? ` · ${ticket.customerEmail}`
                          : ""}
                      </Text>
                      <Text style={styles.ticketTimestamp}>
                        {formatTimestamp(ticket.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>
                        {ticket.status === "in_progress" ? "Working" : "Open"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ticketMessage}>
                    {lastMessage
                      ? `${lastMessage.author === "admin" ? "You" : ticket.customerName.split(" ")[0]}: ${lastMessage.body}`
                      : ticket.message}
                  </Text>
                  <View style={styles.openThreadHint}>
                    <Feather name="message-square" size={13} color={colors.surface} />
                    <Text style={styles.openThreadHintText}>
                      Open conversation
                    </Text>
                  </View>
                </Pressable>
              </FadeInView>
            );
          })}

          {resolvedTickets.length > 0 ? (
            <View style={styles.resolvedSection}>
              <Text style={styles.resolvedHeading}>Recently resolved</Text>
              {resolvedTickets.slice(0, 5).map((ticket) => (
                <View key={ticket.id} style={styles.resolvedCard}>
                  <Text style={styles.ticketTopic}>{ticket.topicLabel}</Text>
                  <Text style={styles.ticketCustomer}>
                    {ticket.customerName}
                  </Text>
                  <Text style={styles.ticketMessage}>{ticket.message}</Text>
                  {ticket.resolution ? (
                    <View style={styles.resolutionBanner}>
                      <Feather
                        name="check-circle"
                        size={14}
                        color={colors.success}
                      />
                      <Text style={styles.resolutionText}>
                        {ticket.resolution}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
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
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  headerSpacer: { width: 46 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryCopy: { flex: 1, gap: 2 },
  summaryTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  summarySubtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  placeholderCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 6,
    alignItems: "center",
  },
  placeholderTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  placeholderCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  ticketCopy: { flex: 1, gap: 2 },
  ticketTopic: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  ticketCustomer: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
  },
  ticketTimestamp: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  ticketMessage: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  statusPillText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.surfaceDeep,
  },
  openThreadHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  openThreadHintText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surface,
  },
  resolveBlock: {
    gap: 8,
    paddingTop: 4,
  },
  resolveLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  resolveInput: {
    minHeight: 80,
    borderRadius: 12,
    backgroundColor: colors.background,
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
  resolveButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.background,
  },
  resolvedSection: {
    marginTop: 8,
    gap: 10,
  },
  resolvedHeading: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  resolvedCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
    opacity: 0.85,
  },
  resolutionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#ECFDF3",
  },
  resolutionText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.success,
  },
});
