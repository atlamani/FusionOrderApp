import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import FadeInView from "../FadeInView";
import { favoriteSpots, featuredRestaurants, nearbyRestaurants } from "../mockData";
import { usePrototypeState } from "../prototypeState";
import { colors, spacing, typography } from "../theme";

const restaurantLookup = [...featuredRestaurants, ...nearbyRestaurants].reduce<
  Record<string, (typeof featuredRestaurants)[number]>
>((accumulator, restaurant) => {
  accumulator[restaurant.id] = restaurant;
  return accumulator;
}, {});

export default function FavoritesScreen() {
  const { favoriteIds, setSelectedRestaurant, toggleFavorite } = usePrototypeState();
  const visibleFavorites = favoriteSpots.filter((favorite) => favoriteIds.includes(favorite.restaurantId));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <FadeInView delay={40} style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Feather name="heart" size={18} color={colors.background} />
          </View>
          <Text style={styles.heroTitle}>Favorites</Text>
          <Text style={styles.heroCopy}>
            Quick access to your saved comfort picks, styled to match the FusionYum discovery flow.
          </Text>
        </FadeInView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Restaurants</Text>
          <Text style={styles.sectionMeta}>{visibleFavorites.length} spots</Text>
        </View>

        {visibleFavorites.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No saved restaurants yet</Text>
            <Text style={styles.emptyCopy}>
              Tap the heart icon on Home to save a spot and build out this prototype list.
            </Text>
            <Pressable style={styles.emptyButton} onPress={() => router.push("/home")}>
              <Text style={styles.emptyButtonText}>Discover Restaurants</Text>
            </Pressable>
          </View>
        ) : null}

        {visibleFavorites.map((favorite) => {
          const restaurant = restaurantLookup[favorite.restaurantId];

          if (!restaurant) {
            return null;
          }

          return (
            <View key={favorite.id} style={styles.favoriteCard}>
              <Image source={restaurant.image} style={styles.favoriteImage} />
              <Pressable style={styles.removeButton} onPress={() => toggleFavorite(restaurant.id)}>
                <Feather name="heart" size={16} color={colors.white} />
              </Pressable>
              <View style={styles.favoriteBody}>
                <View style={styles.favoriteTopRow}>
                  <Text style={styles.favoriteName}>{restaurant.name}</Text>
                  <View style={styles.ratingPill}>
                    <Feather name="star" size={12} color={colors.background} />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                </View>
                <Text style={styles.favoriteMeta}>
                  {`${restaurant.cuisine} · ${restaurant.eta} · ${restaurant.price}`}
                </Text>
                <Text style={styles.favoriteCopy}>{favorite.note}</Text>
                <View style={styles.favoriteActions}>
                  <Pressable
                    style={styles.primaryAction}
                    onPress={() => {
                      setSelectedRestaurant(restaurant.id);
                      router.push("/menu");
                    }}
                  >
                    <Text style={styles.primaryActionText}>{favorite.orderHint}</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryAction} onPress={() => router.push("/checkout")}>
                    <Text style={styles.secondaryActionText}>Open Cart</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
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
  heroCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 10,
  },
  heroBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontFamily: typography.display,
    fontSize: 30,
    color: colors.white,
  },
  heroCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.86)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  sectionMeta: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyCard: {
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  emptyCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  emptyButton: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  emptyButtonText: {
    fontFamily: typography.display,
    fontSize: 14,
    color: colors.white,
  },
  favoriteCard: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteImage: {
    width: "100%",
    height: 168,
  },
  removeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceDeep,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteBody: {
    padding: 16,
    gap: 10,
  },
  favoriteTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  favoriteName: {
    flex: 1,
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.primary,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceDeep,
  },
  ratingText: {
    fontFamily: typography.display,
    fontSize: 12,
    color: colors.background,
  },
  favoriteMeta: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  favoriteCopy: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  favoriteActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  primaryActionText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.white,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    fontFamily: typography.display,
    fontSize: 13,
    color: colors.primary,
  },
});
