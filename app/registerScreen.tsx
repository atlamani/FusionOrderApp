import { Feather } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "./AuthScreenLayout";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { signUpUser } from "./Firebase/auth";
import { saveUserProfile } from "./Firebase/firestore";
import { usePrototypeState } from "./prototypeState";
import SocialButton from "./socialButton";
import { colors, spacing, typography } from "./theme";

export default function RegisterScreen() {
  const { updateProfile } = usePrototypeState();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneValid = phoneDigits.length >= 10;
  const passwordMatch = password.trim().length > 0 && password === confirm;
  const allFilled = Boolean(
    fullName.trim() &&
    email.trim() &&
    phone.trim() &&
    address.trim() &&
    password.trim() &&
    confirm.trim(),
  );
  const canSubmit = allFilled && emailValid && phoneValid && passwordMatch;

  const handleSignUp = async () => {
    if (!canSubmit) {
      setError("Please fill out all required fields with valid information.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signUpUser(email.trim(), password);
      const user = userCredential.user;

      await user.updateProfile({
        displayName: fullName.trim(),
      });

      await saveUserProfile(user.uid, {
        uid: user.uid,
        email: user.email,
        displayName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryNote: "",
        rewardsPoints: 0,
        rewardsTier: "Bronze Member",
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryNote: "",
        rewardsPoints: 0,
        rewardsTier: "Bronze Member",
      });

      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(
      "Use the form above so we can collect your name, phone, and delivery address.",
    );
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
              <Text style={styles.helperCardText}>
                Create your account to save favorites, unlock rewards, and enjoy
                a personalized experience.
              </Text>
            </View>

            {!passwordMatch && confirm.length > 0 ? (
              <Text style={styles.errorText}>
                Passwords need to match before you continue.
              </Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <CustomButton
              title="Create account"
              onPress={handleSignUp}
              disabled={!canSubmit}
              loading={loading}
              leftSlot={
                <Feather name="user-plus" size={16} color={colors.background} />
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
              <SocialButton brand="Facebook" onPress={() => {}} />
              <SocialButton brand="Google" onPress={handleGoogleSignIn} />
              <SocialButton brand="Apple" onPress={() => {}} />
            </View>
            <Text style={styles.socialHint}>
              Google sign-in is available on the login screen for existing
              users.
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.form}>
        <View style={styles.formIntro}>
          <Text style={styles.formTitle}>Create your account</Text>
          <Text style={styles.formSubtitle}>
            A simple setup for favorites, rewards, and smoother checkout later.
          </Text>
        </View>

        <CustomInput
          label="Full name"
          leadingIcon="user"
          inputProps={{
            placeholder: "Enter your full name",
            autoCapitalize: "words",
            value: fullName,
            onChangeText: setFullName,
          }}
        />

        <CustomInput
          label="Email"
          leadingIcon="user"
          errorText={
            !emailValid && email.length > 0
              ? "Enter a valid email address."
              : undefined
          }
          inputProps={{
            placeholder: "Enter your email",
            keyboardType: "email-address",
            autoCapitalize: "none",
            value: email,
            onChangeText: setEmail,
          }}
        />

        <CustomInput
          label="Phone number"
          leadingIcon="phone"
          errorText={
            !phoneValid && phone.length > 0
              ? "Enter at least 10 digits."
              : undefined
          }
          inputProps={{
            placeholder: "Enter your phone number",
            keyboardType: "phone-pad",
            autoCapitalize: "none",
            value: phone,
            onChangeText: setPhone,
          }}
        />

        <CustomInput
          label="Delivery address"
          leadingIcon="map-pin"
          inputProps={{
            placeholder: "Enter one delivery address",
            autoCapitalize: "words",
            value: address,
            onChangeText: setAddress,
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
          errorText={
            !passwordMatch && confirm.length > 0
              ? "Passwords need to match."
              : undefined
          }
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
