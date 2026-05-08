import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  appendSupportMessage,
  resolveSupportTicket,
  subscribeToSupportTicket,
  type SupportMessage,
  type SupportTicket,
} from "./Firebase/supportTickets";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import { getSafeHeaderTopPadding } from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

function formatTimestamp(value: SupportMessage["createdAt"]): string {
  let ms = 0;
  if (!value) return "";
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
  if (!ms) return "";
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SupportThreadScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const ticketId = Array.isArray(id) ? id[0] : id;
  const { sessionMode, profile, currentUser } = useAppState();
  const isAdmin = sessionMode === "admin";
  const author = isAdmin ? "admin" : "customer";

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!ticketId) {
      setError("No ticket ID provided.");
      return;
    }
    const unsubscribe = subscribeToSupportTicket(
      ticketId,
      (next) => {
        setTicket(next);
        if (!next) {
          setError("Ticket not found.");
        } else {
          setError(null);
        }
      },
      (err) => {
        console.error("Support thread subscription failed:", err);
        setError("Couldn't load this ticket.");
      },
    );
    return () => unsubscribe();
  }, [ticketId]);

  useEffect(() => {
    if (ticket && scrollRef.current) {
      // Scroll to bottom when new messages arrive.
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [ticket?.messages.length]);

  const handleSend = async () => {
    if (!ticketId) return;
    if (draft.trim().length === 0) return;
    setSending(true);
    try {
      const authorName = isAdmin
        ? "Manager"
        : profile.fullName ||
          currentUser?.displayName ||
          currentUser?.email?.split("@")[0] ||
          "Customer";
      await appendSupportMessage({
        ticketId,
        author,
        authorName,
        body: draft,
      });
      setDraft("");
    } catch (err) {
      const friendly =
        err instanceof Error ? err.message : "Couldn't send message.";
      Alert.alert("Send failed", friendly);
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async () => {
    if (!ticketId) return;
    if (resolutionNote.trim().length < 3) {
      Alert.alert(
        "Add a note",
        "Briefly summarize the resolution so the customer has context.",
      );
      return;
    }
    setResolving(true);
    try {
      await resolveSupportTicket({
        ticketId,
        resolution: resolutionNote,
      });
      // Append a system-style message to the thread for visibility.
      await appendSupportMessage({
        ticketId,
        author: "admin",
        authorName: "Manager",
        body: `Resolved · ${resolutionNote.trim()}`,
      });
      setResolutionNote("");
    } catch (err) {
      Alert.alert(
        "Couldn't resolve",
        "Something went wrong saving the resolution.",
      );
    } finally {
      setResolving(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (!ticket) return "";
    if (ticket.status === "resolved") return "Resolved";
    if (ticket.status === "in_progress") return "In progress";
    return "Open";
  }, [ticket]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={[styles.header, { paddingTop: headerTopPadding }]}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            style={styles.backButton}
            onPress={() =>
              goBackOrReplace(isAdmin ? "/admin-support" : "/help-center")
            }
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {ticket?.ticketCode ?? "Support thread"}
            </Text>
            {ticket ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {ticket.topicLabel} · {statusLabel}
              </Text>
            ) : null}
          </View>
        </View>

        {error && !ticket ? (
          <View style={styles.placeholderCard}>
            <Feather name="alert-triangle" size={20} color={colors.warning} />
            <Text style={styles.placeholderTitle}>{error}</Text>
          </View>
        ) : null}

        {ticket ? (
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.thread}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contextCard}>
              <Text style={styles.contextLabel}>Topic</Text>
              <Text style={styles.contextValue}>{ticket.topicLabel}</Text>
              {isAdmin ? (
                <>
                  <Text style={[styles.contextLabel, { marginTop: 6 }]}>
                    Customer
                  </Text>
                  <Text style={styles.contextValue}>
                    {ticket.customerName}
                    {ticket.customerEmail
                      ? ` · ${ticket.customerEmail}`
                      : ""}
                  </Text>
                </>
              ) : null}
            </View>

            {ticket.messages.map((message) => {
              const mine = message.author === author;
              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    mine ? styles.messageRowOwn : styles.messageRowOther,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      mine ? styles.bubbleOwn : styles.bubbleOther,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleAuthor,
                        mine ? styles.bubbleAuthorOwn : null,
                      ]}
                    >
                      {message.authorName}
                    </Text>
                    <Text
                      style={[
                        styles.bubbleBody,
                        mine ? styles.bubbleBodyOwn : null,
                      ]}
                    >
                      {message.body}
                    </Text>
                    <Text
                      style={[
                        styles.bubbleTimestamp,
                        mine ? styles.bubbleTimestampOwn : null,
                      ]}
                    >
                      {formatTimestamp(message.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}

            {ticket.status === "resolved" ? (
              <View style={styles.resolvedBanner}>
                <Feather
                  name="check-circle"
                  size={16}
                  color={colors.success}
                />
                <Text style={styles.resolvedText}>
                  Ticket closed
                  {ticket.resolution ? ` · ${ticket.resolution}` : ""}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        ) : null}

        {ticket && ticket.status !== "resolved" ? (
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Reply to support"
              multiline
              placeholder={
                isAdmin
                  ? "Reply to the customer..."
                  : "Type your reply to the manager..."
              }
              placeholderTextColor="rgba(31, 42, 31, 0.44)"
              style={styles.composerInput}
              value={draft}
              onChangeText={setDraft}
              editable={!sending}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              hitSlop={8}
              disabled={sending || draft.trim().length === 0}
              style={[
                styles.sendButton,
                (sending || draft.trim().length === 0) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
            >
              <Feather name="send" size={16} color={colors.background} />
            </Pressable>
          </View>
        ) : null}

        {isAdmin && ticket && ticket.status !== "resolved" ? (
          <View style={styles.adminResolveCard}>
            <Text style={styles.adminResolveTitle}>Resolve ticket</Text>
            <TextInput
              accessibilityLabel="Resolution note"
              multiline
              placeholder="Summarize what you did so the customer has context."
              placeholderTextColor="rgba(31, 42, 31, 0.44)"
              style={styles.adminResolveInput}
              value={resolutionNote}
              onChangeText={setResolutionNote}
              editable={!resolving}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark ticket resolved"
              hitSlop={8}
              disabled={resolving}
              style={styles.adminResolveButton}
              onPress={handleResolve}
            >
              <Text style={styles.adminResolveButtonText}>
                {resolving ? "Saving..." : "Mark Resolved"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCopy: { flex: 1 },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  headerSubtitle: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  placeholderCard: {
    margin: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    alignItems: "center",
  },
  placeholderTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  thread: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  contextCard: {
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 2,
  },
  contextLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  contextValue: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  messageRow: {
    flexDirection: "row",
  },
  messageRowOwn: { justifyContent: "flex-end" },
  messageRowOther: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  bubbleOwn: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleAuthor: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.textMuted,
  },
  bubbleAuthorOwn: { color: "rgba(236, 227, 206, 0.74)" },
  bubbleBody: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 19,
    color: colors.text,
  },
  bubbleBodyOwn: { color: colors.background },
  bubbleTimestamp: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  bubbleTimestampOwn: { color: "rgba(236, 227, 206, 0.66)" },
  resolvedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#ECFDF3",
  },
  resolvedText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.success,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  composerInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { opacity: 0.4 },
  adminResolveCard: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: spacing.md,
    gap: 8,
  },
  adminResolveTitle: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  adminResolveInput: {
    minHeight: 60,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
  },
  adminResolveButton: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  adminResolveButtonText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.background,
  },
});
