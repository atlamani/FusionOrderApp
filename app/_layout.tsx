import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { PrototypeStateProvider } from "./prototypeState";

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
    <PrototypeStateProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#ECE3CE" },
        }}
      />
    </PrototypeStateProvider>
  );
}
