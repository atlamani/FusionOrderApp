import React from "react";
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { logoAssets, PaymentBrand, SocialBrand } from "./logoAssets";

type BrandLogoProps = {
  brand: SocialBrand | PaymentBrand;
  type: "social" | "payment";
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

const socialSizing: Record<SocialBrand, ImageStyle> = {
  facebook: { width: 27, height: 27 },
  google: { width: 30, height: 30 },
  apple: { width: 25, height: 25 },
};

const paymentSizing: Record<PaymentBrand, ImageStyle> = {
  visa: { width: 54, height: 18 },
  mastercard: { width: 42, height: 26 },
  amex: { width: 56, height: 22 },
  discover: { width: 48, height: 18 },
};

export default function BrandLogo({ brand, type, containerStyle, imageStyle }: BrandLogoProps) {
  const source = type === "social" ? logoAssets.social[brand as SocialBrand] : logoAssets.payment[brand as PaymentBrand];
  const sizing = type === "social" ? socialSizing[brand as SocialBrand] : paymentSizing[brand as PaymentBrand];

  return (
    <View style={[styles.container, containerStyle]}>
      <Image source={source} resizeMode="contain" style={[styles.image, sizing, imageStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
