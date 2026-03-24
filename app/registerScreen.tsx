import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "./AuthScreenLayout";
import SocialButton from "./socialButton";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function RegisterScreen() {
  const { loginAsMember } = usePrototypeState();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMatch = password.trim().length > 0 && password === confirm;
  const allFilled = Boolean(identifier.trim() && password.trim() && confirm.trim());
  const canSubmit = allFilled && passwordMatch;

  const handleSignUp = () => {
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/LoginScreen");
    }, 650);
  };

  return (
    <AuthScreenLayout
      backHref="/"
      eyebrow="FusionYum"
      title="Create account"
      subtitle="Set up your profile to save favorites, unlock rewards, and keep your go-to spots close."
      footer={
        <View style={styles.actions}>
          <View style={styles.primaryBlock}>
            <View style={styles.helperCard}>
              <Feather name="star" size={16} color={colors.surfaceDeep} />
              <Text style={styles.helperCardText}>Your account stays local in this prototype, but the experience is fully connected.</Text>
            </View>

            {!passwordMatch && confirm.length > 0 ? (
              <Text style={styles.errorText}>Passwords need to match before you continue.</Text>
            ) : null}

            <CustomButton
              title="Create account"
              onPress={handleSignUp}
              disabled={!canSubmit}
              loading={loading}
              leftSlot={<Feather name="user-plus" size={16} color={colors.background} />}
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialBlock}>
            <View style={styles.socialRow}>
              <SocialButton
                brand="Facebook"
                onPress={() => {
                  loginAsMember("facebook@fusionyum.com");
                  router.push("/home");
                }}
              />
              <SocialButton
                brand="Google"
                onPress={() => {
                  loginAsMember("google@fusionyum.com");
                  router.push("/home");
                }}
              />
              <SocialButton
                brand="Apple"
                onPress={() => {
                  loginAsMember("apple@fusionyum.com");
                  router.push("/home");
                }}
              />
            </View>
            <Text style={styles.socialHint}>Use social sign-in to jump directly into the member flow.</Text>
          </View>
        </View>
      }
    >
      <View style={styles.form}>
        <View style={styles.formIntro}>
          <Text style={styles.formTitle}>Create your account</Text>
          <Text style={styles.formSubtitle}>A simple setup for favorites, rewards, and smoother checkout later.</Text>
        </View>

        <CustomInput
          label="Email or phone"
          leadingIcon="user"
          inputProps={{
            placeholder: "Enter your email or phone",
            keyboardType: "email-address",
            autoCapitalize: "none",
            value: identifier,
            onChangeText: setIdentifier,
          }}
        />

        <CustomInput
          label="Password"
          leadingIcon="lock"
          secureToggle
          helperText="Use at least 8 characters for a realistic production feel."
          inputProps={{
            placeholder: "Create a password",
            secureTextEntry: true,
            autoCapitalize: "none",
            value: password,
            onChangeText: setPassword,
          }}
        />

        <CustomInput
          label="Repeat password"
          leadingIcon="shield"
          secureToggle
          errorText={!passwordMatch && confirm.length > 0 ? "Passwords need to match." : undefined}
          inputProps={{
            placeholder: "Repeat your password",
            secureTextEntry: true,
            autoCapitalize: "none",
            value: confirm,
            onChangeText: setConfirm,
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
  actions: {
    gap: spacing.md,
  },
  primaryBlock: {
    gap: spacing.sm,
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
  errorText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.danger,
    textAlign: "left",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  socialBlock: {
    gap: spacing.sm,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  socialHint: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
  },
});
