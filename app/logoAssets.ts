export const restaurantLogoAssets: Record<string, any> = {
  PizzaPlace: require('../assets/images/PizzaPlace.png'),
  Greek: require('../assets/images/Greek.png'),
  Tacos: require('../assets/images/Tacos.png'),
  Dessert: require('../assets/images/Dessert (1).png'),
};

export function getRestaurantImageSource(image?: string) {
  if (!image) {
    return restaurantLogoAssets.PizzaPlace;
  }

  return restaurantLogoAssets[image] ?? restaurantLogoAssets.PizzaPlace;
}