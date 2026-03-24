import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { CustomButton } from "./customButton";
import { faqEntries, helpTopics } from "./mockData";
import { colors, spacing, typography } from "./theme";

export default function HelpCenterScreen() {
  const params = useLocalSearchParams<{ topic?: string }>();
  const initialTopic = useMemo(
    () => helpTopics.find((topic) => topic.id === params.topic)?.id ?? "order",
    [params.topic],
  );
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [requestSent, setRequestSent] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>HELP CENTER</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.heroCard}>
          <Text style={styles.heroTitle}>Need a hand?</Text>
          <Text style={styles.heroCopy}>
            Choose a topic and send a mock support request to make the prototype feel complete.
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
          <Text style={styles.cardTitle}>Quick actions</Text>
          <View style={styles.actionRow}>
            <CustomButton title="Start Chat" onPress={() => setRequestSent(true)} />
            <CustomButton title="View Receipt" variant="surface" onPress={() => router.push("/order-receipt")} />
          </View>
          {requestSent ? (
            <View style={styles.confirmationCard}>
              <Feather name="check-circle" size={18} color={colors.success} />
              <Text style={styles.confirmationText}>
                Support request queued for the {selectedTopic} team. A mock specialist will reply in-app shortly.
              </Text>
            </View>
          ) : null}
        </FadeInView>

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
    paddingTop: 18,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
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
    width: 40,
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
