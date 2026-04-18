import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

function getMenuSummary(restaurantId: string) {
  return menuByRestaurantId[restaurantId] ?? [];
}

function formatItemCount(menuItems: { items: { id: string }[] }[]) {
  return menuItems.reduce((count, section) => count + section.items.length, 0);
}

export default function AdminRestaurantsScreen() {
  const { adminRestaurants, approveRestaurant } = usePrototypeState();

  const restaurantsWithMenu = useMemo(
    () =>
      adminRestaurants.map((restaurant) => {
        const menuSections = getMenuSummary(restaurant.id);
        return {
          ...restaurant,
          menuSections,
          menuItemCount: formatItemCount(menuSections),
        };
      }),
    [adminRestaurants],
  );

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
          <Text style={styles.headerTitle}>RESTAURANTS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        {restaurantsWithMenu.map((restaurant, index) => (
          <FadeInView
            key={restaurant.id}
            delay={90 + index * 50}
            style={styles.restaurantCard}
          >
            <View style={styles.cardTop}>
              <View style={styles.copy}>
                <Text style={styles.name}>{restaurant.name}</Text>
                <Text style={styles.detail}>
                  {restaurant.cuisine} · Prep {restaurant.avgPrepTime} ·{" "}
                  {restaurant.manager}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{restaurant.status}</Text>
              </View>
            </View>

            <Text style={styles.menuCount}>
              {restaurant.menuItemCount} menu items synced from the customer
              menu
            </Text>

            <View style={styles.menuPreviewWrap}>
              {restaurant.menuSections.length > 0 ? (
                restaurant.menuSections.map((section) => (
                  <View key={section.id} style={styles.menuPreviewSection}>
                    <Text style={styles.menuPreviewTitle}>{section.title}</Text>
                    <View style={styles.menuPreviewItems}>
                      {section.items.map((item) => (
                        <View key={item.id} style={styles.menuPreviewItem}>
                          <Text style={styles.menuPreviewItemName}>
                            {item.name}
                          </Text>
                          <Text style={styles.menuPreviewItemMeta}>
                            {item.price}
                            {item.popular ? " · Popular" : ""}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.menuCount}>
                  No synced menu items found.
                </Text>
              )}
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  router.push(`/admin-restaurant?id=${restaurant.id}`)
                }
              >
                <Text style={styles.secondaryButtonText}>Manage Menu</Text>
              </Pressable>
              {restaurant.status === "Needs Approval" ? (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => approveRestaurant(restaurant.id)}
                >
                  <Text style={styles.primaryButtonText}>Approve</Text>
                </Pressable>
              ) : null}
            </View>
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
  restaurantCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  copy: { flex: 1, gap: 4 },
  name: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  detail: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surfaceDeep,
  },
  menuCount: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
  },
  menuPreviewWrap: {
    gap: 10,
  },
  menuPreviewSection: {
    gap: 6,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuPreviewTitle: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  menuPreviewItems: {
    gap: 8,
  },
  menuPreviewItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuPreviewItemName: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  menuPreviewItemMeta: {
    marginTop: 2,
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  buttonRow: { flexDirection: "row", gap: 10 },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  primaryButton: {
    minWidth: 100,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
});
