import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, typography } from "./theme";

export default function OrderPlacedScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.successIcon}>
          <Feather name="check" size={34} color={colors.surface} />
        </View>

        <View style={styles.messageBlock}>
          <Text style={styles.title}>Congratulations</Text>
          <Text style={styles.subtitle}>You placed an order.</Text>
          <Text style={styles.subtitle}>Enjoy!</Text>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>Start Earning Rewards</Text>
          <Text style={styles.rewardCopy}>
            Get points every time you order from FusionYum. Add your email to start earning on
            this mock order too.
          </Text>
          <TextInput
            style={styles.emailInput}
            value=""
            placeholder="Enter your email"
            placeholderTextColor="rgba(0,0,0,0.45)"
          />
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox}>
              <Feather name="check" size={12} color={colors.surfaceDeep} />
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to join the rewards list with the contact information above.
            </Text>
          </View>
          <Pressable style={styles.rewardButton}>
            <Text style={styles.rewardButtonText}>Sign Up for Rewards</Text>
          </Pressable>
        </View>

        <View style={styles.footerCopy}>
          <Text style={styles.footerText}>Thank you for your support.</Text>
          <Text style={styles.footerText}>See you next time.</Text>
        </View>

        <Pressable style={styles.trackButton} onPress={() => router.replace("/activity")}>
          <Text style={styles.trackButtonText}>Track Order</Text>
        </Pressable>

        <Pressable style={styles.homeButton} onPress={() => router.replace("/home")}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 22,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  messageBlock: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 38,
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
    padding: 22,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  rewardTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.text,
  },
  rewardCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(0,0,0,0.72)",
  },
  emailInput: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 16,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text,
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(0,0,0,0.7)",
  },
  rewardButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
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
    gap: 4,
  },
  footerText: {
    fontFamily: typography.display,
    fontSize: 19,
    color: colors.text,
    textAlign: "center",
  },
  trackButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  trackButtonText: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.white,
  },
  homeButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  homeButtonText: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.text,
  },
});
