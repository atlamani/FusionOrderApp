// Dynamic Expo config so we can read secrets from .env without checking them in.
// `.env` is loaded automatically by Expo CLI when this file is evaluated.

/** @type {import('expo/config').ExpoConfig} */
const config = {
  name: "FusionOrderApp",
  slug: "FusionOrderApp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "fusionorderapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.adrian.FusionYum",
    googleServicesFile: "./GoogleService-Info.plist",
    config: {
      // Used by react-native-maps when running iOS dev clients with Google Maps.
      googleMapsApiKey:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
        process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
    },
  },
  android: {
    package: "com.adrian.FusionYum",
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        // Required by react-native-maps on Android. Reuses the Places key
        // when EXPO_PUBLIC_GOOGLE_MAPS_API_KEY isn't set; in that case the
        // same Google Cloud project must have "Maps SDK for Android" enabled.
        apiKey:
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
          process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
      },
    },
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "@react-native-firebase/app",
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-font",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to access your location to find nearby restaurants.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

module.exports = { expo: config };
