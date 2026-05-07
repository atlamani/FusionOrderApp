import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import { CustomButton } from "./customButton";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

export default function RewardsClubScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const { joinedRewards, profile, rewardsEmail } = useAppState();
  const progress = Math.min(100, Math.round((profile.rewardsPoints / 450) * 100));

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
          <Text style={styles.headerTitle}>REWARDS CLUB</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.heroCard}>
          <Text style={styles.heroTitle}>{profile.rewardsTier}</Text>
          <Text style={styles.heroPoints}>{profile.rewardsPoints} pts</Text>
          <Text style={styles.heroCopy}>
            {joinedRewards
              ? `Rewards are active for ${rewardsEmail}. Keep ordering to unlock your next dessert.`
              : "Join rewards from the confirmation flow to start collecting points on each order."}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </FadeInView>

        <FadeInView delay={160} style={styles.card}>
          <Text style={styles.cardTitle}>Member perks</Text>
          {[
            "Free dessert after 450 points",
            "Priority access to seasonal drops",
            "One-tap reorder recommendations on Home",
          ].map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <Feather name="check-circle" size={16} color={colors.surface} />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </FadeInView>

        <FadeInView delay={220} style={styles.actions}>
          <CustomButton title="Explore Home" onPress={() => router.push("/home")} />
          <CustomButton title="View Activity" variant="surface" onPress={() => router.push("/activity-history")} />
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
    gap: 10,
  },
  heroTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: "rgba(255,255,255,0.82)",
  },
  heroPoints: {
    fontFamily: typography.display,
    fontSize: 36,
    color: colors.white,
  },
  heroCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.84)",
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.background,
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
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  perkText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  actions: {
    gap: spacing.sm,
  },
});
