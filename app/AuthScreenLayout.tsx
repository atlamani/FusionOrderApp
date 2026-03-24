import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import FadeInView from "./FadeInView";
import { CustomButton } from "./customButton";
import { colors, radii, spacing, typography } from "./theme";

type AuthScreenLayoutProps = {
  backHref: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthScreenLayout({
  backHref,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.backgroundOrbTop} />
        <View style={styles.backgroundOrbBottom} />

        <View style={styles.container}>
          <FadeInView delay={40} style={styles.backRow}>
            <CustomButton
              title="Back"
              href={backHref}
              variant="secondary"
              leftSlot={<Feather name="arrow-left" size={16} color={colors.white} />}
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </FadeInView>

          <FadeInView delay={100} style={styles.hero}>
            <Text style={styles.brand}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </FadeInView>

          <FadeInView delay={160} style={styles.card}>
            <View style={styles.body}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </FadeInView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  backgroundOrbTop: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(115, 144, 114, 0.16)",
  },
  backgroundOrbBottom: {
    position: "absolute",
    bottom: -20,
    left: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(79, 111, 82, 0.10)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    gap: spacing.lg,
    justifyContent: "center",
  },
  backRow: {
    alignSelf: "flex-start",
  },
  backButton: {
    width: undefined,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radii.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  backButtonText: {
    fontSize: 14,
  },
  hero: {
    gap: 6,
    paddingHorizontal: 6,
  },
  brand: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surfaceDeep,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 34,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    maxWidth: 300,
  },
  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  body: {
    gap: spacing.md,
  },
  footer: {
    gap: spacing.md,
  },
});
