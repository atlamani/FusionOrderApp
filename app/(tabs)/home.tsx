import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FadeInView from "../FadeInView";
import {
  Restaurant,
  cuisineTags,
  recommendationMoments,
} from "../appData";
import { useAppState } from "../appState";
import { useRestaurants } from "../services/useRestaurants";
import { useUserLocation } from "../services/useUserLocation";
import { colors, spacing, typography } from "../theme";

function RestaurantCard({
  item,
  compact = false,
}: {
  item: Restaurant;
  compact?: boolean;
}) {
  const { favoriteIds, setSelectedRestaurant, toggleFavorite } =
    useAppState();
  const isFavorite = favoriteIds.includes(item.id);

  return (
    <Pressable
      style={[styles.restaurantCard, compact && styles.compactRestaurantCard]}
      onPress={() => {
        setSelectedRestaurant(item.id);
        router.push({
          pathname: "/restaurant-menu",
          params: { restaurantId: item.id },
        });
      }}
    >
      <View>
        <Image
          source={item.image}
          style={[styles.restaurantImage, compact && styles.compactImage]}
        />
        <Pressable
          accessibilityLabel={
            isFavorite ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`
          }
          accessibilityRole="button"
          accessibilityState={{ selected: isFavorite }}
          hitSlop={10}
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive,
          ]}
          onPress={() => toggleFavorite(item.id)}
        >
          <Feather
            name="heart"
            size={16}
            color={isFavorite ? colors.white : colors.surfaceDeep}
            fill={isFavorite ? colors.white : "transparent"}
          />
        </Pressable>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      </View>

      <View style={styles.restaurantContent}>
        <View style={styles.restaurantMeta}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantRating}>{item.rating}/5</Text>
        </View>
        <Text style={styles.restaurantCuisine}>
          {`${item.cuisine} · ${item.distance} · ${item.price}`}
        </Text>
        {!compact ? (
          <Text style={styles.restaurantDescription}>{item.description}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const {
    applyDiscoveryFilters,
    cartQuantity,
    discoveryFilters,
    favoriteIds,
    recentSearches,
    resetDiscoveryFilters,
    setSelectedRestaurant,
    submitSearch,
  } = useAppState();

  const {
    latitude: userLatitude,
    longitude: userLongitude,
  } = useUserLocation();

  const {
    restaurants,
    isLoading: isLoadingRestaurants,
    error: restaurantsError,
  } = useRestaurants({
    latitude: userLatitude ?? undefined,
    longitude: userLongitude ?? undefined,
  });

  const selectedCuisineLabel =
    cuisineTags.find((tag) => tag.id === discoveryFilters.cuisineId)?.label ??
    "All";

  const recommendedRestaurants = useMemo(
    () =>
      recommendationMoments[0]?.restaurantIds
        .map((restaurantId) =>
          restaurants.find((restaurant) => restaurant.id === restaurantId),
        )
        .filter((restaurant): restaurant is Restaurant =>
          Boolean(restaurant),
        ) ?? [],
    [restaurants],
  );

  const browseRestaurants = useMemo(() => {
    if (discoveryFilters.cuisineId === "all") {
      return restaurants.slice(0, 6);
    }

    const selectedCuisine = discoveryFilters.cuisineId.toLowerCase();

    return restaurants.filter(
      (restaurant) =>
        restaurant.cuisine.toLowerCase().includes(selectedCuisine) ||
        restaurant.dietaryTags.some((tag) =>
          tag.toLowerCase().includes(selectedCuisine),
        ) ||
        restaurant.popularDishes.some((dish) =>
          dish.toLowerCase().includes(selectedCuisine),
        ),
    );
  }, [discoveryFilters.cuisineId, restaurants]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={40} style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>FusionYum</Text>
            <Text style={styles.headerSubtitle}>
              {favoriteIds.length} favorites saved | {cartQuantity} item
              {cartQuantity === 1 ? "" : "s"} in cart
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Open activity history"
            accessibilityRole="button"
            hitSlop={10}
            style={styles.headerAction}
            onPress={() => router.push("/activity")}
          >
            <Feather name="clock" size={18} color={colors.background} />
          </Pressable>
        </FadeInView>

        <FadeInView delay={100} style={styles.searchShell}>
          <Pressable
            style={styles.searchBar}
            onPress={() => router.push("/search")}
          >
            <Feather name="search" size={18} color={colors.background} />
            <Text style={styles.searchPrompt}>
              Search restaurants, dishes, or cuisines
            </Text>
            <Feather name="sliders" size={16} color={colors.background} />
          </Pressable>
        </FadeInView>

        <FadeInView delay={140} style={styles.recentSearchCard}>
          <Text style={styles.sectionTitle}>Recent search energy</Text>
          <View style={styles.recentSearchList}>
            {recentSearches.slice(0, 3).map((term) => (
              <Pressable
                key={term}
                style={styles.recentSearchPill}
                onPress={() => {
                  submitSearch(term);
                  router.push("/search");
                }}
              >
                <Text style={styles.recentSearchText}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </FadeInView>

        <FlatList
          data={cuisineTags}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagList}
          renderItem={({ item }) => {
            const isActive = item.id === discoveryFilters.cuisineId;

            return (
              <Pressable
                accessibilityLabel={`Filter results by ${item.label}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                hitSlop={6}
                style={[styles.tagChip, isActive && styles.tagChipActive]}
                onPress={() => {
                  applyDiscoveryFilters({ cuisineId: item.id });
                  router.push("/search");
                }}
              >
                <Text
                  style={[styles.tagText, isActive && styles.tagTextActive]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />

        <FadeInView delay={180} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <Pressable
              accessibilityLabel="See all recommended restaurants"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push("/search")}
            >
              <Text style={styles.sectionLink}>See all</Text>
            </Pressable>
          </View>
          {isLoadingRestaurants ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.surface} />
              <Text style={styles.loadingRowText}>Loading restaurants...</Text>
            </View>
          ) : restaurantsError ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Live results unavailable. Showing offline favorites.
              </Text>
            </View>
          ) : null}
          {recommendedRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} item={restaurant} />
          ))}
        </FadeInView>

        <FadeInView delay={240} style={styles.recommendationCard}>
          <Text style={styles.recommendationEyebrow}>Current browse mode</Text>
          <Text style={styles.recommendationTitle}>{selectedCuisineLabel}</Text>
          <Text style={styles.recommendationCopy}>
            Use the new search flow to save searches, tune price and dietary
            filters, and open richer restaurant details.
          </Text>
          <Pressable
            style={styles.recommendationButton}
            onPress={() => {
              const restaurant = browseRestaurants[0];
              if (restaurant) {
                setSelectedRestaurant(restaurant.id);
                router.push({
                  pathname: "/restaurant-menu",
                  params: { restaurantId: restaurant.id },
                });
              }
            }}
          >
            <Text style={styles.recommendationButtonText}>Open Top Match</Text>
          </Pressable>
        </FadeInView>

        <FadeInView delay={300} style={styles.section}>
          <Text style={styles.sectionTitle}>Browse nearby</Text>
          {browseRestaurants.length === 0 && !isLoadingRestaurants ? (
            <View style={styles.browseEmpty}>
              <Text style={styles.browseEmptyTitle}>
                No matches for {selectedCuisineLabel}
              </Text>
              <Text style={styles.browseEmptyCopy}>
                Try a different category or reset filters to see all nearby spots.
              </Text>
              <Pressable
                accessibilityLabel="Reset cuisine filter"
                accessibilityRole="button"
                hitSlop={10}
                style={styles.browseEmptyButton}
                onPress={resetDiscoveryFilters}
              >
                <Text style={styles.browseEmptyButtonText}>Reset Filters</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.grid}>
              {browseRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} item={restaurant} compact />
              ))}
            </View>
          )}
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
    paddingBottom: 112,
    gap: spacing.lg,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.background,
  },
  headerSubtitle: {
    marginTop: 4,
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(236, 227, 206, 0.78)",
  },
  headerAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  searchShell: {
    paddingHorizontal: 20,
    marginTop: -8,
  },
  searchBar: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  searchPrompt: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: "rgba(236, 227, 206, 0.8)",
  },
  recentSearchCard: {
    paddingHorizontal: 20,
    gap: 12,
  },
  recentSearchList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  recentSearchPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentSearchText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.primary,
  },
  tagList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: {
    backgroundColor: colors.surface,
    borderColor: colors.surface,
  },
  tagText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.primary,
  },
  tagTextActive: {
    color: colors.background,
  },
  section: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  sectionLink: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.surfaceDeep,
  },
  restaurantCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  compactRestaurantCard: {
    width: "48%",
  },
  restaurantImage: {
    width: "100%",
    height: 154,
  },
  compactImage: {
    height: 112,
    backgroundColor: colors.surfaceDeep,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonActive: {
    backgroundColor: colors.surfaceDeep,
  },
  badgePill: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(58,77,57,0.82)",
  },
  badgeText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.background,
  },
  restaurantContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceDeep,
    gap: 4,
  },
  restaurantMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  restaurantName: {
    flex: 1,
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.background,
  },
  restaurantRating: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.background,
  },
  restaurantCuisine: {
    fontFamily: typography.body,
    fontSize: 11,
    color: "rgba(236, 227, 206, 0.78)",
  },
  restaurantDescription: {
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 16,
    color: "rgba(236, 227, 206, 0.86)",
  },
  recommendationCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  recommendationEyebrow: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  recommendationTitle: {
    fontFamily: typography.display,
    fontSize: 26,
    color: colors.primary,
  },
  recommendationCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  recommendationButton: {
    marginTop: 4,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendationButtonText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.background,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingRowText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  notice: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  browseEmpty: {
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
    alignItems: "center",
  },
  browseEmptyTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.primary,
  },
  browseEmptyCopy: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  browseEmptyButton: {
    marginTop: 4,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  browseEmptyButtonText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
});
