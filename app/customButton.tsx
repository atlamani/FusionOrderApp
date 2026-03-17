import { Href, router } from "expo-router";
import React from "react";
import {
  Linking,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors, typography } from "./theme";

type CustomButtonProps = {
  title: string;
  onPress?: () => void;
  href?: Href | string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const CustomButton = ({
  title,
  onPress,
  href,
  disabled = false,
  style,
  textStyle,
}: CustomButtonProps) => {
  const handlePress = async () => {
    if (disabled) {
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
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    width: "100%",
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  disabled: {
    backgroundColor: colors.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: colors.background,
    fontFamily: typography.display,
    fontSize: 16,
    textAlign: "center",
  },
  textDisabled: {
    opacity: 0.8,
  },
});

export default CustomButton;
