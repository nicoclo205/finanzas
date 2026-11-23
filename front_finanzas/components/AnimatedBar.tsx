import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  /** Fracción llena de la barra, entre 0 y 1. */
  value: number;
  color: string;
  height?: number;
  delay?: number;
};

/** Barra de progreso fina que crece desde cero al aparecer y se desliza cuando `value` cambia. */
export function AnimatedBar({ value, color, height = 5, delay = 120 }: Props) {
  const { palette } = useTheme();
  const fill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(fill, {
      toValue: Math.max(0, Math.min(1, value)),
      duration: 750,
      delay,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [value]);

  return (
    <View style={{ height, borderRadius: 999, backgroundColor: palette.line, overflow: "hidden" }}>
      <Animated.View
        style={{
          width: fill.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
          height: "100%",
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
