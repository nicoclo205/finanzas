import React, { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Retraso en ms antes de entrar; útil para escalonar elementos de una lista. */
  delay?: number;
};

// Curva de desaceleración suave (arranca rápido y "aterriza" despacio), la misma
// que usan la navegación y el diálogo, para que todo el movimiento se sienta de una familia.
const EASE_OUT = Easing.bezier(0.2, 0.8, 0.2, 1);

/**
 * Entrada "om-rise": fade + translateY(14px) -> 0, 420ms con desaceleración suave.
 * Usada por las pantallas de formularios y Ajustes al montar, y (con `delay`)
 * para escalonar las tarjetas de las listas.
 */
export function RiseIn({ children, style, delay = 0 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      easing: EASE_OUT,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
