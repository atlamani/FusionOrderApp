import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { restaurants } from './mockData';
import { getRestaurantImageSource } from './logoAssets';

export default function Dashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.grid}>
        {restaurants.map((restaurant) => {
          const imageSource = getRestaurantImageSource(restaurant.image);
          return (
            <TouchableOpacity key={restaurant.id} style={styles.card} activeOpacity={0.8}>
              <Image source={imageSource} style={styles.image} resizeMode="cover" />
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.meta}>{restaurant.cuisine}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e5e5',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 10,
    color: '#111',
  },
  meta: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
  },
});