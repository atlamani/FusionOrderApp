import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "./AuthScreenLayout";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { signInUser, signInWithGoogle, signUpUser } from "./Firebase/auth";
import SocialButton from "./socialButton";
import { colors, spacing, typography } from "./theme";

type AuthMode = "login" | "signup";

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit =
    email.trim().length > 0 &&
    password.trim().length >= (mode === "signup" ? 6 : 1);
  const isSignup = mode === "signup";

  const handleLogin = async () => {
    if (!canSubmit) {
      setStatus("error");
      setErrorMessage(
        isSignup
          ? "Email plus a password of 6+ characters."
          : "Add both fields to continue",
      );
      return;
    }

    setStatus("loading");

    try {
      if (isSignup) {
        await signUpUser(email.trim(), password);
      } else {
        await signInUser(email.trim(), password);
      }

      setStatus("success");
      router.push("/home");
    } catch (error: any) {
      setStatus("error");

      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setErrorMessage("Invalid email or password");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("That email address is invalid.");
      } else if (error.code === "auth/email-already-in-use") {
        setErrorMessage(
          "An account already exists for that email — try signing in instead.",
        );
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("Pick a password with at least 6 characters.");
      } else {
        setErrorMessage("An unexpected error occurred. Try again.");
      }

      console.error(error);
    }
  };

  const handleToggleMode = () => {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setStatus("idle");
    setErrorMessage("");
  };

  const handleGoogleSignIn = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      await signInWithGoogle();
      setStatus("success");
      router.push("/home");
    } catch (error: any) {
      setStatus("error");
      setErrorMessage("Failed to sign in with Google. Please try again.");
      console.error(error);
    }
  };

  return (
    <AuthScreenLayout
      backHref="/"
      eyebrow="FusionYum"
      title={isSignup ? "Welcome to FusionYum" : "Welcome back"}
      subtitle={
        isSignup
          ? "Create your account in 30 seconds. Email + password is all we need."
          : "Sign in to continue your orders, favorites, and delivery updates."
      }
      footer={
        <View style={styles.actions}>
          <View style={styles.primaryBlock}>
            {status === "error" ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <CustomButton
              title={
                status === "success"
                  ? "Ready"
                  : isSignup
                    ? "Create account"
                    : "Login"
              }
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

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isSignup ? "Switch to sign in" : "Switch to create account"
              }
              hitSlop={8}
              onPress={handleToggleMode}
              style={styles.toggleRow}
            >
              <Text style={styles.toggleText}>
                {isSignup
                  ? "Already have an account? "
                  : "New to FusionYum? "}
                <Text style={styles.toggleEmphasis}>
                  {isSignup ? "Sign in" : "Create one"}
                </Text>
              </Text>
            </Pressable>
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
                  Alert.alert("Facebook sign-in is not connected yet.");
                }}
              />
              <SocialButton
                brand="Google"
                onPress={handleGoogleSignIn}
              />
              <SocialButton
                brand="Apple"
                onPress={() => {
                  Alert.alert("Apple sign-in is not connected yet.");
                }}
              />
            </View>
            <Text style={styles.socialHint}>
              Sign in with Google or use your email and password above.
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.form}>
        <View style={styles.formIntro}>
          <Text style={styles.formTitle}>
            {isSignup ? "Create your account" : "Login to your account"}
          </Text>
          <Text style={styles.formSubtitle}>
            {isSignup
              ? "Your account stores your favorites, order history, rewards balance, and saved address."
              : "Keep your saved places, order history, and rewards in sync."}
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

        {isSignup ? null : (
          <Link href="/passwordReset" style={styles.link}>
            Forgot your password?
          </Link>
        )}
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
  toggleRow: {
    paddingTop: 4,
    alignItems: "center",
  },
  toggleText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  toggleEmphasis: {
    fontFamily: typography.display,
    color: colors.primary,
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
