import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import StaffAccessGate from "./StaffAccessGate";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import {
  getSafeHeaderTopPadding,
  safeHeaderButtonSize,
} from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

type EditableMenuItem = {
  id: string;
  name: string;
  price: string;
  available?: boolean;
  popular?: boolean;
  isNew?: boolean;
};

function MenuItemRow({
  delay,
  item,
  restaurantId,
  onToggleAvailability,
  onSavePrice,
}: {
  delay: number;
  item: EditableMenuItem;
  restaurantId: string;
  onToggleAvailability: (restaurantId: string, itemId: string) => void;
  onSavePrice: (restaurantId: string, itemId: string, price: string) => void;
}) {
  const [priceDraft, setPriceDraft] = useState(item.price);

  useEffect(() => {
    setPriceDraft(item.price);
  }, [item.price]);

  const isEnabled = item.available ?? true;

  return (
    <FadeInView delay={delay} style={styles.menuCard}>
      <View style={styles.menuCopy}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetail}>
          {item.popular ? "Popular pick - " : ""}
          Current price: {item.price}
          {item.isNew ? " - New" : ""}
        </Text>

        <View style={styles.priceEditorRow}>
          <TextInput
            value={priceDraft}
            onChangeText={setPriceDraft}
            placeholder="$0.00"
            placeholderTextColor="rgba(15,23,42,0.35)"
            keyboardType="decimal-pad"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.priceInput}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Save ${item.name} price`}
            style={({ pressed }) => [styles.savePriceButton, pressed && styles.buttonPressed]}
            onPress={() => onSavePrice(restaurantId, item.id, priceDraft)}
          >
            <Text style={styles.savePriceButtonText}>Save Price</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${isEnabled ? "Disable" : "Enable"} ${item.name}`}
        style={[
          styles.toggle,
          isEnabled ? styles.toggleDisableState : styles.toggleEnableState,
        ]}
        onPress={() => onToggleAvailability(restaurantId, item.id)}
      >
        <Text
          style={[
            styles.toggleText,
            isEnabled ? styles.toggleTextDisableState : styles.toggleTextEnableState,
          ]}
        >
          {isEnabled ? "Disable" : "Enable"}
        </Text>
      </Pressable>
    </FadeInView>
  );
}

export default function AdminRestaurantDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const params = useLocalSearchParams<{ id?: string }>();
  const {
    adminRestaurants,
    approveRestaurant,
    beginRestaurantSession,
    getRestaurantMenuSections,
    toggleAdminMenuItemAvailability,
    updateAdminMenuItemPrice,
  } = useAppState();

  const restaurant = useMemo(
    () => adminRestaurants.find((entry) => entry.id === params.id),
    [adminRestaurants, params.id],
  );

  const menuSections = useMemo(
    () => (restaurant ? getRestaurantMenuSections(restaurant.id) : []),
    [getRestaurantMenuSections, restaurant],
  );
  const menuItemCount = useMemo(
    () => menuSections.reduce((total, section) => total + section.items.length, 0),
    [menuSections],
  );

  if (!restaurant) {
    return (
      <StaffAccessGate role="admin">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Restaurant not found</Text>
            <Text style={styles.emptyCopy}>
              Choose a valid partner from the restaurant list before editing menu controls.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to restaurants"
              style={styles.emptyButton}
              onPress={() => goBackOrReplace("/admin-restaurants")}
            >
              <Text style={styles.emptyButtonText}>Back to Restaurants</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </StaffAccessGate>
    );
  }

  return (
    <StaffAccessGate role="admin">
      <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerTopPadding },
        ]}
      >
        <FadeInView delay={40} style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to restaurants"
            hitSlop={16}
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={() => goBackOrReplace("/admin-restaurants")}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>PARTNER REVIEW</Text>
          <View style={styles.headerSpacer} />
        </FadeInView>

        <FadeInView delay={90} style={styles.hero}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.detail}>
            {restaurant.cuisine} - {restaurant.manager} - Avg prep {restaurant.avgPrepTime}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.partnerButton, pressed && styles.buttonPressed]}
            onPress={() => {
              beginRestaurantSession(restaurant.id);
              router.push("/restaurant-dashboard");
            }}
          >
            <Text style={styles.partnerButtonText}>Open Partner View</Text>
          </Pressable>
          {restaurant.status === "Needs Approval" ? (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.approveButton, pressed && styles.buttonPressed]}
              onPress={() => approveRestaurant(restaurant.id)}
            >
              <Text style={styles.approveButtonText}>Approve Restaurant</Text>
            </Pressable>
          ) : null}
        </FadeInView>

        <FadeInView delay={130} style={styles.section}>
          <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Admin menu audit</Text>
            <Text style={styles.sectionHint}>
              Toggle availability or update pricing for {menuItemCount} live menu item
              {menuItemCount === 1 ? "" : "s"} shown to customers
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={170} style={styles.section}>
          <Text style={styles.sectionTitle}>Menu items</Text>
          {menuSections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.menuGroup}>
              <Text style={styles.menuGroupTitle}>{section.title}</Text>
              {section.items.map((item, index) => (
                <MenuItemRow
                  key={item.id}
                  delay={210 + sectionIndex * 40 + index * 25}
                  restaurantId={restaurant.id}
                  item={item}
                  onToggleAvailability={toggleAdminMenuItemAvailability}
                  onSavePrice={updateAdminMenuItemPrice}
                />
              ))}
            </View>
          ))}
        </FadeInView>
      </ScrollView>
      </SafeAreaView>
    </StaffAccessGate>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.primary,
    textAlign: "center",
  },
  emptyCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
  },
  emptyButton: {
    minWidth: 180,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: safeHeaderButtonSize,
    height: safeHeaderButtonSize,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  headerSpacer: { width: safeHeaderButtonSize },
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
    gap: 8,
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
  priceEditorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  priceInput: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.primary,
  },
  savePriceButton: {
    minWidth: 96,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  savePriceButtonText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  toggle: {
    minWidth: 110,
    minHeight: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  toggleDisableState: {
    backgroundColor: "#ECFDF3",
    borderColor: "#BBF7D0",
  },
  toggleEnableState: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FECACA",
  },
  toggleText: {
    fontFamily: typography.display,
    fontSize: 13,
  },
  toggleTextDisableState: { color: colors.success },
  toggleTextEnableState: { color: colors.danger },
});
