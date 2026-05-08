import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { useAppState } from "../app/appState";
import { colors, spacing, typography } from "../app/theme";

type LogoutButtonProps = {
  message?: string;
  accessibilityLabel?: string;
};

export default function LogoutButton({
  message = "You'll need to sign back in to continue.",
  accessibilityLabel = "Log out",
}: LogoutButtonProps) {
  const { logout } = useAppState();

  const handlePress = () => {
    Alert.alert("Log out?", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={10}
      style={styles.button}
      onPress={handlePress}
    >
      <Feather name="log-out" size={16} color={colors.danger} />
      <Text style={styles.text}>Log out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: spacing.md,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.danger,
  },
});
