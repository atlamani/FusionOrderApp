import { Link, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "./AuthScreenLayout";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { colors, spacing, typography } from "./theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (!canSubmit) {
      return;
    }

    router.push("/home");
  };

  return (
    <AuthScreenLayout
      backHref="/"
      eyebrow="FusionYum"
      title="Welcome back"
      subtitle="Pick up where your cravings left off."
      footer={
        <View style={styles.actions}>
          <CustomButton title="Login" onPress={handleLogin} disabled={!canSubmit} />
          <Text style={styles.helperText}>Preview social sign-in buttons as UI placeholders.</Text>
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
            value: email,
            onChangeText: setEmail,
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
        <Link href="/passwordReset" style={styles.link}>
          Forgot your password?
        </Link>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  link: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: "underline",
    alignSelf: "flex-start",
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
