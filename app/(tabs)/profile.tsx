import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "../FadeInView";
import { CustomButton } from "../customButton";
import { profileShortcuts } from "../mockData";
import { getInitials, usePrototypeState } from "../prototypeState";
import { colors, spacing, typography } from "../theme";

const routeMap: Record<string, string> = {
  address: "/address-book",
  recent: "/activity-history",
  rewards: "/rewards-club",
  settings: "/account-settings",
};

export default function ProfileScreen() {
  const { logout, profile, sessionMode } = usePrototypeState();
  const isSignedOut = sessionMode === "signed-out";
  const isAdmin = sessionMode === "admin";
  const isRestaurant = sessionMode === "restaurant";
  const isDriver = sessionMode === "driver";
  const displayName = isSignedOut ? "Welcome back" : sessionMode === "guest" ? "Guest Explorer" : profile.fullName;
  const displaySubtitle = isSignedOut
    ? "Sign in to save favorites, manage delivery details, and unlock rewards."
    : isAdmin
      ? "Manager access enabled for local operations demo"
    : isRestaurant
      ? "Restaurant partner mode enabled for kitchen and menu controls"
    : isDriver
      ? "Driver mode enabled for assignments and route completion"
    : sessionMode === "guest"
      ? "Browsing in guest mode with local-only demo data"
      : `${profile.rewardsTier} | FusionYum prototype member`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{isSignedOut ? "FY" : getInitials(displayName)}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.title}>{displayName}</Text>
            <Text style={styles.subtitle}>{displaySubtitle}</Text>
          </View>
          <Pressable
            style={styles.editButton}
            onPress={() => router.push(isSignedOut ? "/LoginScreen" : "/edit-profile")}
          >
            <Feather name={isSignedOut ? "log-in" : "edit-2"} size={16} color={colors.background} />
          </Pressable>
        </FadeInView>

        {isSignedOut ? (
          <FadeInView delay={100} style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Account features are ready when you are</Text>
            <Text style={styles.emptyCopy}>
              Sign in for editable profile details, receipts, saved addresses, and rewards history.
            </Text>
            <View style={styles.emptyActions}>
              <CustomButton title="Login" onPress={() => router.push("/LoginScreen")} />
              <CustomButton title="Create Account" variant="surface" onPress={() => router.push("/registerScreen")} />
            </View>
          </FadeInView>
        ) : isAdmin ? (
          <>
            <FadeInView delay={120} style={styles.rewardsCard}>
              <Text style={styles.rewardsLabel}>Operations Workspace</Text>
              <Text style={styles.rewardsValue}>Manager Demo</Text>
              <Text style={styles.rewardsCopy}>
                Open the operations dashboard to review live orders, restaurant approvals, and feedback.
              </Text>
              <CustomButton title="Open Admin Dashboard" variant="secondary" onPress={() => router.push("/admin-dashboard")} />
            </FadeInView>

            <CustomButton
              title="Log Out"
              variant="ghost"
              onPress={() => {
                logout();
                router.replace("/");
              }}
            />
          </>
        ) : isRestaurant ? (
          <>
            <FadeInView delay={120} style={styles.rewardsCard}>
              <Text style={styles.rewardsLabel}>Partner Workspace</Text>
              <Text style={styles.rewardsValue}>Restaurant Demo</Text>
              <Text style={styles.rewardsCopy}>
                Open the restaurant console to manage the kitchen queue, prep timing, and menu availability.
              </Text>
              <CustomButton title="Open Restaurant Dashboard" variant="secondary" onPress={() => router.push("/restaurant-dashboard")} />
            </FadeInView>

            <CustomButton
              title="Log Out"
              variant="ghost"
              onPress={() => {
                logout();
                router.replace("/");
              }}
            />
          </>
        ) : isDriver ? (
          <>
            <FadeInView delay={120} style={styles.rewardsCard}>
              <Text style={styles.rewardsLabel}>Driver Workspace</Text>
              <Text style={styles.rewardsValue}>Courier Demo</Text>
              <Text style={styles.rewardsCopy}>
                Open the driver console to claim assignments, view route progress, and complete deliveries.
              </Text>
              <CustomButton title="Open Driver Dashboard" variant="secondary" onPress={() => router.push("/driver-dashboard")} />
            </FadeInView>

            <CustomButton
              title="Log Out"
              variant="ghost"
              onPress={() => {
                logout();
                router.replace("/");
              }}
            />
          </>
        ) : (
          <>
            <FadeInView delay={120} style={styles.rewardsCard}>
              <Text style={styles.rewardsLabel}>Rewards Progress</Text>
              <Text style={styles.rewardsValue}>{profile.rewardsPoints} pts</Text>
              <Text style={styles.rewardsCopy}>
                Place one more mock order to unlock your next free dessert reward.
              </Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </FadeInView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account</Text>
              <Pressable onPress={() => router.push("/activity")}>
                <Text style={styles.sectionLink}>Open Activity</Text>
              </Pressable>
            </View>

            {profileShortcuts.map((shortcut) => (
              <Pressable
                key={shortcut.id}
                style={styles.shortcutCard}
                onPress={() => router.push(routeMap[shortcut.id] as never)}
              >
                <View style={styles.shortcutIcon}>
                  <Feather name={shortcut.icon} size={18} color={colors.background} />
                </View>
                <View style={styles.shortcutCopy}>
                  <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
                  <Text style={styles.shortcutDetail}>{shortcut.detail}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </Pressable>
            ))}

            <Pressable style={styles.helpCard} onPress={() => router.push("/help-center")}>
              <View style={styles.helpIcon}>
                <Feather name="help-circle" size={18} color={colors.background} />
              </View>
              <View style={styles.helpCopy}>
                <Text style={styles.helpTitle}>Help Center</Text>
                <Text style={styles.helpDetail}>Get support, FAQs, and receipt help</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>

            <CustomButton
              title="Log Out"
              variant="ghost"
              onPress={() => {
                logout();
                router.replace("/");
              }}
            />
          </>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  profileCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.background,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.white,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.86)",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(79,111,82,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.primary,
  },
  emptyCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  emptyActions: {
    gap: spacing.sm,
  },
  rewardsCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  rewardsLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  rewardsValue: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primary,
  },
  rewardsCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  progressFill: {
    width: "72%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  sectionLink: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.surfaceDeep,
  },
  shortcutCard: {
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  shortcutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  shortcutCopy: {
    flex: 1,
    gap: 4,
  },
  shortcutLabel: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  shortcutDetail: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  helpCard: {
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  helpIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  helpCopy: {
    flex: 1,
    gap: 4,
  },
  helpTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  helpDetail: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
