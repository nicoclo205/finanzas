import React, { useEffect, useRef } from "react";
import { Animated, Easing, View, Text, Pressable } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { fonts } from "../theme/fonts";
import { Objective } from "../lib/api";
import { formatAmount, formatDateWithYear } from "../lib/format";

export function ObjectiveCard({ objective, onPress }: { objective: Objective; onPress?: () => void }) {
  const { palette, semantic } = useTheme();
  const doneColor = semantic.ingreso;
  const { name, saved_amount, target_amount, target_date } = objective;

  const hasTarget = target_amount != null && target_amount > 0;
  const ratio = hasTarget ? saved_amount / (target_amount as number) : 0;
  const done = hasTarget && ratio >= 1;
  const barColor = done ? doneColor : palette.accent;
  const percent = Math.floor(ratio * 100);
  const remaining = hasTarget ? Math.max(0, (target_amount as number) - saved_amount) : 0;

  // La barra crece suavemente desde cero al aparecer y se desliza al nuevo valor
  // cuando cambia el ahorro (por ejemplo, tras apartar o retirar plata).
  const fill = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(fill, {
      toValue: Math.min(1, ratio),
      duration: 750,
      delay: 120,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [ratio]);

  // Feedback al presionar: la tarjeta se hunde un poco y vuelve con un resorte suave.
  const press = useRef(new Animated.Value(1)).current;
  const animatePress = (to: number) =>
    Animated.spring(press, { toValue: to, speed: 40, bounciness: 4, useNativeDriver: true }).start();

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      onPressIn={() => animatePress(0.98)}
      onPressOut={() => animatePress(1)}
    >
    <Animated.View
      style={{
        backgroundColor: palette.bg,
        borderRadius: 14,
        padding: 16,
        gap: 12,
        transform: [{ scale: press }],
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.bodySemiBold, fontSize: 16, color: palette.text }}>
          {name}
        </Text>
        <Text
          style={{
            fontFamily: fonts.monoRegular,
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: done ? doneColor : palette.dim,
          }}
        >
          {done ? "Lograda" : hasTarget ? `${percent}%` : "Abierto"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        <Text style={{ fontFamily: fonts.monoMedium, fontSize: 22, color: barColor }}>
          $ {formatAmount(saved_amount)}
        </Text>
        {hasTarget && (
          <Text style={{ fontFamily: fonts.monoRegular, fontSize: 13, color: palette.dim }}>
            de $ {formatAmount(target_amount as number)}
          </Text>
        )}
      </View>

      {hasTarget && (
        <View style={{ height: 5, borderRadius: 999, backgroundColor: palette.line, overflow: "hidden" }}>
          <Animated.View
            style={{
              width: fill.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
              height: "100%",
              borderRadius: 999,
              backgroundColor: barColor,
            }}
          />
        </View>
      )}

      <Text style={{ fontSize: 12, color: palette.dim }}>
        {hasTarget
          ? done
            ? "Meta alcanzada"
            : `Faltan $ ${formatAmount(remaining)}`
          : "Apartado sin monto objetivo"}
        {target_date ? ` · hasta ${formatDateWithYear(target_date)}` : ""}
      </Text>
    </Animated.View>
    </Pressable>
  );
}
