import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../app/theme";

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Shimmering placeholder block used while live data is loading. Sized
 * via props so we can compose larger card skeletons out of stacked
 * blocks. Uses Animated.loop with native driver so the shimmer doesn't
 * cost a JS-thread frame.
 */
export function Skeleton({
  width = "100%",
  height = 14,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.85],
  });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.block,
        { width, height, borderRadius, opacity },
        style as ViewStyle,
      ]}
    />
  );
}

/**
 * Card-shaped skeleton matched to the restaurant cards rendered on
 * Home and Search. Renders the hero image, two text lines, and a
 * footer row so the layout doesn't shift when real data lands.
 */
export function RestaurantCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={150} borderRadius={18} />
      <View style={styles.cardBody}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="50%" height={12} />
        <View style={styles.cardFooter}>
          <Skeleton width={64} height={12} borderRadius={6} />
          <Skeleton width={48} height={12} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

/**
 * Compact list-row skeleton for the Search "Top matches" results list.
 */
export function SearchResultSkeleton() {
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultCopy}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="80%" height={12} />
      </View>
      <View style={styles.resultAside}>
        <Skeleton width={32} height={14} />
        <Skeleton width={48} height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surfaceSoft,
  },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardBody: {
    padding: 14,
    gap: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  resultRow: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  resultCopy: {
    flex: 1,
    gap: 8,
  },
  resultAside: {
    width: 60,
    gap: 8,
    alignItems: "flex-end",
  },
});
