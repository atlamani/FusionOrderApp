import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInView from "./FadeInView";
import {
  type OrderReview,
  subscribeToRestaurantReviews,
} from "./Firebase/reviews";
import type { RestaurantReview } from "./appData";
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
import { colors, spacing, typography } from "./theme";

function formatReviewDate(value: OrderReview["createdAt"]): string {
  let ms = 0;
  if (!value) return "Just now";
  if (value instanceof Date) ms = value.getTime();
  else if (typeof value === "number") ms = value;
  else if (typeof value === "string") {
    const parsed = Date.parse(value);
    ms = Number.isFinite(parsed) ? parsed : 0;
  } else {
    const stamp = value as { toMillis?: () => number; toDate?: () => Date };
    if (typeof stamp.toMillis === "function") ms = stamp.toMillis();
    else if (typeof stamp.toDate === "function") ms = stamp.toDate().getTime();
  }
  if (!ms) return "Just now";

  const diffMs = Date.now() - ms;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(ms).toLocaleDateString();
}

export default function RestaurantMenuScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const { restaurantId } = useLocalSearchParams<{ restaurantId?: string }>();

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
      restaurants.find((entry) => entry.id === restaurantId) ??
      (restaurantId
        ? undefined
        : restaurants.find((entry) => entry.id === selectedRestaurantId) ??
          restaurants[0]),
    [restaurantId, restaurants, selectedRestaurantId],
  );

  const restaurantCartItems = useMemo(
    () =>
      restaurant
        ? cartItems.filter((item) => item.restaurantId === restaurant.id)
        : [],
    [cartItems, restaurant],
  );
  const restaurantCartCount = getCartItemCount(restaurantCartItems);
  const cartTotal =
    cartItems.length > 0
      ? getCartSubtotal(cartItems) + checkoutPricing.deliveryFee
      : 0;
  const isFavorite = restaurant ? favoriteIds.includes(restaurant.id) : false;
  const restaurantMenuSections = useMemo(
    () =>
      restaurant
        ? getRestaurantMenuSections(restaurant.id)
            .map((section) => ({
              ...section,
              items: section.items.filter((item) => item.available),
            }))
            .filter((section) => section.items.length > 0)
        : [],
    [getRestaurantMenuSections, restaurant],
  );
  const liveHighlights = useMemo(
    () =>
      restaurantMenuSections
        .flatMap((section) => section.items)
        .filter((item) => item.popular || item.isNew)
        .slice(0, 4),
    [restaurantMenuSections],
  );
  const recommendation = restaurant
    ? restaurants.find((entry) => entry.id !== restaurant.id) ?? restaurant
    : undefined;

  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [liveReviews, setLiveReviews] = useState<OrderReview[]>([]);

  useEffect(() => {
    if (!restaurant?.id) return undefined;
    const unsubscribe = subscribeToRestaurantReviews(
      restaurant.id,
      setLiveReviews,
      () => setLiveReviews([]),
    );
    return () => {
      unsubscribe();
      setLiveReviews([]);
    };
  }, [restaurant?.id]);

  const displayReviews = useMemo<RestaurantReview[]>(() => {
    if (!restaurant) return [];
    const liveAsRestaurantReviews: RestaurantReview[] = liveReviews.map(
      (review) => ({
        id: review.id,
        author: review.customerName,
        rating: review.rating,
        date: formatReviewDate(review.createdAt),
        text: review.text,
      }),
    );
    return [...liveAsRestaurantReviews, ...(restaurant.reviews ?? [])];
  }, [liveReviews, restaurant]);

  const hasInfoCard = Boolean(
    restaurant &&
      (restaurant.address ||
        restaurant.phone ||
        restaurant.websiteUri ||
        restaurant.openNow !== undefined ||
        (restaurant.hours && restaurant.hours.length > 0)),
  );

  const handleOpenMaps = () => {
    if (!restaurant) return;
    const target =
      restaurant.mapUri ||
      (restaurant.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            restaurant.address,
          )}`
        : null);
    if (target) {
      Linking.openURL(target).catch(() => undefined);
    }
  };

  const handleCall = () => {
    if (!restaurant?.phone) return;
    const sanitized = restaurant.phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${sanitized}`).catch(() => undefined);
  };

  const handleVisitWebsite = () => {
    if (!restaurant?.websiteUri) return;
    Linking.openURL(restaurant.websiteUri).catch(() => undefined);
  };

  const getQuantity = (itemId: string) =>
    restaurantCartItems.find((item) => item.id === itemId)?.quantity ?? 0;

  const handleBack = () => {
    goBackOrReplace("/home");
  };

  if (!restaurant || !recommendation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Restaurant not found</Text>
          <Text style={styles.emptyCopy}>
            This restaurant is no longer available in the current discovery list.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to search"
            style={styles.emptyButton}
            onPress={() => goBackOrReplace("/search")}
          >
            <Text style={styles.emptyButtonText}>Back to Search</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
            ]}
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

        {hasInfoCard ? (
          <FadeInView delay={130} style={styles.card}>
            <View style={styles.infoTitleRow}>
              <Text style={styles.cardTitle}>About this restaurant</Text>
              {restaurant.openNow !== undefined ? (
                <View
                  style={[
                    styles.statusPill,
                    restaurant.openNow
                      ? styles.statusPillOpen
                      : styles.statusPillClosed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      restaurant.openNow
                        ? styles.statusPillTextOpen
                        : styles.statusPillTextClosed,
                    ]}
                  >
                    {restaurant.openNow ? "Open now" : "Closed"}
                  </Text>
                </View>
              ) : null}
            </View>

            {restaurant.address ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View restaurant on Google Maps"
                style={styles.infoRow}
                onPress={handleOpenMaps}
              >
                <Feather name="map-pin" size={16} color={colors.surface} />
                <Text style={styles.infoText} numberOfLines={2}>
                  {restaurant.address}
                </Text>
                <Text style={styles.infoAction}>View on Maps</Text>
              </Pressable>
            ) : null}

            {restaurant.phone ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Call ${restaurant.name}`}
                style={styles.infoRow}
                onPress={handleCall}
              >
                <Feather name="phone" size={16} color={colors.surface} />
                <Text style={styles.infoText}>{restaurant.phone}</Text>
                <Text style={styles.infoAction}>Call</Text>
              </Pressable>
            ) : null}

            {restaurant.websiteUri ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Visit website for ${restaurant.name}`}
                style={styles.infoRow}
                onPress={handleVisitWebsite}
              >
                <Feather name="globe" size={16} color={colors.surface} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {restaurant.websiteUri.replace(/^https?:\/\//, "")}
                </Text>
                <Text style={styles.infoAction}>Visit</Text>
              </Pressable>
            ) : null}

            {restaurant.hours && restaurant.hours.length > 0 ? (
              <View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    hoursExpanded ? "Collapse hours" : "Show hours"
                  }
                  style={styles.infoRow}
                  onPress={() => setHoursExpanded((current) => !current)}
                >
                  <Feather name="clock" size={16} color={colors.surface} />
                  <Text style={styles.infoText}>Hours</Text>
                  <Feather
                    name={hoursExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
                {hoursExpanded ? (
                  <View style={styles.hoursList}>
                    {restaurant.hours.map((line) => (
                      <Text key={line} style={styles.hoursText}>
                        {line}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
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

                  {itemQuantity > 0 ? (
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
            {displayReviews.length === 0 ? (
              <Text style={styles.reviewEmptyText}>
                No reviews yet — be the first after your next order arrives.
              </Text>
            ) : (
              displayReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.author}</Text>
                    <Text style={styles.reviewMeta}>
                      {review.rating}/5 | {review.date}
                    </Text>
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                </View>
              ))
            )}
          </View>
        </FadeInView>

        <FadeInView delay={300} style={styles.card}>
          <Text style={styles.cardTitle}>You might also like</Text>
          <Pressable
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
    minWidth: 160,
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
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillOpen: {
    backgroundColor: "#ECFDF3",
  },
  statusPillClosed: {
    backgroundColor: "#FEF2F2",
  },
  statusPillText: {
    fontFamily: typography.display,
    fontSize: 11,
  },
  statusPillTextOpen: {
    color: colors.success,
  },
  statusPillTextClosed: {
    color: "#B42318",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  infoText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  infoAction: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surface,
  },
  hoursList: {
    paddingLeft: 26,
    paddingTop: 4,
    gap: 4,
  },
  hoursText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
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
  reviewEmptyText: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
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
