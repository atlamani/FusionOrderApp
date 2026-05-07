import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
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
import {
  cuisineTags,
  dietaryFilters,
  priceFilters,
  searchSuggestions,
  type Restaurant,
} from "./appData";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import { getSafeHeaderTopPadding } from "./safeHeaderLayout";
import { colors, spacing, typography } from "./theme";

const ratingFilters = [
  { id: 0, label: "Any rating" },
  { id: 3.5, label: "3.5+" },
  { id: 4, label: "4.0+" },
  { id: 4.5, label: "4.5+" },
];

const distanceFilters: { id: number | null; label: string }[] = [
  { id: null, label: "Any distance" },
  { id: 0.5, label: "Under 0.5 mi" },
  { id: 1, label: "Under 1 mi" },
  { id: 2, label: "Under 2 mi" },
];

function parseRestaurantRating(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseRestaurantDistance(value: string) {
  const match = value.match(/[\d.]+/);
  if (!match) return Number.POSITIVE_INFINITY;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "around",
  "delivery",
  "dinner",
  "for",
  "near",
  "nearby",
  "the",
  "with",
]);

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s$]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTokens(value: string) {
  const tokens = normalizeSearchValue(value)
    .split(" ")
    .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));

  return tokens.length > 0 ? tokens : normalizeSearchValue(value).split(" ").filter(Boolean);
}

function getRestaurantSearchText(restaurant: Restaurant) {
  return normalizeSearchValue(
    [
      restaurant.name,
      restaurant.cuisine,
      restaurant.badge,
      restaurant.description,
      restaurant.distance,
      restaurant.eta,
      restaurant.price,
      ...restaurant.dietaryTags,
      ...restaurant.popularDishes,
    ].join(" "),
  );
}

function getRestaurantSearchScore(
  restaurant: Restaurant,
  query: string,
) {
  const normalizedQuery = normalizeSearchValue(query);
  const tokens = getSearchTokens(query);

  if (!normalizedQuery) {
    return 1;
  }

  const searchableText = getRestaurantSearchText(restaurant);
  const matchedTokens = tokens.filter((token) => searchableText.includes(token));

  if (matchedTokens.length === 0) {
    return -1;
  }

  let score = matchedTokens.length;

  if (searchableText.includes(normalizedQuery)) {
    score += 4;
  }

  if (normalizeSearchValue(restaurant.name).includes(normalizedQuery)) {
    score += 8;
  }

  if (normalizeSearchValue(restaurant.cuisine).includes(normalizedQuery)) {
    score += 5;
  }

  return score;
}


