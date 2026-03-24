import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "./AuthScreenLayout";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { colors, spacing, typography } from "./theme";

export default function PassResetScreen() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const canSubmit = identifier.trim().length > 0;

  const handleReset = () => {
    if (!canSubmit) {
      return;
    }

    setStatus("sent");

    setTimeout(() => {
      router.push("/LoginScreen");
    }, 700);
  };

  return (
    <AuthScreenLayout
      backHref="/LoginScreen"
      eyebrow="FusionYum"
      title="Reset password"
      subtitle="We’ll help you get back in quickly with a simple reset link preview."
      footer={
        <View style={styles.footer}>
          <View style={styles.helperCard}>
            <Feather name={status === "sent" ? "check-circle" : "mail"} size={16} color={colors.surfaceDeep} />
            <Text style={styles.helperCardText}>
              {status === "sent"
                ? "A mock reset confirmation is on the way."
                : "This prototype previews the recovery experience without sending anything real."}
            </Text>
          </View>

          <CustomButton
            title={status === "sent" ? "Link Sent" : "Send reset link"}
            onPress={handleReset}
            disabled={!canSubmit}
            leftSlot={<Feather name="send" size={16} color={colors.background} />}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <View style={styles.formIntro}>
          <Text style={styles.formTitle}>Recover your account</Text>
          <Text style={styles.formSubtitle}>Enter the email or phone number linked to your account.</Text>
        </View>

        <CustomInput
          label="Recovery contact"
          leadingIcon="mail"
          inputProps={{
            placeholder: "Enter your email or phone",
            keyboardType: "email-address",
            autoCapitalize: "none",
            value: identifier,
            onChangeText: setIdentifier,
          }}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  formIntro: {
    gap: 4,
    marginBottom: 4,
  },
  formTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.primary,
  },
  formSubtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  footer: {
    gap: spacing.md,
  },
  helperCard: {
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  helperCardText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.surfaceDeep,
  },
});
