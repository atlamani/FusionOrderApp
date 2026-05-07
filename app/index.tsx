import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FadeInView from "./FadeInView";
import { useAppState } from "./appState";
import { colors, spacing, typography } from "./theme";
import FusionYumLogo from "../components/FusionYumLogo";

const roleCards = [
  {
    id: "customer",
    title: "Customer",
    detail: "Order food, track delivery, rewards, and favorites.",
    icon: "shopping-bag",
  },
  {
    id: "manager",
    title: "Manager",
    detail: "Review orders, partners, reports, and service health.",
    icon: "bar-chart-2",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    detail: "Run the kitchen queue and manage the live menu.",
    icon: "coffee",
  },
  {
    id: "driver",
    title: "Driver",
    detail: "Claim assignments and complete delivery routes.",
    icon: "navigation",
  },
] as const;

export default function RoleGatewayScreen() {
  const { beginGuestSession } = useAppState();
  const logoScale = useRef(new Animated.Value(1)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.06,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const spin = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulse.start();
    spin.start();

    return () => {
      pulse.stop();
      spin.stop();
    };
  }, [logoScale, ringSpin]);

  const handleRolePress = (roleId: (typeof roleCards)[number]["id"]) => {
    if (roleId === "customer") {
      router.push("/LoginScreen");
      return;
    }

    if (roleId === "manager") {
      router.push("/manager-login");
      return;
    }

    if (roleId === "restaurant") {
      router.push("/restaurant-login");
      return;
    }

    router.push("/driver-login");
  };

  const ringRotation = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FadeInView delay={60} style={styles.brandStage}>
          <Animated.View style={[styles.logoOrbit, { transform: [{ rotate: ringRotation }] }]}>
            <View style={styles.orbitDashTop} />
            <View style={styles.orbitDashBottom} />
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <FusionYumLogo size={110} variant="solid" />
          </Animated.View>
          <Text style={styles.brand}>FusionYum</Text>
          <Text style={styles.tagline}>Choose your workspace</Text>
        </FadeInView>

        <FadeInView delay={150} style={styles.promptBlock}>
          <Text style={styles.question}>How are you using FusionYum today?</Text>
          <Text style={styles.promptCopy}>
            Pick a role and we&apos;ll take you straight to the right experience.
          </Text>
        </FadeInView>

        <View style={styles.roleGrid}>
          {roleCards.map((role, index) => (
            <FadeInView key={role.id} delay={220 + index * 55} style={styles.roleCell}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Continue as ${role.title}`}
                style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
                onPress={() => handleRolePress(role.id)}
              >
                <View style={styles.roleIcon}>
                  <Feather name={role.icon} size={24} color={colors.background} />
                </View>
                <View style={styles.roleCopy}>
                  <Text style={styles.roleTitle}>{role.title}</Text>
                  <Text style={styles.roleDetail}>{role.detail}</Text>
                </View>
                <Feather name="arrow-right" size={18} color={colors.surfaceDeep} />
              </Pressable>
            </FadeInView>
          ))}
          <FadeInView delay={460} style={styles.roleCell}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue as guest"
              style={({ pressed }) => [
                styles.guestButton,
                pressed && styles.roleCardPressed,
              ]}
              onPress={() => {
                beginGuestSession();
                router.replace("/home");
              }}
            >
              <Feather name="user-check" size={18} color={colors.primary} />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </Pressable>
          </FadeInView>
        </View>
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
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: spacing.xl,
  },
  brandStage: {
    alignItems: "center",
    gap: 10,
  },
  logoOrbit: {
    position: "absolute",
    top: -7,
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 1,
    borderColor: "rgba(58, 77, 57, 0.2)",
  },
  orbitDashTop: {
    position: "absolute",
    top: -3,
    left: 48,
    width: 26,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  orbitDashBottom: {
    position: "absolute",
    bottom: -3,
    right: 48,
    width: 26,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceDeep,
  },
  brand: {
    marginTop: 8,
    fontFamily: typography.display,
    fontSize: 44,
    color: colors.primary,
    textAlign: "center",
  },
  tagline: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  promptBlock: {
    alignItems: "center",
    gap: 6,
  },
  question: {
    fontFamily: typography.display,
    fontSize: 25,
    lineHeight: 31,
    color: colors.primary,
    textAlign: "center",
  },
  promptCopy: {
    maxWidth: 310,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: "center",
  },
  roleGrid: {
    gap: 12,
  },
  roleCell: {
    width: "100%",
  },
  roleCard: {
    minHeight: 82,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  roleCardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  roleIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCopy: {
    flex: 1,
    gap: 4,
  },
  guestButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  guestButtonText: {
    fontFamily: typography.display,
    fontSize: 15,
    color: colors.primary,
  },
  roleTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  roleDetail: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
});
