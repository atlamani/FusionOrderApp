import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { restaurants } from './mockData';
import { getRestaurantImageSource } from './logoAssets';

export default function RestaurantMenuScreen() {
  const restaurant = restaurants[0];
  const imageSource = getRestaurantImageSource(restaurant?.image);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />
        <Text style={styles.title}>{restaurant?.name ?? 'Restaurant Menu'}</Text>
        <Text style={styles.subtitle}>{restaurant?.cuisine ?? ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        {(restaurant?.menu ?? []).map((item: any, index: number) => (
          <View key={index} style={styles.menuItem}>
            <Text style={styles.menuName}>{item.name}</Text>
            <Text style={styles.menuMeta}>{item.category}</Text>
            {item.price ? <Text style={styles.menuPrice}>${item.price}</Text> : null}
          </View>
        ))}
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
    paddingBottom: 32,
  },
  hero: {
    padding: 16,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  menuItem: {
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  menuMeta: {
    fontSize: 13,
    color: '#666',
  },
  menuPrice: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
    marginTop: 6,
  },
});