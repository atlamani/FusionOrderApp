import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

const settingLabels = [
  {
    key: "orderUpdates",
    title: "Order updates",
    detail: "Push timing updates as your order moves through the flow.",
    // Push notifications aren't wired up yet — the order tracking screen
    // already streams live status via the in-app subscription, so this
    // toggle has nothing to gate today. Honest label until APNs/FCM lands.
    comingSoon: true,
  },
  {
    key: "promoAlerts",
    title: "Promo alerts",
    detail: "Receive featured drops, rewards nudges, and promo codes.",
    comingSoon: true,
  },
  {
    key: "biometricLock",
    title: "Face ID / Touch ID",
    detail: "Keep saved cards and profile details tucked behind your device lock.",
    // Requires expo-local-authentication wiring + secure storage gate.
    comingSoon: true,
  },
  {
    key: "quickReorder",
    title: "Quick reorder",
    detail: "Show one-tap reorder actions throughout favorites and activity history.",
    comingSoon: false,
  },
] as const;

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const { settings, toggleSetting } = useAppState();

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
          <Text style={styles.headerTitle}>PREFERENCES</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.heroCard}>
          <Text style={styles.heroTitle}>Tune your account experience</Text>
          <Text style={styles.heroCopy}>
            Control notifications, account shortcuts, and privacy preferences.
          </Text>
        </FadeInView>

        {settingLabels.map((setting, index) => (
          <FadeInView key={setting.key} delay={150 + index * 50} style={styles.settingCard}>
            <View style={styles.settingCopy}>
              <View style={styles.settingTitleRow}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                {setting.comingSoon ? (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming soon</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.settingDetail}>{setting.detail}</Text>
            </View>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{
                checked: settings[setting.key],
                disabled: setting.comingSoon,
              }}
              disabled={setting.comingSoon}
              style={[
                styles.toggle,
                settings[setting.key] && styles.toggleActive,
                setting.comingSoon && styles.toggleDisabled,
              ]}
              onPress={() => toggleSetting(setting.key)}
            >
              <View style={[styles.toggleKnob, settings[setting.key] && styles.toggleKnobActive]} />
            </Pressable>
          </FadeInView>
        ))}

        <FadeInView delay={360} style={styles.infoCard}>
          <Text style={styles.infoTitle}>App details</Text>
          <Text style={styles.infoCopy}>Version 1.0.0 | Account preferences</Text>
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
  settingCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  settingCopy: {
    flex: 1,
    gap: 4,
  },
  settingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  settingTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  comingSoonText: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  settingDetail: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  toggleActive: {
    backgroundColor: colors.surface,
  },
  toggleDisabled: {
    opacity: 0.4,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  infoCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 6,
  },
  infoTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  infoCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
