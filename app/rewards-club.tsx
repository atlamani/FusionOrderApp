import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import { CustomButton } from "./customButton";
import { rewardCatalog } from "./appData";
import { getRewardProgress, useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

export default function RewardsClubScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const {
    availableRewards,
    claimReward,
    joinedRewards,
    profile,
    rewardsEmail,
  } = useAppState();
  const { next, remaining, ratio, reachedAll } = getRewardProgress(
    profile.rewardsPoints,
  );
  const progressPct = Math.round(ratio * 100);
  const ladder = [...rewardCatalog].sort(
    (a, b) => a.pointsCost - b.pointsCost,
  );

  const handleClaim = (rewardId: string, name: string) => {
    const ok = claimReward(rewardId);
    if (ok) {
      Alert.alert(
        "Reward claimed",
        `${name} added to your account. Apply it on your next checkout.`,
      );
    } else {
      Alert.alert(
        "Not enough points",
        "Keep ordering to reach this reward's threshold.",
      );
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
          <Text style={styles.headerTitle}>REWARDS CLUB</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.heroCard}>
          <Text style={styles.heroTitle}>{profile.rewardsTier}</Text>
          <Text style={styles.heroPoints}>{profile.rewardsPoints} pts</Text>
          <Text style={styles.heroCopy}>
            {reachedAll
              ? "You've unlocked every reward — claim them below or keep banking points."
              : remaining === 0
                ? `${next.name} unlocked! Claim it below.`
                : `${remaining} pt${remaining === 1 ? "" : "s"} away from ${next.name.toLowerCase()}.`}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          {joinedRewards ? (
            <Text style={styles.heroSub}>Active for {rewardsEmail}.</Text>
          ) : null}
        </FadeInView>

        {availableRewards.length > 0 ? (
          <FadeInView delay={140} style={styles.claimedCard}>
            <View style={styles.claimedHeader}>
              <Feather name="gift" size={18} color={colors.background} />
              <Text style={styles.claimedTitle}>
                {availableRewards.length} reward
                {availableRewards.length === 1 ? "" : "s"} ready to use
              </Text>
            </View>
            <Text style={styles.claimedCopy}>
              Apply one at checkout to take it off your next order.
            </Text>
          </FadeInView>
        ) : null}

        <FadeInView delay={160} style={styles.card}>
          <Text style={styles.cardTitle}>Reward ladder</Text>
          {ladder.map((entry) => {
            const owned = availableRewards.filter((id) => id === entry.id).length;
            const canClaim = profile.rewardsPoints >= entry.pointsCost;
            return (
              <View key={entry.id} style={styles.rewardRow}>
                <View style={styles.rewardCopy}>
                  <Text style={styles.rewardName}>{entry.name}</Text>
                  <Text style={styles.rewardDescription}>
                    {entry.description}
                  </Text>
                  <Text style={styles.rewardCost}>
                    {entry.pointsCost} pts · ${entry.value.toFixed(2)} off
                    {owned > 0 ? ` · ${owned} ready` : ""}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Claim ${entry.name}`}
                  hitSlop={8}
                  disabled={!canClaim}
                  style={[
                    styles.claimButton,
                    !canClaim && styles.claimButtonDisabled,
                  ]}
                  onPress={() => handleClaim(entry.id, entry.name)}
                >
                  <Text
                    style={[
                      styles.claimButtonText,
                      !canClaim && styles.claimButtonTextDisabled,
                    ]}
                  >
                    {canClaim ? "Claim" : "Locked"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
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
  heroSub: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.74)",
    marginTop: 4,
  },
  claimedCard: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  claimedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  claimedTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.background,
  },
  claimedCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    color: "rgba(236, 227, 206, 0.84)",
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rewardCopy: { flex: 1, gap: 2 },
  rewardName: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.primary,
  },
  rewardDescription: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  rewardCost: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.surfaceDeep,
  },
  claimButton: {
    minWidth: 84,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  claimButtonDisabled: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  claimButtonText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.background,
  },
  claimButtonTextDisabled: {
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.sm,
  },
});
