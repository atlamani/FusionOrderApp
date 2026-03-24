import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

const settingLabels = [
  {
    key: "orderUpdates",
    title: "Order updates",
    detail: "Push timing updates as your order moves through the flow.",
  },
  {
    key: "promoAlerts",
    title: "Promo alerts",
    detail: "Receive featured drops, rewards nudges, and mock promo codes.",
  },
  {
    key: "biometricLock",
    title: "Face ID / Touch ID",
    detail: "Keep saved cards and profile details tucked behind your device lock.",
  },
  {
    key: "quickReorder",
    title: "Quick reorder",
    detail: "Show one-tap reorder actions throughout favorites and activity history.",
  },
] as const;

export default function AccountSettingsScreen() {
  const { settings, toggleSetting } = usePrototypeState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>PREFERENCES</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={100} style={styles.heroCard}>
          <Text style={styles.heroTitle}>Tune your account experience</Text>
          <Text style={styles.heroCopy}>
            These settings stay local to the prototype and make the account flow feel complete.
          </Text>
        </FadeInView>

        {settingLabels.map((setting, index) => (
          <FadeInView key={setting.key} delay={150 + index * 50} style={styles.settingCard}>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDetail}>{setting.detail}</Text>
            </View>
            <Pressable
              style={[styles.toggle, settings[setting.key] && styles.toggleActive]}
              onPress={() => toggleSetting(setting.key)}
            >
              <View style={[styles.toggleKnob, settings[setting.key] && styles.toggleKnobActive]} />
            </Pressable>
          </FadeInView>
        ))}

        <FadeInView delay={360} style={styles.infoCard}>
          <Text style={styles.infoTitle}>Prototype details</Text>
          <Text style={styles.infoCopy}>Version 0.9.0 | Local mock data only | No live account sync</Text>
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
  settingTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
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
