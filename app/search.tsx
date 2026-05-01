import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import FadeInView from "./FadeInView";
import {
  allRestaurants,
  cuisineTags,
  dietaryFilters,
  priceFilters,
  searchSuggestions,
} from "./appData";
import { useAppState } from "./appState";
import { goBackOrReplace } from "./navigation";
import { colors, spacing, typography } from "./theme";

const headerTopPadding = (StatusBar.currentHeight ?? 0) + 14;

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

function getRestaurantSearchText(restaurant: (typeof allRestaurants)[number]) {
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
  restaurant: (typeof allRestaurants)[number],
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
  const scrollRef = useRef<ScrollView>(null);
  const [resultsOffset, setResultsOffset] = useState(0);
  const {
    applyDiscoveryFilters,
    clearSearch,
    discoveryFilters,
    recentSearches,
    savedSearches,
    searchQuery,
    setSearchQuery,
    setSelectedRestaurant,
    submitSearch,
    toggleSavedSearch,
    resetDiscoveryFilters,
  } = useAppState();

  const filteredResults = useMemo(() => {
    const query = searchQuery.trim();

    return allRestaurants
      .map((restaurant, index) => ({
        restaurant,
        index,
        score: getRestaurantSearchScore(restaurant, query),
      }))
      .filter(({ restaurant, score }) => {
      const matchesCuisine =
        discoveryFilters.cuisineId === "all" ||
        restaurant.cuisine.toLowerCase().includes(discoveryFilters.cuisineId.toLowerCase()) ||
        restaurant.dietaryTags.some((tag) => tag.toLowerCase().includes(discoveryFilters.cuisineId.toLowerCase()));
      const matchesDietary =
        !discoveryFilters.dietaryTag || restaurant.dietaryTags.includes(discoveryFilters.dietaryTag);
      const matchesPrice = !discoveryFilters.price || restaurant.price === discoveryFilters.price;

      return score >= 0 && matchesCuisine && matchesDietary && matchesPrice;
    })
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .map(({ restaurant }) => restaurant);
  }, [discoveryFilters, searchQuery]);

  const handleSubmitSearch = (value?: string) => {
    submitSearch(value);
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

  const handleBack = () => {
    goBackOrReplace("/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FadeInView delay={40} style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={12}
            style={styles.backButton}
            onPress={handleBack}
          >
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>SEARCH</Text>
          <Pressable
            accessibilityLabel="Clear search and filters"
            accessibilityRole="button"
            hitSlop={12}
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
          <Text style={styles.helperText}>Use autocomplete, filters, and saved searches to narrow your options.</Text>
        </FadeInView>

        <View onLayout={(event) => setResultsOffset(event.nativeEvent.layout.y)}>
        <FadeInView delay={120} style={styles.card}>
          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.cardTitle}>Top matches</Text>
              <Text style={styles.cardLabel}>
                {filteredResults.length} restaurant{filteredResults.length === 1 ? "" : "s"} found
              </Text>
            </View>
            {searchQuery.trim().length > 0 ? (
              <Pressable style={styles.saveQueryButton} onPress={() => toggleSavedSearch(searchQuery.trim())}>
                <Feather
                  name={savedSearches.includes(searchQuery.trim()) ? "bookmark" : "bookmark"}
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
            {filteredResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No matches yet</Text>
                <Text style={styles.emptyStateCopy}>Try a different cuisine, price point, or dietary filter.</Text>
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
                style={styles.filterChip}
                onPress={() => handleSubmitSearch(suggestion.label)}
              >
                <Text style={styles.filterChipText}>{suggestion.label}</Text>
              </Pressable>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={190} style={styles.card}>
          <Text style={styles.cardTitle}>Cuisine filters</Text>
          <View style={styles.chipWrap}>
            {cuisineTags.map((tag) => {
              const isActive = discoveryFilters.cuisineId === tag.id;
              return (
                <Pressable
                  key={tag.id}
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
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => applyDiscoveryFilters({ price: isActive ? null : price })}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{price}</Text>
                </Pressable>
              );
            })}
          </View>
        </FadeInView>

        <FadeInView delay={290} style={styles.card}>
          <Text style={styles.cardTitle}>Saved and recent</Text>
          <Text style={styles.cardLabel}>Saved searches</Text>
          <View style={styles.chipWrap}>
            {savedSearches.map((term) => (
              <Pressable key={term} style={styles.savedSearchChip} onPress={() => handleSubmitSearch(term)}>
                <Text style={styles.savedSearchText}>{term}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.cardLabel}>Recent searches</Text>
          <View style={styles.chipWrap}>
            {recentSearches.map((term) => (
              <Pressable key={term} style={styles.filterChip} onPress={() => handleSubmitSearch(term)}>
                <Text style={styles.filterChipText}>{term}</Text>
              </Pressable>
            ))}
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
    paddingTop: headerTopPadding,
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
});
