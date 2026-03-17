import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "./AuthScreenLayout";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { colors, spacing, typography } from "./theme";

export default function PassResetScreen() {
  const [identifier, setIdentifier] = useState("");
  const canSubmit = identifier.trim().length > 0;

  const handleReset = () => {
    if (!canSubmit) {
      return;
    }

    Alert.alert("Reset link sent", `We will send a reset link to: ${identifier}`);
    router.push("/LoginScreen");
  };

  return (
    <AuthScreenLayout
      backHref="/LoginScreen"
      eyebrow="FusionYum"
      title="Reset password"
      subtitle="Enter the phone number or email tied to your account and we&apos;ll send a reset link."
      footer={<CustomButton title="Send reset link" onPress={handleReset} disabled={!canSubmit} />}
    >
      <View style={styles.form}>
        <CustomInput
          inputProps={{
            placeholder: "Phone number or email",
            keyboardType: "email-address",
            autoCapitalize: "none",
            value: identifier,
            onChangeText: setIdentifier,
          }}
        />
        <Text style={styles.helperText}>
          This is a prototype flow, so the confirmation only previews what the message would say.
        </Text>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  helperText: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
