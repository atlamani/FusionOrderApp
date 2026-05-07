import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, typography } from "../app/theme";

type FusionYumLogoProps = {
  /**
   * Size of the badge in points. Inner content (icon + monogram) scales
   * proportionally. Defaults to 96.
   */
  size?: number;
  /**
   * If true, renders the FusionYum wordmark beneath the badge. Defaults to
   * `false` so callers can lay out the wordmark themselves when they need
   * different typography.
   */
  showWordmark?: boolean;
  /**
   * Visual variant. `"solid"` (default) is a filled green badge with light
   * content; `"outline"` is a light surface with a green outline and dark
   * content — better when sitting on a coloured background.
   */
  variant?: "solid" | "outline";
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * FusionYum wordmark logo — a circular monogram badge with the project's
 * primary green palette, optionally paired with the "FusionYum" wordmark.
 *
 * Rendered with React Native primitives so it stays crisp at any size and
 * needs no asset file.
 */
export function FusionYumLogo({
  size = 96,
  showWordmark = false,
  variant = "solid",
  containerStyle,
}: FusionYumLogoProps) {
  const isSolid = variant === "solid";
  const badgeBackground = isSolid ? colors.primary : colors.white;
  const badgeBorderColor = isSolid ? colors.surfaceDeep : colors.primary;
  const monogramColor = isSolid ? colors.background : colors.primary;
  const accentColor = isSolid ? colors.surface : colors.surface;

  const badgeStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: badgeBackground,
    borderColor: badgeBorderColor,
    borderWidth: isSolid ? 0 : 2,
  };

  // Sub-element sizing follows the badge size so the badge looks balanced
  // at any scale.
  const ringSize = size * 0.74;
  const monogramFontSize = size * 0.42;
  const accentMarkSize = size * 0.18;
  const wordmarkFontSize = Math.max(20, size * 0.28);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.badge, badgeStyle]}>
        <View
          style={[
            styles.innerRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderColor: monogramColor,
            },
          ]}
        />
        <Text
          allowFontScaling={false}
          style={[
            styles.monogram,
            { color: monogramColor, fontSize: monogramFontSize },
          ]}
        >
          FY
        </Text>
        <View
          style={[
            styles.accentDot,
            {
              width: accentMarkSize,
              height: accentMarkSize,
              borderRadius: accentMarkSize / 2,
              backgroundColor: accentColor,
              right: size * 0.08,
              bottom: size * 0.08,
            },
          ]}
        >
          <Feather
            name="zap"
            size={accentMarkSize * 0.62}
            color={isSolid ? colors.primary : colors.background}
          />
        </View>
      </View>
      {showWordmark ? (
        <Text
          allowFontScaling={false}
          style={[styles.wordmark, { fontSize: wordmarkFontSize }]}
        >
          FusionYum
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  innerRing: {
    position: "absolute",
    borderWidth: 2,
    opacity: 0.18,
  },
  monogram: {
    fontFamily: typography.display,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  accentDot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontFamily: typography.display,
    color: colors.primary,
    letterSpacing: 0.5,
  },
});

export default FusionYumLogo;
