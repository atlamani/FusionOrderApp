import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FadeInView from "./FadeInView";
import { menuByRestaurantId } from "./mockData";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function AdminRestaurantDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const {
    adminRestaurants,
    approveRestaurant,
    beginRestaurantSession,
    toggleAdminMenuItemAvailability,
  } = usePrototypeState();

  const restaurant = useMemo(
    () =>
      adminRestaurants.find((entry) => entry.id === params.id) ??
      adminRestaurants[0],
    [adminRestaurants, params.id],
  );

  const menuSections = useMemo(
    () => menuByRestaurantId[restaurant.id] ?? [],
    [restaurant.id],
  );
  const menuItems = useMemo(
    () => menuSections.flatMap((section) => section.items),
    [menuSections],
  );

  if (!restaurant) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>MENU CONTROLS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.hero}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.detail}>
            {restaurant.cuisine} · {restaurant.manager} · Avg prep{" "}
            {restaurant.avgPrepTime}
          </Text>
          <Pressable
            style={styles.partnerButton}
            onPress={() => {
              beginRestaurantSession(restaurant.id);
              router.push("/restaurant-dashboard");
            }}
          >
            <Text style={styles.partnerButtonText}>Open Partner View</Text>
          </Pressable>
          {restaurant.status === "Needs Approval" ? (
            <Pressable
              style={styles.approveButton}
              onPress={() => approveRestaurant(restaurant.id)}
            >
              <Text style={styles.approveButtonText}>Approve Restaurant</Text>
            </Pressable>
          ) : null}
        </FadeInView>

        <FadeInView delay={130} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu controls</Text>
            <Text style={styles.sectionHint}>
              Toggle availability for the live menu shown to customers
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={170} style={styles.section}>
          <Text style={styles.sectionTitle}>Menu items</Text>
          {menuSections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.menuGroup}>
              <Text style={styles.menuGroupTitle}>{section.title}</Text>
              {section.items.map((item, index) => {
                const isEnabled = item.available ?? true;
                return (
                  <FadeInView
                    key={item.id}
                    delay={210 + sectionIndex * 40 + index * 25}
                    style={styles.menuCard}
                  >
                    <View style={styles.menuCopy}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetail}>
                        {item.price} {item.popular ? "· Popular pick" : ""}
                      </Text>
                    </View>
                    <Pressable
                      style={[styles.toggle, isEnabled && styles.toggleActive]}
                      onPress={() =>
                        toggleAdminMenuItemAvailability(restaurant.id, item.id)
                      }
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          isEnabled && styles.toggleTextActive,
                        ]}
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </Text>
                    </Pressable>
                  </FadeInView>
                );
              })}
            </View>
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  headerSpacer: { width: 40 },
  hero: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 8,
  },
  name: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.white,
  },
  detail: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.86)",
  },
  partnerButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  partnerButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.white,
  },
  approveButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  approveButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  sectionHint: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  menuGroup: {
    gap: 10,
  },
  menuSummary: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  menuGroupTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
    marginTop: 4,
  },
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
  menuCopy: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  itemDetail: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  controlStack: {
    gap: 8,
  },
  toggle: {
    minWidth: 110,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  toggleActive: { backgroundColor: "#ECFDF3" },
  toggleText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  toggleTextActive: { color: colors.success },
  secondaryAction: {
    minWidth: 110,
    minHeight: 36,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.primary,
  },
  secondaryActionDanger: {
    minWidth: 110,
    minHeight: 36,
    borderRadius: 14,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  secondaryActionDangerText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.danger,
  },
});
