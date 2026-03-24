import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";

type FadeInViewProps = {
  children: React.ReactNode;
  delay?: number;
  translateY?: number;
  scaleFrom?: number;
  style?: StyleProp<ViewStyle>;
};

export default function FadeInView({
  children,
  delay = 0,
  translateY = 18,
  scaleFrom = 0.98,
  style,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(translateY)).current;
  const scale = useRef(new Animated.Value(scaleFrom)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, offset, opacity, scale]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY: offset }, { scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
