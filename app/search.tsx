import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import FadeInView from "./FadeInView";
import {
  allRestaurants,
  cuisineTags,
  dietaryFilters,
  priceFilters,
  searchSuggestions,
} from "./mockData";
import { usePrototypeState } from "./prototypeState";
import { colors, spacing, typography } from "./theme";

export default function SearchScreen() {
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
  } = usePrototypeState();

  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allRestaurants.filter((restaurant) => {
      const matchesQuery =
        query.length === 0 ||
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query) ||
        restaurant.popularDishes.some((dish) => dish.toLowerCase().includes(query));
      const matchesCuisine =
        discoveryFilters.cuisineId === "all" ||
        restaurant.cuisine.toLowerCase().includes(discoveryFilters.cuisineId.toLowerCase()) ||
        restaurant.dietaryTags.some((tag) => tag.toLowerCase().includes(discoveryFilters.cuisineId.toLowerCase()));
      const matchesDietary =
        !discoveryFilters.dietaryTag || restaurant.dietaryTags.includes(discoveryFilters.dietaryTag);
      const matchesPrice = !discoveryFilters.price || restaurant.price === discoveryFilters.price;

      return matchesQuery && matchesCuisine && matchesDietary && matchesPrice;
    });
  }, [discoveryFilters, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.background} />
          </Pressable>
          <Text style={styles.headerTitle}>SEARCH</Text>
          <Pressable style={styles.clearButton} onPress={clearSearch}>
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
              onSubmitEditing={() => submitSearch()}
              returnKeyType="search"
            />
            <Pressable style={styles.submitButton} onPress={() => submitSearch()}>
              <Feather name="arrow-right" size={16} color={colors.background} />
            </Pressable>
          </View>
          <Text style={styles.helperText}>Autocomplete, filters, and saved searches are mocked locally for MVP planning.</Text>
        </FadeInView>

        <FadeInView delay={140} style={styles.card}>
          <Text style={styles.cardTitle}>Quick suggestions</Text>
          <View style={styles.chipWrap}>
            {searchSuggestions.map((suggestion) => (
              <Pressable
                key={suggestion.id}
                style={styles.filterChip}
                onPress={() => submitSearch(suggestion.label)}
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
              <Pressable key={term} style={styles.savedSearchChip} onPress={() => submitSearch(term)}>
                <Text style={styles.savedSearchText}>{term}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.cardLabel}>Recent searches</Text>
          <View style={styles.chipWrap}>
            {recentSearches.map((term) => (
              <Pressable key={term} style={styles.filterChip} onPress={() => submitSearch(term)}>
                <Text style={styles.filterChipText}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </FadeInView>

        <FadeInView delay={340} style={styles.card}>
          <View style={styles.resultsHeader}>
            <Text style={styles.cardTitle}>Results</Text>
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
                  router.push("/menu");
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
  clearButton: {
    minWidth: 52,
    minHeight: 40,
    borderRadius: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
