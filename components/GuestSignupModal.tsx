import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { signUpUser } from "../app/Firebase/auth";
import { colors, spacing, typography } from "../app/theme";

type GuestSignupModalProps = {
  visible: boolean;
  onClose: () => void;
  /**
   * Fires after Firebase Auth has accepted the credentials. The parent
   * is responsible for waiting on the appState's `currentUser` to update
   * before placing the order.
   */
  onAccountCreated: (email: string) => void;
};

/**
 * Lets a guest customer convert their session into a real account in
 * one tap during checkout. Calls the existing Firebase signUpUser
 * helper — the appState auth listener picks up the new credential and
 * provisions a Firestore profile automatically.
 */
export function GuestSignupModal({
  visible,
  onClose,
  onAccountCreated,
}: GuestSignupModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setEmail("");
      setPassword("");
      setSubmitting(false);
    }
  }, [visible]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0 || password.length < 6) {
      Alert.alert(
        "Almost there",
        "Email plus a password of at least 6 characters.",
      );
      return;
    }
    setSubmitting(true);
    try {
      await signUpUser(trimmedEmail, password);
      onAccountCreated(trimmedEmail);
    } catch (error: unknown) {
      const code = (error as { code?: string } | undefined)?.code;
      let message = "Couldn't create your account. Please try again.";
      if (code === "auth/email-already-in-use") {
        message =
          "An account already exists for that email. Tap Cancel and use Sign in instead.";
      } else if (code === "auth/invalid-email") {
        message = "That email address isn't valid.";
      } else if (code === "auth/weak-password") {
        message = "Pick a password with at least 6 characters.";
      }
      Alert.alert("Couldn't create account", message);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Save this order</Text>
              <Text style={styles.subtitle}>
                Create a free account so we can store your order history,
                rewards points, and saved address.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close signup dialog"
              accessibilityRole="button"
              hitSlop={12}
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Feather name="x" size={20} color={colors.primary} />
            </Pressable>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            accessibilityLabel="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderTextColor="rgba(31, 42, 31, 0.44)"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={!submitting}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            accessibilityLabel="Password"
            secureTextEntry
            placeholder="At least 6 characters"
            placeholderTextColor="rgba(31, 42, 31, 0.44)"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
          />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel signup"
              style={[styles.button, styles.cancelButton]}
              disabled={submitting}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create account and place order"
              style={[
                styles.button,
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.submitButtonText}>
                  Create account & place order
                </Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.fineprint}>
            Already have an account? Cancel, sign out of guest mode, and use the
            Customer login instead.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerCopy: { flex: 1, gap: 4 },
  title: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
    textAlign: "center",
  },
  fineprint: {
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
});
