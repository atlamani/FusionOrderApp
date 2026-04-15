import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

const prepPresets = ["12 min", "15 min", "18 min", "22 min"] as const;

export default function RestaurantMenuScreen() {
  const {
    adminRestaurants,
    selectedPartnerRestaurantId,
    toggleAdminMenuItemAvailability,
    updateRestaurantPrepTime,
  } = usePrototypeState();

  const restaurant = useMemo(
    () => adminRestaurants.find((entry) => entry.id === selectedPartnerRestaurantId) ?? adminRestaurants[0],
    [adminRestaurants, selectedPartnerRestaurantId],
  );

  if (!restaurant) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>MENU CONTROLS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.hero}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.detail}>Adjust prep timing and item availability for this shift.</Text>
        </FadeInView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prep time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
            {prepPresets.map((preset) => {
              const active = preset === restaurant.avgPrepTime;
              return (
                <Pressable
                  key={preset}
                  style={[styles.presetChip, active && styles.presetChipActive]}
                  onPress={() => updateRestaurantPrepTime(restaurant.id, preset)}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>{preset}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {restaurant.menuItems.map((item, index) => (
          <FadeInView key={item.id} delay={140 + index * 40} style={styles.menuCard}>
            <View style={styles.menuCopy}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetail}>
                {item.price} {item.popular ? "· Popular" : ""}
              </Text>
            </View>
            <Pressable
              style={[styles.toggle, item.available && styles.toggleActive]}
              onPress={() => toggleAdminMenuItemAvailability(restaurant.id, item.id)}
            >
              <Text style={[styles.toggleText, item.available && styles.toggleTextActive]}>
                {item.available ? "Available" : "Paused"}
              </Text>
            </Pressable>
          </FadeInView>
        ))}
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontFamily: typography.display, fontSize: 22, color: colors.primary },
  headerSpacer: { width: 40 },
  hero: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 8,
  },
  name: { fontFamily: typography.display, fontSize: 28, color: colors.white },
  detail: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.86)" },
  section: { gap: 10 },
  sectionTitle: { fontFamily: typography.display, fontSize: 20, color: colors.primary },
  presetRow: { gap: 10, paddingRight: 20 },
  presetChip: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  presetChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetText: { fontFamily: typography.display, fontSize: 13, color: colors.primary },
  presetTextActive: { color: colors.background },
  menuCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuCopy: { flex: 1, gap: 4 },
  itemName: { fontFamily: typography.display, fontSize: 18, color: colors.primary },
  itemDetail: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted },
  toggle: {
    minWidth: 96,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  toggleActive: { backgroundColor: "#ECFDF3" },
  toggleText: { fontFamily: typography.display, fontSize: 13, color: colors.danger },
  toggleTextActive: { color: colors.success },
});
