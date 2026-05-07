import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAppState } from "./appState";
import { colors, spacing, typography } from "./theme";

type StaffRole = "admin" | "restaurant" | "driver";
type StaffLoginRoute = "/manager-login" | "/restaurant-login" | "/driver-login";

const roleCopy: Record<
  StaffRole,
  { title: string; body: string; action: string; route: StaffLoginRoute }
> = {
  admin: {
    title: "Manager authorization required",
    body: "Sign in with a Firebase account that has the admin custom claim.",
    action: "Open manager login",
    route: "/manager-login",
  },
  restaurant: {
    title: "Restaurant authorization required",
    body: "Sign in with a Firebase account that has a restaurantId custom claim.",
    action: "Open restaurant login",
    route: "/restaurant-login",
  },
  driver: {
    title: "Driver authorization required",
    body: "Sign in with a Firebase account that has a driverId custom claim.",
    action: "Open driver login",
    route: "/driver-login",
  },
};

export default function StaffAccessGate({
  children,
  role,
}: {
  children: React.ReactNode;
  role: StaffRole;
}) {
  const { logout, sessionMode } = useAppState();

  if (sessionMode === role) {
    return <>{children}</>;
  }

  // The Google aggregator role fulfills orders for any Google-sourced
  // restaurant, so it should pass any "restaurant" gate the same way a
  // partner restaurant login does.
  if (role === "restaurant" && sessionMode === "googleAggregator") {
    return <>{children}</>;
  }

  const copy = roleCopy[role];

  const handleLoginPress = () => {
    if (sessionMode !== "guest" && sessionMode !== "signed-out") {
      logout();
    }

    router.replace(copy.route);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.iconShell}>
          <Feather name="lock" size={22} color={colors.background} />
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{copy.body}</Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
          ]}
          onPress={handleLoginPress}
        >
          <Text style={styles.actionText}>{copy.action}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    alignItems: "center",
    gap: spacing.sm,
  },
  iconShell: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 26,
    color: colors.primary,
    textAlign: "center",
  },
  body: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 320,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  actionText: {
    fontFamily: typography.body,
    fontSize: 14,
    fontWeight: "700",
    color: colors.background,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
