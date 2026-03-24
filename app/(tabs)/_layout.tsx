import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { colors, typography } from "../theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "rgba(58, 77, 57, 0.55)",
        tabBarStyle: {
          backgroundColor: "rgba(236, 227, 206, 0.98)",
          borderTopColor: "rgba(58, 77, 57, 0.08)",
          borderTopWidth: 0,
          height: 78,
          paddingTop: 10,
          paddingBottom: 12,
          shadowColor: colors.primary,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontFamily: typography.display,
          fontSize: 12,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => <Feather name="heart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
