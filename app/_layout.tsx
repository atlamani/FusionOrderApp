import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore repeated calls during fast refresh.
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "ConcertOne-Regular": require("../assets/Fonts/ConcertOne-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore splash hide errors during refresh.
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ECE3CE" },
        }}
      />
    </>
  );
}
