import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { cuisineTags, featuredRestaurants, nearbyRestaurants, Restaurant } from "../mockData";
import { colors, spacing, typography } from "../theme";

function RestaurantCard({ item, compact = false }: { item: Restaurant; compact?: boolean }) {
  return (
    <Pressable
      style={[styles.restaurantCard, compact && styles.compactRestaurantCard]}
      onPress={() => router.push("/menu")}
    >
      <Image source={item.image} style={[styles.restaurantImage, compact && styles.compactImage]} />
      <View style={styles.restaurantContent}>
        <View style={styles.restaurantMeta}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantRating}>{item.rating}/5</Text>
        </View>
        <Text style={styles.restaurantCuisine}>{item.cuisine}</Text>
      </View>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const [selectedTag, setSelectedTag] = useState(cuisineTags[0]?.id ?? "pizza");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FusionYum</Text>
          <Pressable style={styles.headerAction} onPress={() => router.push("/activity")}>
            <Feather name="clock" size={18} color={colors.background} />
          </Pressable>
        </View>

        <View style={styles.searchShell}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color={colors.background} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food, places, and vibes"
              placeholderTextColor="rgba(236, 227, 206, 0.76)"
            />
          </View>
        </View>

        <FlatList
          data={cuisineTags}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagList}
          renderItem={({ item }) => {
            const isActive = item.id === selectedTag;

            return (
              <Pressable
                onPress={() => setSelectedTag(item.id)}
                style={[styles.tagChip, isActive && styles.tagChipActive]}
              >
                <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{item.label}</Text>
              </Pressable>
            );
          }}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Restaurants</Text>
          <RestaurantCard item={featuredRestaurants[0]} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurants</Text>
          <View style={styles.grid}>
            {nearbyRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} item={restaurant} compact />
            ))}
          </View>
        </View>
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
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.background,
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
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.primary,
  },
  restaurantCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
});
