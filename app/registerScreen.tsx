import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "./AuthScreenLayout";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { colors, spacing, typography } from "./theme";

export default function RegisterScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordMatch = password.trim().length > 0 && password === confirm;
  const allFilled = Boolean(identifier.trim() && password.trim() && confirm.trim());
  const canSubmit = allFilled && passwordMatch;

  const handleSignUp = () => {
    if (!canSubmit) {
      return;
    }

    Alert.alert("Account created", `Using: ${identifier}`);
    router.push("/LoginScreen");
  };

  return (
    <AuthScreenLayout
      backHref="/"
      eyebrow="FusionYum"
      title="Create account"
      subtitle="Set up your profile to save favorites and revisit the restaurants you love."
      footer={
        <View style={styles.actions}>
          <CustomButton title="Create account" onPress={handleSignUp} disabled={!canSubmit} />
          <Text style={styles.helperText}>Social sign-in buttons stay as placeholders in this mock flow.</Text>
          <View style={styles.socialRow}>
            <CustomButton
              title="Facebook"
              href="https://www.facebook.com"
              style={styles.socialButton}
              textStyle={styles.socialText}
            />
            <CustomButton
              title="Google"
              href="https://www.gmail.com"
              style={styles.socialButton}
              textStyle={styles.socialText}
            />
            <CustomButton
              title="Apple"
              href="https://www.apple.com"
              style={styles.socialButton}
              textStyle={styles.socialText}
            />
          </View>
        </View>
      }
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
        <CustomInput
          inputProps={{
            placeholder: "Password",
            secureTextEntry: true,
            autoCapitalize: "none",
            value: password,
            onChangeText: setPassword,
          }}
        />
        <CustomInput
          inputProps={{
            placeholder: "Repeat password",
            secureTextEntry: true,
            autoCapitalize: "none",
            value: confirm,
            onChangeText: setConfirm,
          }}
        />
        {!passwordMatch && confirm.length > 0 ? (
          <Text style={styles.warning}>Passwords need to match before you can continue.</Text>
        ) : null}
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  warning: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.primary,
  },
  actions: {
    gap: spacing.md,
  },
  helperText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  socialButton: {
    flex: 1,
    minWidth: 90,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
    minHeight: 40,
  },
  socialText: {
    color: colors.primary,
    fontSize: 12,
  },
});
