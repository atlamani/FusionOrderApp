import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { restaurants } from './mockData';
import { getRestaurantImageSource } from './logoAssets';

export default function RestaurantDashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Restaurant Dashboard</Text>
      {restaurants.map((restaurant) => {
        const imageSource = getRestaurantImageSource(restaurant.image);
        return (
          <View key={restaurant.id} style={styles.card}>
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.meta}>{restaurant.cuisine}</Text>
              <Text style={styles.meta}>{restaurant.menu?.length ?? 0} menu items</Text>
            </View>
          </View>
        );
      })}
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
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});