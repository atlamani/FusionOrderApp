import { Href, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radii, typography } from "./theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "surface";

type CustomButtonProps = {
  title: string;
  onPress?: () => void;
  href?: Href | string;
  disabled?: boolean;
  loading?: boolean;
  leftSlot?: React.ReactNode;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const CustomButton = ({
  title,
  onPress,
  href,
  disabled = false,
  loading = false,
  leftSlot,
  variant = "primary",
  style,
  textStyle,
}: CustomButtonProps) => {
  const isDisabled = disabled || loading;

  const handlePress = async () => {
    if (isDisabled) {
      return;
    }

    onPress?.();

    if (!href) {
      return;
    }

    if (typeof href === "string" && /^https?:\/\//.test(href)) {
      await Linking.openURL(href);
      return;
    }

    router.push(href as Href);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={variant === "ghost" ? colors.primary : colors.background} />
        ) : (
          leftSlot
        )}
        <Text
          style={[
            styles.text,
            textVariantStyles[variant],
            isDisabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    width: "100%",
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    transform: [{ scale: 0.985 }, { translateY: 1 }],
  },
  text: {
    fontFamily: typography.display,
    fontSize: 15,
    textAlign: "center",
  },
  textDisabled: {
    opacity: 0.9,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    shadowOpacity: 0.1,
  },
  ghost: {
    backgroundColor: "rgba(255,255,255,0.48)",
    borderWidth: 1,
    borderColor: "rgba(58, 77, 57, 0.18)",
    shadowOpacity: 0,
    elevation: 0,
  },
  surface: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0.06,
    elevation: 1,
  },
});

const textVariantStyles = StyleSheet.create({
  primary: {
    color: colors.background,
  },
  secondary: {
    color: colors.white,
  },
  ghost: {
    color: colors.primary,
  },
  surface: {
    color: colors.primary,
  },
});

export default CustomButton;
