import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FadeInView from "./FadeInView";
import { useAppState } from "./appState";
import { colors, spacing, typography } from "./theme";

const prepOptions = ["12 min", "16 min", "20 min", "25 min", "30 min"];

export default function RestaurantMenuControlsScreen() {
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftCategory, setDraftCategory] = useState("New & featured");
  const [draftDescription, setDraftDescription] = useState("");
  const {
    addRestaurantMenuItem,
    adminRestaurants,
    getRestaurantMenuSections,
    removeRestaurantMenuItem,
    selectedPartnerRestaurantId,
    setSelectedPartnerRestaurant,
    toggleAdminMenuItemAvailability,
    toggleRestaurantMenuItemFeatured,
    updateRestaurantPrepTime,
  } = useAppState();

  const restaurant = useMemo(
    () =>
      adminRestaurants.find((entry) => entry.id === selectedPartnerRestaurantId) ??
      adminRestaurants[0],
    [adminRestaurants, selectedPartnerRestaurantId],
  );
  const liveMenuSections = useMemo(
    () => (restaurant ? getRestaurantMenuSections(restaurant.id) : []),
    [getRestaurantMenuSections, restaurant],
  );
  const liveMenuItems = useMemo(
    () => liveMenuSections.flatMap((section) => section.items),
    [liveMenuSections],
  );
  const canAddItem = draftName.trim().length > 0 && draftPrice.trim().length > 0;

  const handleBack = () => {
    router.replace("/restaurant-dashboard");
  };

  const handleAddItem = async () => {
    if (!restaurant || !canAddItem) {
      return;
    }

    await addRestaurantMenuItem(restaurant.id, {
      name: draftName,
      price: draftPrice,
      category: draftCategory,
      description: draftDescription,
    });
    setDraftName("");
    setDraftPrice("");
    setDraftDescription("");
    setDraftCategory("New & featured");
  };

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No restaurant selected</Text>
          <Text style={styles.emptyCopy}>
            Open the restaurant dashboard first to choose a partner location.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const pausedCount = liveMenuItems.filter((item) => !item.available).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={40} style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={handleBack}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>MENU CONTROLS</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.hero}>
          <Text style={styles.eyebrow}>Live partner menu</Text>
          <Text style={styles.title}>{restaurant.name}</Text>
          <Text style={styles.subtitle}>
            Update prep timing and pause items that are unavailable during a rush.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{restaurant.avgPrepTime}</Text>
              <Text style={styles.statLabel}>Prep time</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue}>{pausedCount}</Text>
              <Text style={styles.statLabel}>Paused</Text>
            </View>
          </View>
        </FadeInView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorRow}
        >
          {adminRestaurants.map((entry) => {
            const active = entry.id === restaurant.id;
            return (
              <Pressable
                key={entry.id}
                style={[styles.selectorChip, active && styles.selectorChipActive]}
                onPress={() => setSelectedPartnerRestaurant(entry.id)}
              >
                <Text style={[styles.selectorText, active && styles.selectorTextActive]}>
                  {entry.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FadeInView delay={130} style={styles.card}>
          <Text style={styles.cardTitle}>Prep time</Text>
          <Text style={styles.cardCopy}>
            This updates the ETA shown across manager and restaurant screens.
          </Text>
          <View style={styles.prepGrid}>
            {prepOptions.map((option) => {
              const active = option === restaurant.avgPrepTime;
              return (
                <Pressable
                  key={option}
                  style={[styles.prepChip, active && styles.prepChipActive]}
                  onPress={() => updateRestaurantPrepTime(restaurant.id, option)}
                >
                  <Text style={[styles.prepText, active && styles.prepTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FadeInView>

        <FadeInView delay={180} style={styles.card}>
          <Text style={styles.cardTitle}>Add menu item</Text>
          <Text style={styles.cardCopy}>
            New items appear on the customer menu immediately with a New badge.
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Item name</Text>
            <TextInput
              placeholder="French Fries"
              placeholderTextColor="rgba(31, 42, 31, 0.42)"
              value={draftName}
              onChangeText={setDraftName}
              style={styles.input}
            />
          </View>
          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Price</Text>
              <TextInput
                placeholder="4.99"
                placeholderTextColor="rgba(31, 42, 31, 0.42)"
                value={draftPrice}
                onChangeText={setDraftPrice}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.inputLabel}>Section</Text>
              <TextInput
                placeholder="Sides"
                placeholderTextColor="rgba(31, 42, 31, 0.42)"
                value={draftCategory}
                onChangeText={setDraftCategory}
                style={styles.input}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Short description</Text>
            <TextInput
              placeholder="Crispy fries with sea salt and house sauce."
              placeholderTextColor="rgba(31, 42, 31, 0.42)"
              value={draftDescription}
              onChangeText={setDraftDescription}
              multiline
              style={[styles.input, styles.descriptionInput]}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add menu item"
            style={({ pressed }) => [
              styles.addItemButton,
              !canAddItem && styles.addItemButtonDisabled,
              pressed && canAddItem && styles.buttonPressed,
            ]}
            disabled={!canAddItem}
            onPress={handleAddItem}
          >
            <Feather name="plus" size={16} color={colors.background} />
            <Text style={styles.addItemButtonText}>Add Item</Text>
          </Pressable>
        </FadeInView>

        <FadeInView delay={220} style={styles.card}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.cardTitle}>Availability</Text>
              <Text style={styles.cardCopy}>
                Toggle items, feature specials, or hide retired listings.
              </Text>
            </View>
          </View>

          <View style={styles.menuList}>
            {liveMenuSections.map((section, sectionIndex) => (
              <View key={section.id} style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>{section.title}</Text>
                {section.items.map((item, index) => {
                  const available = item.available;
                  return (
                    <FadeInView
                      key={item.id}
                      delay={260 + sectionIndex * 35 + index * 25}
                      style={styles.menuItem}
                    >
                      <View style={styles.itemCopy}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          {item.isNew ? (
                            <View style={styles.newBadge}>
                              <Text style={styles.newBadgeText}>New</Text>
                            </View>
                          ) : null}
                          {item.popular ? (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularBadgeText}>Featured</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.itemMeta}>
                          {item.price} - {available ? "Listed for customers" : "Hidden from customers"}
                        </Text>
                        <Text style={styles.itemDescription}>{item.description}</Text>
                      </View>
                      <View style={styles.itemActions}>
                        <Pressable
                          accessibilityRole="button"
                          style={[
                            styles.toggleButton,
                            available && styles.toggleButtonActive,
                          ]}
                          onPress={() =>
                            toggleAdminMenuItemAvailability(restaurant.id, item.id)
                          }
                        >
                          <Text
                            style={[
                              styles.toggleText,
                              available && styles.toggleTextActive,
                            ]}
                          >
                            {available ? "Available" : "Paused"}
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          style={styles.smallAction}
                          onPress={() =>
                            toggleRestaurantMenuItemFeatured(restaurant.id, item.id)
                          }
                        >
                          <Text style={styles.smallActionText}>
                            {item.popular ? "Unfeature" : "Feature"}
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          style={styles.smallDangerAction}
                          onPress={() => removeRestaurantMenuItem(restaurant.id, item.id)}
                        >
                          <Text style={styles.smallDangerActionText}>
                            {item.isNew ? "Remove" : "Hide"}
                          </Text>
                        </Pressable>
                      </View>
                    </FadeInView>
                  );
                })}
              </View>
            ))}
          </View>
        </FadeInView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primary,
  },
  emptyCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
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
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  headerSpacer: { width: 40 },
  hero: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 10,
  },
  eyebrow: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
  },
  title: {
    fontFamily: typography.display,
    fontSize: 30,
    color: colors.white,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.88)",
  },
  heroStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  statPill: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    padding: 12,
    gap: 4,
  },
  statValue: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.white,
  },
  statLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.78)",
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
  selectorChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  selectorTextActive: { color: colors.background },
  card: {
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  cardCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 4,
  },
  inputGroup: {
    gap: 7,
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 7,
  },
  inputLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 14,
  },
  descriptionInput: {
    minHeight: 78,
    paddingTop: 13,
    textAlignVertical: "top",
  },
  addItemButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  addItemButtonDisabled: {
    opacity: 0.45,
  },
  addItemButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
  prepGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  prepChip: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  prepChipActive: { backgroundColor: colors.surface },
  prepText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  prepTextActive: { color: colors.background },
  menuList: { gap: 16 },
  menuSection: { gap: 10 },
  menuSectionTitle: {
    fontFamily: typography.display,
    fontSize: 17,
    color: colors.primary,
  },
  menuItem: {
    minHeight: 96,
    borderRadius: 18,
    backgroundColor: colors.background,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  itemCopy: { flex: 1, gap: 4 },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  itemName: {
    fontFamily: typography.display,
    fontSize: 17,
    color: colors.primary,
  },
  itemMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  itemDescription: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text,
  },
  newBadge: {
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newBadgeText: {
    fontFamily: typography.display,
    fontSize: 10,
    color: colors.success,
  },
  popularBadge: {
    borderRadius: 999,
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularBadgeText: {
    fontFamily: typography.display,
    fontSize: 10,
    color: colors.warning,
  },
  itemActions: {
    width: 104,
    gap: 8,
  },
  toggleButton: {
    minWidth: 96,
    minHeight: 38,
    borderRadius: 14,
    backgroundColor: "#FFF4E6",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  toggleButtonActive: { backgroundColor: "#ECFDF3" },
  toggleText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.warning,
  },
  toggleTextActive: { color: colors.success },
  smallAction: {
    minHeight: 34,
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  smallActionText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.primary,
  },
  smallDangerAction: {
    minHeight: 34,
    borderRadius: 13,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  smallDangerActionText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.danger,
  },
});
