import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { restaurants } from '../mockData';
import { getRestaurantImageSource } from '../logoAssets';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Recommended for you</Text>
      <View style={styles.recommendations}>
        {restaurants.slice(0, 6).map((restaurant) => {
          const imageSource = getRestaurantImageSource(restaurant.image);
          return (
            <TouchableOpacity key={restaurant.id} style={styles.card} activeOpacity={0.85}>
              <Image source={imageSource} style={styles.image} resizeMode="cover" />
              <View style={styles.cardBody}>
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
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111',
  },
  recommendations: {
    gap: 14,
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 18,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#e5e5e5',
  },
  cardBody: {
    padding: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 13,
    color: '#666',
  },
});