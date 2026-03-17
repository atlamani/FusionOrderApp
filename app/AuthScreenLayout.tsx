import React, { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { CustomButton } from "./customButton";
import { colors, spacing, typography } from "./theme";

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
        <View style={styles.container}>
          <CustomButton
            title="‹"
            href={backHref}
            style={styles.backButton}
            textStyle={styles.backButtonText}
          />

          <View style={styles.card}>
            <View style={styles.heading}>
              <Text style={styles.brand}>{eyebrow}</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.body}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 24,
    gap: spacing.xl,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    width: 44,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 0,
  },
  backButtonText: {
    color: colors.background,
    fontSize: 26,
    lineHeight: 26,
  },
  card: {
    width: "100%",
    maxWidth: 352,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  heading: {
    gap: 6,
    alignItems: "center",
  },
  brand: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surfaceDeep,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 30,
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: "center",
  },
  body: {
    gap: spacing.md,
  },
  footer: {
    gap: spacing.md,
  },
});
