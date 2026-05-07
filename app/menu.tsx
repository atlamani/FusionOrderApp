import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import { checkoutPricing } from "./appData";
import {
  formatCurrency,
  getCartItemCount,
  getCartSubtotal,
  useAppState,
} from "./appState";
import { goBackOrReplace } from "./navigation";
import { getSafeHeaderTopPadding } from "./safeHeaderLayout";
import { useAddToCart } from "./services/useAddToCart";
import {
  BROWSE_ONLY_EXPLANATION,
  isOrderableRestaurant,
} from "./services/restaurantOrdering";
import { colors, spacing, typography } from "./theme";

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const {
    cartItems,
    decreaseMenuItem,
    favoriteIds,
    getRestaurantMenuSections,
    restaurants,
    selectedRestaurantId,
    setSelectedRestaurant,
    toggleFavorite,
  } = useAppState();
  const addToCart = useAddToCart();

  const restaurant = useMemo(
    () =>
      restaurants.find((entry) => entry.id === selectedRestaurantId) ??
      restaurants[0],
    [restaurants, selectedRestaurantId],
  );
  const restaurantCartItems = useMemo(
    () => cartItems.filter((item) => item.restaurantId === restaurant.id),
    [cartItems, restaurant.id],
  );
  const restaurantCartCount = getCartItemCount(restaurantCartItems);
  const cartTotal =
    cartItems.length > 0
      ? getCartSubtotal(cartItems) + checkoutPricing.deliveryFee
      : 0;
  const isFavorite = favoriteIds.includes(restaurant.id);
  const orderable = isOrderableRestaurant(restaurant);
  const restaurantMenuSections = useMemo(
    () =>
      getRestaurantMenuSections(restaurant.id)
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => item.available),
        }))
        .filter((section) => section.items.length > 0),
    [getRestaurantMenuSections, restaurant.id],
  );
  const liveHighlights = useMemo(
    () =>
      restaurantMenuSections
        .flatMap((section) => section.items)
        .filter((item) => item.popular || item.isNew)
        .slice(0, 4),
    [restaurantMenuSections],
  );
  const recommendation =
    restaurants.find((entry) => entry.id !== restaurant.id) ?? restaurant;

  const getQuantity = (itemId: string) =>
    restaurantCartItems.find((item) => item.id === itemId)?.quantity ?? 0;

  const handleBack = () => {
    goBackOrReplace("/home");
  };

  return (
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
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={16}
            style={styles.backButton}
            onPress={handleBack}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>MENU</Text>
          <Pressable
            accessibilityLabel={
              isFavorite ? "Remove restaurant from favorites" : "Save restaurant to favorites"
            }
            accessibilityRole="button"
            hitSlop={16}
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={() => toggleFavorite(restaurant.id)}
          >
            <Feather
              name="heart"
              size={16}
              color={isFavorite ? colors.white : colors.background}
              fill={isFavorite ? colors.white : "transparent"}
            />
          </Pressable>
        </FadeInView>

        <FadeInView delay={100} style={styles.heroCard}>
          <Image source={restaurant.image} style={styles.heroImage} />
          <View style={styles.heroBody}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantMeta}>
              {restaurant.rating}/5 ({restaurant.reviewCount} reviews) |{" "}
              {restaurant.distance} | {restaurant.eta}
            </Text>
            <Text style={styles.restaurantCopy}>{restaurant.description}</Text>
            <View style={styles.tagWrap}>
              {restaurant.dietaryTags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeInView>

        {!orderable ? (
          <FadeInView delay={130} style={styles.browseOnlyBanner}>
            <View style={styles.browseOnlyIcon}>
              <Feather name="info" size={16} color={colors.background} />
            </View>
            <View style={styles.browseOnlyCopy}>
              <Text style={styles.browseOnlyTitle}>View only</Text>
              <Text style={styles.browseOnlyText}>
                {BROWSE_ONLY_EXPLANATION}
              </Text>
            </View>
          </FadeInView>
        ) : null}

        <FadeInView delay={150} style={styles.card}>
          <Text style={styles.cardTitle}>Popular here</Text>
          <View style={styles.popularList}>
            {(liveHighlights.length > 0
              ? liveHighlights.map((item) => item.name)
              : restaurant.popularDishes
            ).map((dish) => (
              <View key={dish} style={styles.popularDish}>
                <Feather name="star" size={14} color={colors.surface} />
                <Text style={styles.popularDishText}>{dish}</Text>
              </View>
            ))}
          </View>
        </FadeInView>

        {restaurantMenuSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => {
              const itemQuantity = getQuantity(item.id);

              return (
                <View key={item.id} style={styles.menuItem}>
                  <View style={styles.menuCopy}>
                    <View style={styles.menuTitleRow}>
                      <Text style={styles.menuTitle}>{item.name}</Text>
                      {item.popular ? (
                        <View style={styles.popularTag}>
                          <Text style={styles.popularText}>Popular</Text>
                        </View>
                      ) : null}
                      {item.isNew ? (
                        <View style={styles.newTag}>
                          <Text style={styles.newText}>New</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.menuDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.menuPrice}>{item.price}</Text>
                  </View>

                  {!orderable ? (
                    <View style={styles.viewOnlyPill}>
                      <Text style={styles.viewOnlyPillText}>View only</Text>
                    </View>
                  ) : itemQuantity > 0 ? (
                    <View style={styles.stepper}>
                      <Pressable
                        style={styles.stepperButton}
                        onPress={() => decreaseMenuItem(item.id)}
                      >
                        <Feather
                          name="minus"
                          size={14}
                          color={colors.background}
                        />
                      </Pressable>
                      <Text style={styles.stepperValue}>{itemQuantity}</Text>
                      <Pressable
                        style={styles.stepperButton}
                        onPress={() =>
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            restaurantId: restaurant.id,
                            restaurantName: restaurant.name,
                          })
                        }
                      >
                        <Feather
                          name="plus"
                          size={14}
                          color={colors.background}
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.addButton}
                      onPress={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          restaurantId: restaurant.id,
                          restaurantName: restaurant.name,
                        })
                      }
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <FadeInView delay={250} style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Recent reviews</Text>
            <Pressable
              style={styles.inlineAction}
              onPress={() => router.push("/search")}
            >
              <Text style={styles.inlineActionText}>Search more</Text>
            </Pressable>
          </View>
          <View style={styles.reviewList}>
            {restaurant.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <Text style={styles.reviewMeta}>
                    {review.rating}/5 | {review.date}
                  </Text>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={300} style={styles.card}>
          <Text style={styles.cardTitle}>You might also like</Text>
          <Pressable
            accessibilityLabel={`Open ${recommendation.name} menu`}
            accessibilityRole="button"
            style={styles.recommendationRow}
            onPress={() => {
              setSelectedRestaurant(recommendation.id);
              router.push({
                pathname: "/restaurant-menu",
                params: { restaurantId: recommendation.id },
              });
            }}
          >
            <View style={styles.recommendationCopy}>
              <Text style={styles.recommendationName}>
                {recommendation.name}
              </Text>
              <Text style={styles.recommendationMeta}>
                {recommendation.cuisine} | {recommendation.distance} |{" "}
                {recommendation.price}
              </Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </Pressable>
        </FadeInView>

        <Pressable
          style={styles.checkoutButton}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutButtonText}>
            {cartItems.length > 0
              ? `View Cart | ${restaurantCartCount} item${restaurantCartCount === 1 ? "" : "s"} here | ${formatCurrency(cartTotal)}`
              : `Cart Empty | ${formatCurrency(0)}`}
          </Text>
        </Pressable>
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
    paddingBottom: 40,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  favoriteButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonActive: {
    backgroundColor: colors.surfaceDeep,
  },
  heroCard: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroImage: {
    width: "100%",
    height: 180,
  },
  heroBody: {
    padding: 16,
    gap: 8,
  },
  restaurantName: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.primary,
  },
  restaurantMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  restaurantCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  tagPillText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.primary,
  },
  card: {
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  popularList: {
    gap: 10,
  },
  popularDish: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  popularDishText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  menuItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  menuCopy: {
    flex: 1,
    gap: 4,
  },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  menuTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  popularTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  popularText: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.primary,
  },
  newTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
  },
  newText: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.success,
  },
  menuDescription: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  menuPrice: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.surfaceDeep,
  },
  addButton: {
    minWidth: 66,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  addButtonText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  viewOnlyPill: {
    minWidth: 76,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  viewOnlyPillText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  browseOnlyBanner: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFF4E6",
    borderWidth: 1,
    borderColor: "#F5D7A4",
  },
  browseOnlyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.warning,
    justifyContent: "center",
    alignItems: "center",
  },
  browseOnlyCopy: { flex: 1, gap: 2 },
  browseOnlyTitle: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.warning,
    letterSpacing: 0.5,
  },
  browseOnlyText: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text,
  },
  stepper: {
    minWidth: 104,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  stepperButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperValue: {
    minWidth: 24,
    textAlign: "center",
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inlineAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  inlineActionText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.primary,
  },
  reviewList: {
    gap: 10,
  },
  reviewCard: {
    borderRadius: 14,
    backgroundColor: colors.background,
    padding: 12,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  reviewAuthor: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.primary,
  },
  reviewMeta: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  reviewText: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text,
  },
  recommendationRow: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  recommendationCopy: {
    flex: 1,
    gap: 4,
  },
  recommendationName: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  recommendationMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  checkoutButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  checkoutButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
    textAlign: "center",
  },
});
