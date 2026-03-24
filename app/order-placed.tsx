import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { CustomButton } from "./customButton";
import { CustomInput } from "./customTextField";
import { usePrototypeState } from "./prototypeState";
import { colors, typography } from "./theme";

export default function OrderPlacedScreen() {
  const { currentOrder, joinRewards, joinedRewards, rewardsEmail } = usePrototypeState();
  const [email, setEmail] = useState(rewardsEmail);
  const [showError, setShowError] = useState(false);

  const handleJoinRewards = () => {
    if (!email.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    joinRewards(email.trim());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.successIcon}>
          <Feather name="check" size={34} color={colors.surface} />
        </FadeInView>

        <FadeInView delay={100} style={styles.messageBlock}>
          <Text style={styles.title}>Congratulations</Text>
          <Text style={styles.subtitle}>You placed an order.</Text>
          {currentOrder ? <Text style={styles.orderMeta}>Order #{currentOrder.id} is in motion.</Text> : null}
          <Text style={styles.subtitle}>Enjoy!</Text>
        </FadeInView>

        <FadeInView delay={180} style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>Start Earning Rewards</Text>
          <Text style={styles.rewardCopy}>
            Get points every time you order from FusionYum. Add your email to start earning on
            this mock order too.
          </Text>
          <CustomInput
            label="Rewards email"
            leadingIcon="mail"
            errorText={showError ? "Enter an email to join rewards." : undefined}
            inputProps={{
              placeholder: "Enter your email",
              keyboardType: "email-address",
              autoCapitalize: "none",
              value: email,
              onChangeText: (value) => {
                setEmail(value);
                setShowError(false);
              },
            }}
          />
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox}>
              <Feather name="check" size={12} color={colors.surfaceDeep} />
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to join the rewards list with the contact information above.
            </Text>
          </View>
          <CustomButton
            title={joinedRewards ? "Rewards Joined" : "Sign Up for Rewards"}
            variant={joinedRewards ? "secondary" : "primary"}
            onPress={handleJoinRewards}
          />
          {joinedRewards ? (
            <View style={styles.successBanner}>
              <Feather name="star" size={16} color={colors.success} />
              <Text style={styles.successBannerText}>Rewards activated locally for this prototype account.</Text>
            </View>
          ) : null}
        </FadeInView>

        <FadeInView delay={240} style={styles.footerCopy}>
          <Text style={styles.footerText}>Thank you for your support.</Text>
          <Text style={styles.footerText}>See you next time.</Text>
        </FadeInView>

        <FadeInView delay={300} style={styles.actions}>
          <CustomButton
            title="Track Order"
            variant="secondary"
            onPress={() => router.replace("/activity")}
          />
          <CustomButton title="View Receipt" variant="surface" onPress={() => router.push("/order-receipt")} />
          <CustomButton title="Back to Home" variant="surface" onPress={() => router.replace("/home")} />
        </FadeInView>
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
  orderMeta: {
    fontFamily: typography.body,
    fontSize: 13,
    color: "rgba(0,0,0,0.6)",
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
  successBanner: {
    borderRadius: 16,
    backgroundColor: "#ECFDF3",
    padding: 12,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  successBannerText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.success,
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
  actions: {
    width: "100%",
    gap: 12,
  },
});
