import { router } from "expo-router";
import React from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { CustomButton } from "./customButton";
import FadeInView from "./FadeInView";
import { firebaseAuth, signInWithGoogle } from "./Firebase/auth";
import { usePrototypeState } from "./prototypeState";
import SocialButton from "./socialButton";
import { colors, radii, spacing, typography } from "./theme";

export default function HomeScreen() {
  const {
    beginAdminSession,
    beginDriverSession,
    beginGuestSession,
    beginRestaurantSession,
    loginAsMember,
  } = usePrototypeState();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Check if user is actually signed in
      const currentUser = firebaseAuth.currentUser;
      if (currentUser) {
        router.push("/home");
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error: any) {
      Alert.alert(
        "Sign In Failed",
        error.message || "Failed to sign in with Google. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundShapeTop} />
      <View style={styles.backgroundShapeBottom} />

      <View style={styles.container}>
        <FadeInView delay={60} style={styles.brandBlock}>
          <Text style={styles.brand}>FusionYum</Text>
          <Text style={styles.subtitle}>
            A multi-role food ordering prototype with discovery, operations, and
            delivery flows.
          </Text>
        </FadeInView>

        <FadeInView delay={140} style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Customer flow plus manager, restaurant, and driver workspaces
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <View style={styles.actions}>
              <CustomButton
                title="Login"
                href="/LoginScreen"
                variant="secondary"
              />
              <CustomButton title="Sign Up" href="/registerScreen" />
              <CustomButton
                title="Continue as Guest"
                variant="ghost"
                onPress={() => {
                  beginGuestSession();
                  router.push("/home");
                }}
              />
            </View>
          </View>

          <View style={styles.socialBlock}>
            <Text style={styles.socialLabel}>Or continue with</Text>
            <View style={styles.socialRow}>
              <SocialButton
                brand="Facebook"
                onPress={() => {
                  loginAsMember("facebook@fusionyum.com");
                  router.push("/home");
                }}
              />
              <SocialButton brand="Google" onPress={handleGoogleSignIn} />
              <SocialButton
                brand="Apple"
                onPress={() => {
                  loginAsMember("apple@fusionyum.com");
                  router.push("/home");
                }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workspace Demos</Text>
            <View style={styles.workspaceActions}>
              <CustomButton
                title="Manager Console"
                variant="surface"
                onPress={() => {
                  beginAdminSession();
                  router.push("/admin-dashboard");
                }}
              />
              <CustomButton
                title="Restaurant Console"
                variant="surface"
                onPress={() => {
                  beginRestaurantSession("featured-2");
                  router.push("/restaurant-dashboard");
                }}
              />
              <CustomButton
                title="Driver Console"
                variant="surface"
                onPress={() => {
                  beginDriverSession("driver-1");
                  router.push("/driver-dashboard");
                }}
              />
            </View>
          </View>
        </FadeInView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundShapeTop: {
    position: "absolute",
    top: -60,
    right: -10,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(115, 144, 114, 0.18)",
  },
  backgroundShapeBottom: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(79, 111, 82, 0.11)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: spacing.xxxl,
  },
  brandBlock: { gap: 8 },
  brand: {
    fontFamily: typography.display,
    color: colors.primary,
    fontSize: 44,
  },
  subtitle: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 22,
    gap: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.surfaceDeep,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  actions: { gap: spacing.sm },
  workspaceActions: { gap: spacing.sm },
  socialBlock: { gap: spacing.md },
  socialLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 14 },
});
