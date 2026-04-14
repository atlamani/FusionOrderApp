import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { restaurants } from './mockData';
import { getRestaurantImageSource } from './logoAssets';

export default function SearchScreen() {
  const [query, setQuery] = useState('');

  const filteredRestaurants = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return restaurants;
    return restaurants.filter((restaurant) => {
      return (
        restaurant.name.toLowerCase().includes(normalized) ||
        restaurant.cuisine.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search restaurants or cuisine"
        placeholderTextColor="#888"
        style={styles.input}
      />
      <View style={styles.list}>
        {filteredRestaurants.map((restaurant) => {
          const imageSource = getRestaurantImageSource(restaurant.image);
          return (
            <TouchableOpacity key={restaurant.id} style={styles.row} activeOpacity={0.85}>
              <Image source={imageSource} style={styles.image} resizeMode="cover" />
              <View style={styles.rowBody}>
                <Text style={styles.name}>{restaurant.name}</Text>
                <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  list: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f7',
    borderRadius: 18,
    overflow: 'hidden',
  },
  image: {
    width: 96,
    height: 96,
    backgroundColor: '#e5e5e5',
  },
  rowBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 13,
    color: '#666',
  },
});