export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const headerTopPadding = getSafeHeaderTopPadding(insets.top);
  const scrollRef = useRef<ScrollView>(null);
  const [resultsOffset, setResultsOffset] = useState(0);
  const {
    applyDiscoveryFilters,
    clearSearch,
    discoveryFilters,
    restaurantDataLoading,
    restaurantDataMessage,
    restaurantDataSource,
    restaurants,
    recentSearches,
    savedSearches,
    searchQuery,
    setSearchQuery,
    setSelectedRestaurant,
    submitSearch,
    toggleSavedSearch,
    resetDiscoveryFilters,
    refreshRestaurants,
  } = useAppState();

  const filteredResults = useMemo(() => {
    const query = searchQuery.trim();
    const cuisineId = discoveryFilters.cuisineId.toLowerCase();
    const minRating = discoveryFilters.minRating;
    const maxDistance = discoveryFilters.maxDistanceMi;

    return restaurants
      .map((restaurant, index) => ({
        restaurant,
        index,
        score: getRestaurantSearchScore(restaurant, query),
      }))
      .filter(({ restaurant, score }) => {
      const matchesCuisine =
        discoveryFilters.cuisineId === "all" ||
        restaurant.cuisine.toLowerCase().includes(cuisineId) ||
        restaurant.dietaryTags.some((tag) => tag.toLowerCase().includes(cuisineId)) ||
        restaurant.popularDishes.some((dish) => dish.toLowerCase().includes(cuisineId));
      const matchesDietary =
        !discoveryFilters.dietaryTag || restaurant.dietaryTags.includes(discoveryFilters.dietaryTag);
      const matchesPrice = !discoveryFilters.price || restaurant.price === discoveryFilters.price;
      const matchesRating =
        minRating <= 0 || parseRestaurantRating(restaurant.rating) >= minRating;
      const matchesDistance =
        maxDistance == null || parseRestaurantDistance(restaurant.distance) <= maxDistance;

      return (
        score >= 0 &&
        matchesCuisine &&
        matchesDietary &&
        matchesPrice &&
        matchesRating &&
        matchesDistance
      );
    })
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .map(({ restaurant }) => restaurant);
  }, [discoveryFilters, restaurants, searchQuery]);

  const activeFilterCount =
    (discoveryFilters.cuisineId !== "all" ? 1 : 0) +
    (discoveryFilters.dietaryTag ? 1 : 0) +
    (discoveryFilters.price ? 1 : 0) +
    (discoveryFilters.minRating > 0 ? 1 : 0) +
    (discoveryFilters.maxDistanceMi != null ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const handleSubmitSearch = (value?: string) => {
    const submittedValue = (value ?? searchQuery).trim();
    submitSearch(value);
    if (submittedValue) {
      void refreshRestaurants(submittedValue);
    }
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(resultsOffset - 12, 0),
        animated: true,
      });
    });
  };

  const handleClear = () => {
    clearSearch();
    resetDiscoveryFilters();
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  const handleApplyFilters = () => {
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(resultsOffset - 12, 0),
        animated: true,
      });
    });
  };

  const handleResetFilters = () => {
    resetDiscoveryFilters();
  };

  const handleBack = () => {
    goBackOrReplace("/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.headerTitle}>SEARCH</Text>
          <Pressable
            accessibilityLabel="Clear search and filters"
            accessibilityRole="button"
            hitSlop={16}
            style={styles.clearButton}
            onPress={handleClear}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </Pressable>
        </FadeInView>

        <FadeInView delay={90} style={styles.searchCard}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color={colors.background} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search restaurants, dishes, or cuisines"
              placeholderTextColor="rgba(236, 227, 206, 0.76)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSubmitSearch()}
              returnKeyType="search"
            />
            <Pressable
              accessibilityLabel="Search restaurants"
              accessibilityRole="button"
              hitSlop={10}
              style={styles.submitButton}
              onPress={() => handleSubmitSearch(searchQuery)}
            >
              <Feather name="arrow-right" size={16} color={colors.background} />
            </Pressable>
          </View>
          <Text style={styles.helperText}>
            {restaurantDataLoading ? "Refreshing nearby restaurants..." : restaurantDataMessage}
          </Text>
        </FadeInView>

        <View onLayout={(event) => setResultsOffset(event.nativeEvent.layout.y)}>
        <FadeInView delay={120} style={styles.card}>
          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.cardTitle}>Top matches</Text>
              <Text style={styles.cardLabel}>
                {restaurantDataLoading
                  ? "Loading restaurants..."
                  : `${filteredResults.length} restaurant${filteredResults.length === 1 ? "" : "s"} found`}
              </Text>
              {restaurantDataSource === "google" ? (
                <Text style={styles.statusInfoText}>
                  Live - Google Places
                </Text>
              ) : null}
            </View>
            {searchQuery.trim().length > 0 ? (
              <Pressable
                accessibilityLabel={
                  savedSearches.includes(searchQuery.trim())
                    ? "Remove search from saved searches"
                    : "Save current search"
                }
                accessibilityRole="button"
                hitSlop={8}
                style={styles.saveQueryButton}
                onPress={() => toggleSavedSearch(searchQuery.trim())}
              >
                <Feather
                  name="bookmark"
                  size={14}
                  color={colors.background}
                />
                <Text style={styles.saveQueryText}>
                  {savedSearches.includes(searchQuery.trim()) ? "Saved" : "Save Search"}
                </Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.resultsList}>
            {restaurantDataLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.surface} />
                <Text style={styles.loadingStateText}>Fetching nearby restaurants...</Text>
              </View>
            ) : null}
            {filteredResults.map((restaurant) => (
              <Pressable
                key={restaurant.id}
                style={styles.resultCard}
                onPress={() => {
                  setSelectedRestaurant(restaurant.id);
                  router.push({
                    pathname: "/restaurant-menu",
                    params: { restaurantId: restaurant.id },
                  });
                }}
              >
                <View style={styles.resultCopy}>
                  <Text style={styles.resultName}>{restaurant.name}</Text>
                  <Text style={styles.resultMeta}>
                    {restaurant.cuisine} | {restaurant.distance} | {restaurant.price}
                  </Text>
                  <Text style={styles.resultDescription}>{restaurant.description}</Text>
                </View>
                <View style={styles.resultAside}>
                  <Text style={styles.resultRating}>{restaurant.rating}</Text>
                  <Text style={styles.resultEta}>{restaurant.eta}</Text>
                </View>
              </Pressable>
            ))}
            {!restaurantDataLoading && filteredResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No matches yet</Text>
                <Text style={styles.emptyStateCopy}>
                  Try a different cuisine, price point, rating, distance, or dietary filter.
                </Text>
                {hasActiveFilters ? (
                  <Pressable
                    accessibilityLabel="Reset filters to defaults"
                    accessibilityRole="button"
                    hitSlop={10}
                    style={styles.emptyStateButton}
                    onPress={handleResetFilters}
                  >
                    <Text style={styles.emptyStateButtonText}>Reset Filters</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </FadeInView>
        </View>

        <FadeInView delay={140} style={styles.card}>
          <Text style={styles.cardTitle}>Quick suggestions</Text>
          <View style={styles.chipWrap}>
            {searchSuggestions.map((suggestion) => (
              <Pressable
                key={suggestion.id}
                accessibilityLabel={`Search for ${suggestion.label}`}
                accessibilityRole="button"
                hitSlop={6}
                style={styles.filterChip}
                onPress={() => handleSubmitSearch(suggestion.label)}
              >
                <Text style={styles.filterChipText}>{suggestion.label}</Text>
              </Pressable>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={190} style={styles.card}>
          <View style={styles.filtersHeaderRow}>
            <Text style={styles.cardTitle}>Cuisine filters</Text>
            <View style={styles.filtersHeaderMeta}>
              {hasActiveFilters ? (
                <View style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterBadgeText}>
                    {activeFilterCount} active
                  </Text>
                </View>
              ) : null}
              <Pressable
                accessibilityLabel="Reset all filters"
                accessibilityRole="button"
                hitSlop={10}
                disabled={!hasActiveFilters}
                style={[styles.resetButton, !hasActiveFilters && styles.resetButtonDisabled]}
                onPress={handleResetFilters}
              >
                <Text style={[styles.resetButtonText, !hasActiveFilters && styles.resetButtonTextDisabled]}>
                  Reset
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.chipWrap}>
            {cuisineTags.map((tag) => {
              const isActive = discoveryFilters.cuisineId === tag.id;
              return (
                <Pressable
                  key={tag.id}
                  accessibilityLabel={`Filter by ${tag.label}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  hitSlop={6}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => applyDiscoveryFilters({ cuisineId: tag.id })}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{tag.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </FadeInView>

        <FadeInView delay={240} style={styles.card}>
          <Text style={styles.cardTitle}>Dietary and price</Text>
          <Text style={styles.cardLabel}>Dietary</Text>
          <View style={styles.chipWrap}>
            {dietaryFilters.map((tag) => {
              const isActive = discoveryFilters.dietaryTag === tag;
              return (
                <Pressable
                  key={tag}
                  accessibilityLabel={`Toggle dietary filter ${tag}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  hitSlop={6}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => applyDiscoveryFilters({ dietaryTag: isActive ? null : tag })}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.cardLabel}>Price</Text>
          <View style={styles.chipWrap}>
            {priceFilters.map((price) => {
              const isActive = discoveryFilters.price === price;
              return (
                <Pressable
                  key={price}
                  accessibilityLabel={`Filter by price ${price}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  hitSlop={6}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => applyDiscoveryFilters({ price: isActive ? null : price })}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{price}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.cardLabel}>Minimum rating</Text>
          <View style={styles.chipWrap}>
            {ratingFilters.map((option) => {
              const isActive = discoveryFilters.minRating === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityLabel={`Filter by minimum rating ${option.label}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  hitSlop={6}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => applyDiscoveryFilters({ minRating: option.id })}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.cardLabel}>Distance</Text>
          <View style={styles.chipWrap}>
            {distanceFilters.map((option) => {
              const isActive = discoveryFilters.maxDistanceMi === option.id;
              return (
                <Pressable
                  key={option.label}
                  accessibilityLabel={`Filter by ${option.label}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  hitSlop={6}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => applyDiscoveryFilters({ maxDistanceMi: option.id })}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.filterActionRow}>
            <Pressable
              accessibilityLabel="Reset filters to defaults"
              accessibilityRole="button"
              hitSlop={10}
              disabled={!hasActiveFilters}
              style={[styles.secondaryFilterButton, !hasActiveFilters && styles.secondaryFilterButtonDisabled]}
              onPress={handleResetFilters}
            >
              <Text style={[styles.secondaryFilterButtonText, !hasActiveFilters && styles.secondaryFilterButtonTextDisabled]}>
                Reset Filters
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Apply filters and view matching restaurants"
              accessibilityRole="button"
              hitSlop={10}
              style={styles.primaryFilterButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.primaryFilterButtonText}>
                Apply Filters ({filteredResults.length})
              </Text>
            </Pressable>
          </View>
        </FadeInView>

        <FadeInView delay={290} style={styles.card}>
          <Text style={styles.cardTitle}>Saved and recent</Text>
          <Text style={styles.cardLabel}>Saved searches</Text>
          <View style={styles.chipWrap}>
            {savedSearches.length === 0 ? (
              <Text style={styles.emptyChipsCopy}>
                Saved searches show up here once you bookmark a query.
              </Text>
            ) : (
              savedSearches.map((term) => (
                <Pressable
                  key={term}
                  accessibilityLabel={`Run saved search ${term}`}
                  accessibilityRole="button"
                  hitSlop={6}
                  style={styles.savedSearchChip}
                  onPress={() => handleSubmitSearch(term)}
                >
                  <Text style={styles.savedSearchText}>{term}</Text>
                </Pressable>
              ))
            )}
          </View>
          <Text style={styles.cardLabel}>Recent searches</Text>
          <View style={styles.chipWrap}>
            {recentSearches.length === 0 ? (
              <Text style={styles.emptyChipsCopy}>
                Recent searches will appear here as you browse.
              </Text>
            ) : (
              recentSearches.map((term) => (
                <Pressable
                  key={term}
                  accessibilityLabel={`Run recent search ${term}`}
                  accessibilityRole="button"
                  hitSlop={6}
                  style={styles.filterChip}
                  onPress={() => handleSubmitSearch(term)}
                >
                  <Text style={styles.filterChipText}>{term}</Text>
                </Pressable>
              ))
            )}
          </View>
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
    paddingBottom: 36,
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
  clearButton: {
    minWidth: 62,
    minHeight: 46,
    borderRadius: 15,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.primary,
  },
  searchCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 12,
  },
  searchBar: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.background,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  helperText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.82)",
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: spacing.md,
  },
  cardTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  cardLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: colors.surface,
  },
  filterChipText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.primary,
  },
  filterChipTextActive: {
    color: colors.background,
  },
  savedSearchChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceDeep,
  },
  savedSearchText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  saveQueryButton: {
    minHeight: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveQueryText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  resultsList: {
    gap: 12,
  },
  resultCard: {
    borderRadius: 18,
    backgroundColor: colors.background,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  resultCopy: {
    flex: 1,
    gap: 4,
  },
  resultName: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  resultMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  resultDescription: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.text,
  },
  resultAside: {
    alignItems: "flex-end",
    gap: 4,
  },
  resultRating: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.surface,
  },
  resultEta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  filtersHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  filtersHeaderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeFilterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  activeFilterBadgeText: {
    fontFamily: typography.display,
    fontSize: 11,
    color: colors.background,
  },
  resetButton: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.primary,
  },
  resetButtonTextDisabled: {
    color: colors.textMuted,
  },
  filterActionRow: {
    marginTop: 4,
    flexDirection: "row",
    gap: 10,
  },
  primaryFilterButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  primaryFilterButtonText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.background,
  },
  secondaryFilterButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  secondaryFilterButtonDisabled: {
    opacity: 0.5,
  },
  secondaryFilterButtonText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
  secondaryFilterButtonTextDisabled: {
    color: colors.textMuted,
  },
  emptyChipsCopy: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyState: {
    borderRadius: 18,
    backgroundColor: colors.background,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  emptyStateTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  emptyStateCopy: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  emptyStateButton: {
    marginTop: 4,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateButtonText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  loadingState: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  loadingStateText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  statusInfoText: {
    marginTop: 2,
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.surface,
  },
  statusErrorText: {
    marginTop: 2,
    fontFamily: typography.body,
    fontSize: 11,
    color: "#dc2626",
  },
});
