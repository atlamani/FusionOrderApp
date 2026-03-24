import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "./AuthScreenLayout";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { firebaseAuth } from "./Firebase/config";
import SocialButton from "./socialButton";
import { colors, spacing, typography } from "./theme";

export default function LoginScreen() {
  // const { loginAsMember } = usePrototypeState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit) {
      setStatus("error");
      setErrorMessage("Add both fields to continue");
      return;
    }

    setStatus("loading");

    try {
      await firebaseAuth.signInWithEmailAndPassword(email.trim(), password);

      setStatus("success");
      router.push("/home");
    } catch (error: any) {
      setStatus("error");

      if (
        error.code === "auth/user-not-found" ||
        error.code === "suth/wrong-password"
      ) {
        setErrorMessage("Invalid email or password");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("That email address is invalid.");
      } else {
        setErrorMessage("An unexpected error occurred. Try again.");
      }

      console.error(error);
    }
  };

  return (
    <AuthScreenLayout
      backHref="/"
      eyebrow="FusionYum"
      title="Welcome back"
      subtitle="Sign in to continue your orders, favorites, and delivery updates."
      footer={
        <View style={styles.actions}>
          <View style={styles.primaryBlock}>
            <View style={styles.helperCard}>
              <Feather name="circle" size={16} color={colors.surfaceDeep} />
              <Text style={styles.helperCardText}>
                Demo tip: any email and password will work here.
              </Text>
            </View>

            {status === "error" ? (
              <Text style={styles.errorText}>Add both fields to continue.</Text>
            ) : null}

            <CustomButton
              title={status === "success" ? "Ready" : "Login"}
              onPress={handleLogin}
              disabled={!canSubmit && status !== "error"}
              loading={status === "loading"}
              leftSlot={
                <Feather
                  name="arrow-right"
                  size={16}
                  color={colors.background}
                />
              }
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
                  Alert.alert("Coming Soon!");
                  router.push("/home");
                }}
              />
              <SocialButton
                brand="Google"
                onPress={() => {
                  Alert.alert("Coming Soon!");
                  router.push("/home");
                }}
              />
              <SocialButton
                brand="Apple"
                onPress={() => {
                  Alert.alert("Coming Soon!");
                  router.push("/home");
                }}
              />
            </View>
            <Text style={styles.socialHint}>
              Quick sign-in for the prototype flow.
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.form}>
        <View style={styles.formIntro}>
          <Text style={styles.formTitle}>Login to your account</Text>
          <Text style={styles.formSubtitle}>
            Keep your saved places, order history, and rewards in sync.
          </Text>
        </View>

        <CustomInput
          label="Email or phone"
          leadingIcon="mail"
          inputProps={{
            placeholder: "Enter your email or phone",
            keyboardType: "email-address",
            autoCapitalize: "none",
            value: email,
            onChangeText: (value) => {
              setEmail(value);
              setStatus("idle");
            },
          }}
        />

        <CustomInput
          label="Password"
          leadingIcon="lock"
          secureToggle
          inputProps={{
            placeholder: "Enter your password",
            secureTextEntry: true,
            autoCapitalize: "none",
            value: password,
            onChangeText: (value) => {
              setPassword(value);
              setStatus("idle");
            },
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
