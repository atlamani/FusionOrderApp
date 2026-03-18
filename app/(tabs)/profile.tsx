import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { profileShortcuts } from "../mockData";
import { colors, spacing, typography } from "../theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.title}>John Doe</Text>
            <Text style={styles.subtitle}>FusionYum prototype member</Text>
          </View>
          <Pressable style={styles.editButton}>
            <Feather name="edit-2" size={16} color={colors.background} />
          </Pressable>
        </View>

        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsLabel}>Rewards Progress</Text>
          <Text style={styles.rewardsValue}>320 pts</Text>
          <Text style={styles.rewardsCopy}>
            Place one more mock order to unlock your next free dessert reward.
          </Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable onPress={() => router.push("/activity")}>
            <Text style={styles.sectionLink}>Open Activity</Text>
          </Pressable>
        </View>

        {profileShortcuts.map((shortcut) => (
          <View key={shortcut.id} style={styles.shortcutCard}>
            <View style={styles.shortcutIcon}>
              <Feather name={shortcut.icon} size={18} color={colors.background} />
            </View>
            <View style={styles.shortcutCopy}>
              <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
              <Text style={styles.shortcutDetail}>{shortcut.detail}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </View>
        ))}
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
  profileCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.background,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.white,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.86)",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(79,111,82,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardsCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  rewardsLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  rewardsValue: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primary,
  },
  rewardsCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  progressFill: {
    width: "72%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  sectionLink: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.surfaceDeep,
  },
  shortcutCard: {
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  shortcutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  shortcutCopy: {
    flex: 1,
    gap: 4,
  },
  shortcutLabel: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  shortcutDetail: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
