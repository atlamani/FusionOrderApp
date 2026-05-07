import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import AuthScreenLayout from "../app/AuthScreenLayout";
import { useAppState } from "../app/appState";
import { CustomButton } from "../app/customButton";
import { CustomInput } from "../app/customTextField";
import { signInUser, signOutUser } from "../app/Firebase/auth";
import { colors, spacing, typography } from "../app/theme";

type StaffRole = "manager" | "restaurant" | "driver";

type RoleConfig = {
  label: string;
  title: string;
  subtitle: string;
  formTitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  codePlaceholder: string;
  buttonTitle: string;
  icon: keyof typeof Feather.glyphMap;
};

const roleConfigs: Record<StaffRole, RoleConfig> = {
  manager: {
    label: "Manager",
    title: "Manager login",
    subtitle: "Access operations, approvals, analytics, and partner health.",
    formTitle: "Operations access",
    emailLabel: "Manager email",
    emailPlaceholder: "manager@fusionyum.com",
    codePlaceholder: "Enter manager password",
    buttonTitle: "Open manager console",
    icon: "bar-chart-2",
  },
  restaurant: {
    label: "Restaurant",
    title: "Restaurant login",
    subtitle: "Manage live orders, prep time, and menu availability.",
    formTitle: "Partner access",
    emailLabel: "Partner email",
    emailPlaceholder: "partner@restaurant.com",
    codePlaceholder: "Enter restaurant password",
    buttonTitle: "Open restaurant console",
    icon: "coffee",
  },
  driver: {
    label: "Driver",
    title: "Driver login",
    subtitle: "View assignments, claim routes, and complete deliveries.",
    formTitle: "Driver access",
    emailLabel: "Driver email",
    emailPlaceholder: "driver@fusionyum.com",
    codePlaceholder: "Enter driver password",
    buttonTitle: "Open driver console",
    icon: "navigation",
  },
};

export default function StaffLoginScreen({ role }: { role: StaffRole }) {
  const config = roleConfigs[role];
  const {
    beginAdminSession,
    beginDriverSession,
    beginGoogleAggregatorSession,
    beginRestaurantSession,
  } = useAppState();
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const pulse = useRef(new Animated.Value(0)).current;

  const canSubmit = email.trim().length > 0 && accessCode.trim().length > 0;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  const handleLogin = async () => {
    if (!canSubmit) {
      setStatus("error");
      setErrorMessage("Enter your workspace email and password.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    let signedIn = false;

    try {
      const credential = await signInUser(email.trim(), accessCode);
      signedIn = true;
      const tokenResult = await credential.user.getIdTokenResult(true);
      const claims = tokenResult.claims as {
        admin?: boolean;
        restaurantId?: string;
        driverId?: string;
        googleAggregator?: boolean;
      };

      if (role === "manager") {
        if (claims.admin !== true) {
          throw new Error("This account is not authorized for manager access.");
        }

        beginAdminSession();
        router.replace("/admin-dashboard");
        return;
      }

      if (role === "restaurant") {
        // The Google aggregator account fulfills orders for every Google-
        // Places-sourced restaurant. It signs in through the same restaurant
        // login flow but goes straight to the order queue (the partner
        // dashboard cards depend on a single restaurantId we don't have).
        // The hardcoded email below is a fallback so the aggregator account
        // can sign in before its custom claim has been provisioned.
        const aggregatorEmail =
          credential.user.email?.trim().toLowerCase() ?? "";
        const isFallbackAggregator =
          aggregatorEmail === "google@fusionyum.com";
        if (claims.googleAggregator === true || isFallbackAggregator) {
          beginGoogleAggregatorSession();
          router.replace("/restaurant-orders");
          return;
        }

        if (typeof claims.restaurantId !== "string") {
          throw new Error(
            "This account is not assigned to a restaurant location yet.",
          );
        }

        beginRestaurantSession(claims.restaurantId);
        router.replace("/restaurant-dashboard");
        return;
      }

      if (typeof claims.driverId !== "string") {
        throw new Error("This account is not assigned to a driver profile yet.");
      }

      beginDriverSession(claims.driverId);
      router.replace("/driver-dashboard");
    } catch (error) {
      if (signedIn) {
        void signOutUser().catch(() => undefined);
      }

      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify this staff account.",
      );
    }
  };

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.14],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.08],
  });

  return (
    <AuthScreenLayout
      backHref="/"
      eyebrow="FusionYum"
      title={config.title}
      subtitle={config.subtitle}
      footer={
        <View style={styles.footer}>
          {status === "error" ? (
            <Text style={styles.errorText}>
              {errorMessage || "Enter your workspace email and password."}
            </Text>
          ) : null}
          <CustomButton
            title={config.buttonTitle}
            onPress={handleLogin}
            disabled={status === "loading"}
            loading={status === "loading"}
            leftSlot={
              <Feather name="arrow-right" size={16} color={colors.background} />
            }
          />
        </View>
      }
    >
      <View style={styles.roleHeader}>
        <View style={styles.iconStage}>
          <Animated.View
            style={[
              styles.iconHalo,
              { opacity: haloOpacity, transform: [{ scale: haloScale }] },
            ]}
          />
          <View style={styles.iconShell}>
            <Feather name={config.icon} size={25} color={colors.background} />
          </View>
        </View>
        <View style={styles.roleCopy}>
          <Text style={styles.formTitle}>{config.formTitle}</Text>
          <Text style={styles.formSubtitle}>
            Sign in as a {config.label.toLowerCase()} to continue.
          </Text>
        </View>
      </View>

      <CustomInput
        label={config.emailLabel}
        leadingIcon="mail"
        inputProps={{
          placeholder: config.emailPlaceholder,
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
          placeholder: config.codePlaceholder,
          secureTextEntry: true,
          autoCapitalize: "none",
          value: accessCode,
          onChangeText: (value) => {
            setAccessCode(value);
            setStatus("idle");
          },
        }}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: 2,
  },
  iconStage: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  iconHalo: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.surface,
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCopy: {
    flex: 1,
    gap: 3,
  },
  formTitle: {
    fontFamily: typography.display,
    fontSize: 23,
    color: colors.primary,
  },
  formSubtitle: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  footer: {
    gap: spacing.sm,
  },
  errorText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.danger,
  },
});
