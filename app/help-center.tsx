import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { CustomButton } from "./customButton";
import { faqEntries, helpTopics } from "./appData";
import {
  subscribeToCustomerSupportTickets,
  submitSupportTicket,
  type SupportTicket,
} from "./Firebase/supportTickets";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const params = useLocalSearchParams<{ topic?: string }>();
  const initialTopic = useMemo(
    () => helpTopics.find((topic) => topic.id === params.topic)?.id ?? "order",
    [params.topic],
  );
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  const { currentUser } = useAppState();

  useEffect(() => {
    if (!currentUser?.uid) {
      setMyTickets([]);
      return undefined;
    }
    const unsubscribe = subscribeToCustomerSupportTickets(
      currentUser.uid,
      setMyTickets,
      (error) => {
        console.warn("Could not load my support tickets:", error);
      },
    );
    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleSubmit = async () => {
    if (message.trim().length < 5) {
      Alert.alert(
        "Tell us a bit more",
        "Add a few words about what you need help with so the team can review it.",
      );
      return;
    }
    const topicConfig = helpTopics.find((t) => t.id === selectedTopic);
    if (!topicConfig) return;
    setSubmitting(true);
    try {
      const ticketId = await submitSupportTicket({
        topic: topicConfig.id,
        topicLabel: topicConfig.title,
        message,
      });
      setMessage("");
      router.push({
        pathname: "/support-thread",
        params: { id: ticketId },
      });
    } catch (error) {
      const friendly =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      Alert.alert("Couldn't submit", friendly);
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            onPress={() => goBackOrReplace("/profile")}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>HELP CENTER</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.heroCard}>
          <Text style={styles.heroTitle}>Need a hand?</Text>
          <Text style={styles.heroCopy}>
            Choose a topic and send a support request to the right team.
          </Text>
        </FadeInView>

        <FadeInView delay={160} style={styles.card}>
          <Text style={styles.cardTitle}>Support topics</Text>
          <View style={styles.topicList}>
            {helpTopics.map((topic) => {
              const isSelected = topic.id === selectedTopic;
              return (
                <Pressable
                  key={topic.id}
                  style={[styles.topicCard, isSelected && styles.topicCardActive]}
                  onPress={() => {
                    setSelectedTopic(topic.id);
                    setRequestSent(false);
                  }}
                >
                  <Feather
                    name={topic.icon}
                    size={18}
                    color={isSelected ? colors.background : colors.primary}
                  />
                  <View style={styles.topicCopy}>
                    <Text style={[styles.topicTitle, isSelected && styles.topicTitleActive]}>{topic.title}</Text>
                    <Text style={[styles.topicDetail, isSelected && styles.topicDetailActive]}>
                      {topic.detail}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </FadeInView>

        <FadeInView delay={220} style={styles.card}>
          <Text style={styles.cardTitle}>Open a support ticket</Text>
          <Text style={styles.helperText}>
            Describe what&apos;s going on and a manager will follow up in-app.
          </Text>
          <TextInput
            accessibilityLabel="Support message"
            multiline
            placeholder="Tell the support team what happened..."
            placeholderTextColor="rgba(31, 42, 31, 0.44)"
            style={styles.messageInput}
            value={message}
            onChangeText={(value) => {
              setMessage(value);
              if (requestSent) setRequestSent(false);
            }}
            editable={!submitting}
          />
          <View style={styles.actionRow}>
            <CustomButton
              title={submitting ? "Sending..." : "Start Chat"}
              onPress={handleSubmit}
              disabled={submitting}
            />
            <CustomButton
              title="Latest Receipt"
              variant="surface"
              onPress={() => router.push("/order-receipt")}
            />
          </View>
          {requestSent ? (
            <View style={styles.confirmationCard}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={styles.confirmationText}>
                Ticket sent to the manager support inbox. We&apos;ll reach out
                shortly.
              </Text>
            </View>
          ) : null}
        </FadeInView>

        {myTickets.length > 0 ? (
          <FadeInView delay={260} style={styles.card}>
            <Text style={styles.cardTitle}>My tickets</Text>
            {myTickets.slice(0, 5).map((ticket) => {
              const lastMessage =
                ticket.messages.length > 0
                  ? ticket.messages[ticket.messages.length - 1].body
                  : ticket.message;
              return (
                <Pressable
                  key={ticket.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ticket ${ticket.ticketCode}`}
                  style={styles.ticketRow}
                  onPress={() =>
                    router.push({
                      pathname: "/support-thread",
                      params: { id: ticket.id },
                    })
                  }
                >
                  <View style={styles.ticketCopy}>
                    <Text style={styles.ticketTopic}>
                      {ticket.ticketCode} · {ticket.topicLabel}
                    </Text>
                    <Text style={styles.ticketMessage} numberOfLines={2}>
                      {lastMessage}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.ticketStatusPill,
                      ticket.status === "resolved"
                        ? styles.ticketStatusResolved
                        : ticket.status === "in_progress"
                          ? styles.ticketStatusInProgress
                          : styles.ticketStatusOpen,
                    ]}
                  >
                    <Text style={styles.ticketStatusText}>
                      {ticket.status === "resolved"
                        ? "Resolved"
                        : ticket.status === "in_progress"
                          ? "Working"
                          : "Open"}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </FadeInView>
        ) : null}

        <FadeInView delay={280} style={styles.card}>
          <Text style={styles.cardTitle}>Frequently asked</Text>
          <View style={styles.faqList}>
            {faqEntries.map((entry) => (
              <View key={entry.id} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{entry.question}</Text>
                <Text style={styles.faqAnswer}>{entry.answer}</Text>
              </View>
            ))}
          </View>
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
  headerSpacer: {
    width: safeHeaderButtonSize,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 8,
  },
  heroTitle: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.white,
  },
  heroCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.84)",
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: spacing.md,
  },
  cardTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  topicList: {
    gap: spacing.sm,
  },
  topicCard: {
    borderRadius: 18,
    backgroundColor: colors.background,
    padding: 14,
    gap: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  topicCardActive: {
    backgroundColor: colors.surface,
  },
  topicCopy: {
    flex: 1,
    gap: 2,
  },
  topicTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  topicTitleActive: {
    color: colors.background,
  },
  topicDetail: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  topicDetailActive: {
    color: "rgba(255,255,255,0.82)",
  },
  actionRow: {
    gap: spacing.sm,
  },
  helperText: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  messageInput: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: "top",
  },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ticketCopy: { flex: 1, gap: 2 },
  ticketTopic: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  ticketMessage: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  ticketStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ticketStatusOpen: { backgroundColor: "#FFF4E6" },
  ticketStatusInProgress: { backgroundColor: "rgba(115,144,114,0.18)" },
  ticketStatusResolved: { backgroundColor: "#ECFDF3" },
  ticketStatusText: {
    fontFamily: typography.display,
    fontSize: 10,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  confirmationCard: {
    borderRadius: 16,
    backgroundColor: "#ECFDF3",
    padding: 14,
    gap: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  confirmationText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.success,
  },
  faqList: {
    gap: spacing.sm,
  },
  faqItem: {
    borderRadius: 18,
    backgroundColor: colors.background,
    padding: 14,
    gap: 6,
  },
  faqQuestion: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  faqAnswer: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
