import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function DriverDashboardScreen() {
  const { adminOrders, driverProfiles, logout, selectedDriverId, setSelectedDriver } = usePrototypeState();

  const activeDriver = useMemo(
    () => driverProfiles.find((driver) => driver.id === selectedDriverId) ?? driverProfiles[0],
    [driverProfiles, selectedDriverId],
  );

  const metrics = useMemo(() => {
    const readyPool = adminOrders.filter((order) => order.status === "Ready for Driver").length;
    const assigned = adminOrders.filter(
      (order) => order.driver === activeDriver?.name && order.status === "Out for Delivery",
    ).length;
    const completed = adminOrders.filter(
      (order) => order.driver === activeDriver?.name && order.status === "Completed",
    ).length;

    return { readyPool, assigned, completed };
  }, [activeDriver?.name, adminOrders]);

  if (!activeDriver) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Driver Console</Text>
            <Text style={styles.title}>{activeDriver.name}</Text>
            <Text style={styles.subtitle}>{`${activeDriver.vehicle} · ${activeDriver.zone} · ${activeDriver.status}`}</Text>
          </View>
          <Pressable
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace("/");
            }}
          >
            <Feather name="log-out" size={18} color={colors.background} />
          </Pressable>
        </FadeInView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {driverProfiles.map((driver) => {
            const active = driver.id === activeDriver.id;
            return (
              <Pressable
                key={driver.id}
                style={[styles.selectorChip, active && styles.selectorChipActive]}
                onPress={() => setSelectedDriver(driver.id)}
              >
                <Text style={[styles.selectorText, active && styles.selectorTextActive]}>{driver.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.metricGrid}>
          <FadeInView delay={90} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.readyPool}</Text>
            <Text style={styles.metricLabel}>Ready to claim</Text>
          </FadeInView>
          <FadeInView delay={130} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.assigned}</Text>
            <Text style={styles.metricLabel}>Active drops</Text>
          </FadeInView>
          <FadeInView delay={170} style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.completed}</Text>
            <Text style={styles.metricLabel}>Completed today</Text>
          </FadeInView>
        </View>

        <FadeInView delay={220} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Shift snapshot</Text>
          <Text style={styles.summaryCopy}>
            {metrics.assigned > 0
              ? "You have an active drop in progress. Open route view to complete delivery."
              : "No active route yet. Claim a ready order to start your next run."}
          </Text>
        </FadeInView>

        <View style={styles.linkStack}>
          <Pressable style={styles.linkCard} onPress={() => router.push("/driver-assignments")}>
            <View style={styles.linkIcon}>
              <Feather name="package" size={18} color={colors.background} />
            </View>
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>Assignments</Text>
              <Text style={styles.linkDetail}>Claim ready orders and review active deliveries.</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </Pressable>

          <Pressable style={styles.linkCard} onPress={() => router.push("/driver-route")}>
            <View style={styles.linkIcon}>
              <Feather name="map" size={18} color={colors.background} />
            </View>
            <View style={styles.linkCopy}>
              <Text style={styles.linkTitle}>Route View</Text>
              <Text style={styles.linkDetail}>See your current drop and mark delivery complete.</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  hero: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 20,
    flexDirection: "row",
    gap: 16,
  },
  heroCopy: { flex: 1, gap: 6 },
  eyebrow: { fontFamily: typography.body, fontSize: 12, color: "rgba(255,255,255,0.78)" },
  title: { fontFamily: typography.display, fontSize: 30, color: colors.white },
  subtitle: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.88)" },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  selectorRow: { gap: 10, paddingRight: 20 },
  selectorChip: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  selectorChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectorText: { fontFamily: typography.display, fontSize: 13, color: colors.primary },
  selectorTextActive: { color: colors.background },
  metricGrid: { flexDirection: "row", gap: 10 },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  metricValue: { fontFamily: typography.display, fontSize: 28, color: colors.primary },
  metricLabel: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  summaryCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  summaryTitle: { fontFamily: typography.display, fontSize: 22, color: colors.primary },
  summaryCopy: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.text },
  linkStack: { gap: 12 },
  linkCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  linkCopy: { flex: 1, gap: 4 },
  linkTitle: { fontFamily: typography.display, fontSize: 18, color: colors.primary },
  linkDetail: { fontFamily: typography.body, fontSize: 13, lineHeight: 18, color: colors.textMuted },
});
