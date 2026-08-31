import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { fonts } from "../theme/fonts";

type Kind = "ok" | "error";

type Props = {
  visible: boolean;
  kind: Kind;
  title: string;
  text: string;
  ctaLabel?: string;
  onClose: () => void;
};

/**
 * Diálogo de confirmación "om-pop" del diseño original: fondo semitransparente
 * + tarjeta que entra con fade + translateY + scale, 220ms.
 */
export function ConfirmDialog({ visible, kind, title, text, ctaLabel, onClose }: Props) {
  const { palette, semantic } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 220,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const color = kind === "error" ? semantic.gasto : semantic.ingreso;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        backgroundColor: "rgba(6,14,11,.55)",
        alignItems: "center",
        justifyContent: "center",
        padding: 26,
      }}
    >
      <Animated.View
        style={{
          width: "100%",
          maxWidth: 330,
          backgroundColor: palette.surface2,
          borderWidth: 1,
          borderColor: palette.line,
          borderRadius: 26,
          paddingVertical: 32,
          paddingHorizontal: 26,
          alignItems: "center",
          gap: 13,
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
          ],
        }}
      >
        <View
          style={{
            width: 66,
            height: 66,
            borderRadius: 999,
            borderWidth: 2.5,
            borderColor: color,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color, fontSize: 26, fontFamily: fonts.bodyBold }}>{kind === "error" ? "!" : "✓"}</Text>
        </View>
        <Text style={{ fontFamily: fonts.displayRegular, fontSize: 23, color, textAlign: "center" }}>{title}</Text>
        <Text style={{ fontSize: 14, lineHeight: 22, color: palette.dim, textAlign: "center" }}>{text}</Text>
        <Pressable
          onPress={onClose}
          style={{
            marginTop: 8,
            width: "100%",
            borderWidth: 1,
            borderColor: color,
            borderRadius: 12,
            paddingVertical: 15,
            alignItems: "center",
          }}
        >
          <Text style={{ color, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
            {ctaLabel ?? (kind === "error" ? "Volver" : "Listo")}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
