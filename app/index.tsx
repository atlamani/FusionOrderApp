import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { CustomButton } from "./customButton";
import { colors, spacing, typography } from "./theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>FusionYum</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.actions}>
            <CustomButton
              title="Login"
              href="/LoginScreen"
              style={styles.secondaryButton}
              textStyle={styles.secondaryButtonText}
            />
            <CustomButton title="Sign Up" href="/registerScreen" style={styles.primaryAltButton} />
            <CustomButton
              title="Continue as Guest"
              href="/home"
              style={styles.ghostButton}
              textStyle={styles.ghostButtonText}
            />
          </View>

          <View style={styles.socialBlock}>
            <Text style={styles.socialLabel}>OR</Text>
            <View style={styles.socialRow}>
              <View style={styles.socialIcon} />
              <View style={styles.socialIcon} />
              <View style={styles.socialIcon} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: colors.background,
    gap: 72,
  },
  brandBlock: {
    alignItems: "center",
  },
  brand: {
    fontFamily: typography.display,
    color: colors.primary,
    fontSize: 36,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryAltButton: {
    backgroundColor: "rgba(115, 144, 114, 0.65)",
  },
  secondaryButton: {
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.background,
  },
  ghostButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghostButtonText: {
    color: colors.primary,
  },
  socialBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },
  socialLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
  },
});
