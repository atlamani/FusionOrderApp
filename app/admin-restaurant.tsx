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
import FadeInView from "./FadeInView";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

function MenuItemRow({
  restaurantId,
  item,
  index,
  onToggleAvailability,
  onSavePrice,
}: {
  restaurantId: string;
  item: {
    id: string;
    name: string;
    price: string;
    available?: boolean;
    popular?: boolean;
  };
  index: number;
  onToggleAvailability: (restaurantId: string, itemId: string) => void;
  onSavePrice: (restaurantId: string, itemId: string, price: string) => void;
}) {
  const [priceDraft, setPriceDraft] = useState(item.price);

  useEffect(() => {
    setPriceDraft(item.price);
  }, [item.price]);

  const isEnabled = item.available ?? true;

  return (
    <FadeInView delay={210 + index * 25} style={styles.menuCard}>
      <View style={styles.menuCopy}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetail}>
          {item.popular ? "Popular pick · " : ""}
          Current price: {item.price}
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
            style={styles.savePriceButton}
            onPress={() => onSavePrice(restaurantId, item.id, priceDraft)}
          >
            <Text style={styles.savePriceButtonText}>Save Price</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[
          styles.toggle,
          isEnabled ? styles.toggleDisableState : styles.toggleEnableState,
        ]}
        onPress={() => onToggleAvailability(restaurantId, item.id)}
      >
        <Text
          style={[
            styles.toggleText,
            isEnabled
              ? styles.toggleTextDisableState
              : styles.toggleTextEnableState,
          ]}
        >
          {isEnabled ? "Disable" : "Enable"}
        </Text>
      </Pressable>
    </FadeInView>
  );
}

export default function AdminRestaurantDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const {
    adminRestaurants,
    approveRestaurant,
    beginRestaurantSession,
    toggleAdminMenuItemAvailability,
    updateAdminMenuItemPrice,
  } = usePrototypeState();

  const restaurant = useMemo(
    () =>
      adminRestaurants.find((entry) => entry.id === params.id) ??
      adminRestaurants[0],
    [adminRestaurants, params.id],
  );

  const menuItems = useMemo(
    () => restaurant.menuItems ?? [],
    [restaurant.menuItems],
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
              Toggle availability or update pricing for the live menu shown to
              customers
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={170} style={styles.section}>
          <Text style={styles.sectionTitle}>Menu items</Text>
          {menuItems.map((item, index) => (
            <MenuItemRow
              key={item.id}
              restaurantId={restaurant.id}
              item={item}
              index={index}
              onToggleAvailability={toggleAdminMenuItemAvailability}
              onSavePrice={updateAdminMenuItemPrice}
            />
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
