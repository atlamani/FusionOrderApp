import { Feather } from "@expo/vector-icons";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Feather name="user" size={24} color={colors.background} />
        </View>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.copy}>
          Account details, delivery addresses, and preferences can plug into this screen later
          without changing the navigation shell.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: typography.display,
    fontSize: 30,
    color: colors.primary,
  },
  copy: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 320,
  },
});
