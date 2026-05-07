import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import StaffAccessGate from "./StaffAccessGate";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { getAverageRating } from "./services/roleMetrics";
import { colors, spacing, typography } from "./theme";

export default function AdminFeedbackScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const { adminFeedback } = useAppState();

  const metrics = useMemo(() => {
    const flagged = adminFeedback.filter((entry) => entry.flagged).length;

    return {
      flagged,
      avgRating: getAverageRating(adminFeedback),
    };
  }, [adminFeedback]);

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
          <Text style={styles.headerTitle}>FEEDBACK</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.metricsCard}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{metrics.avgRating}</Text>
            <Text style={styles.metricLabel}>Avg rating</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{metrics.flagged}</Text>
            <Text style={styles.metricLabel}>Flagged</Text>
          </View>
        </FadeInView>

        {adminFeedback.map((entry, index) => (
          <FadeInView key={entry.id} delay={140 + index * 50} style={styles.feedbackCard}>
            <View style={styles.cardTop}>
              <View style={styles.copy}>
                <Text style={styles.restaurant}>{entry.restaurant}</Text>
                <Text style={styles.meta}>
                  {entry.author} | {entry.category} | {entry.createdAt}
                </Text>
              </View>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingText}>{entry.rating}.0</Text>
              </View>
            </View>
            <Text style={styles.body}>{entry.text}</Text>
            {entry.flagged ? (
              <View style={styles.flagBanner}>
                <Feather name="flag" size={14} color={colors.danger} />
                <Text style={styles.flagText}>Needs manager review before end-of-day reporting.</Text>
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: {
    width: safeHeaderButtonSize,
    height: safeHeaderButtonSize,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontFamily: typography.display, fontSize: 22, color: colors.primary },
  headerSpacer: { width: safeHeaderButtonSize },
  metricsCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricBlock: { gap: 4 },
  metricValue: { fontFamily: typography.display, fontSize: 30, color: colors.white },
  metricLabel: { fontFamily: typography.body, fontSize: 13, color: "rgba(255,255,255,0.82)" },
  feedbackCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  copy: { flex: 1, gap: 4 },
  restaurant: { fontFamily: typography.display, fontSize: 18, color: colors.primary },
  meta: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  ratingPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingText: { fontFamily: typography.display, fontSize: 12, color: colors.surfaceDeep },
  body: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.text },
  flagBanner: {
    borderRadius: 14,
    backgroundColor: "#FFE5E7",
    padding: 10,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  flagText: { flex: 1, fontFamily: typography.body, fontSize: 12, color: colors.danger },
});
