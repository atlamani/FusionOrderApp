import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import BrandLogo from "./BrandLogo";
import { colors, radii } from "./theme";

type SocialButtonProps = {
  brand: "Google" | "Apple" | "Facebook";
  onPress?: () => void;
};

export default function SocialButton({ brand, onPress }: SocialButtonProps) {
  const assetBrand = brand === "Google" ? "google" : brand === "Apple" ? "apple" : "facebook";

  return (
    <Pressable
      accessibilityLabel={`${brand} sign in`}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <View style={styles.logoWrap}>
        <BrandLogo brand={assetBrand} type="social" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 82,
    height: 58,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(58, 77, 57, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  logoWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.965 }],
  },
});
