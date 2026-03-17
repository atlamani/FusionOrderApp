import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "./theme";

export default function OrderPlacedScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.successIcon}>
          <Feather name="check" size={34} color={colors.surface} />
        </View>

        <View style={styles.messageBlock}>
          <Text style={styles.title}>Congratulations</Text>
          <Text style={styles.subtitle}>You placed an order</Text>
          <Text style={styles.subtitle}>Enjoy!</Text>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>Start Earning Rewards! 🎁</Text>
          <Text style={styles.rewardCopy}>
            Get POINTS every time you order from our app for future rewards. Just enter your email
            to start earning on this order!
          </Text>
          <TextInput
            style={styles.emailInput}
            value=""
            placeholder="Enter Your Email"
            placeholderTextColor="rgba(0,0,0,0.5)"
          />
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox} />
            <Text style={styles.checkboxLabel}>
              By checking this box, you agree to sign up using the information provided
            </Text>
          </View>
          <Pressable style={styles.rewardButton}>
            <Text style={styles.rewardButtonText}>Sign Up for Rewards</Text>
          </Pressable>
        </View>

        <View style={styles.footerCopy}>
          <Text style={styles.footerText}>Thank You for your support.</Text>
          <Text style={styles.footerText}>See you next time!</Text>
        </View>

        <Pressable style={styles.homeButton} onPress={() => router.replace("/home")}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 24,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBlock: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 36,
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
  },
  rewardCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  rewardTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.text,
  },
  rewardCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(0,0,0,0.7)",
  },
  emailInput: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 0.638,
    borderColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 16,
    fontFamily: typography.body,
    fontSize: 14,
    color: "rgba(0,0,0,0.5)",
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.4)",
    marginTop: 3,
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(0,0,0,0.7)",
  },
  rewardButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "rgba(115,144,114,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardButtonText: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.white,
  },
  footerCopy: {
    alignItems: "center",
    gap: 12,
  },
  footerText: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
  },
  homeButton: {
    minWidth: 192,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  homeButtonText: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.white,
  },
});
