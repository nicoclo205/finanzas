import React, { useEffect, useRef, useState } from "react";
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
  /** Si se pasa, aparece un segundo botón "cancelar" bajo el principal (confirmaciones destructivas). */
  cancelLabel?: string;
  onCancel?: () => void;
};

const ENTER_MS = 260;
const EXIT_MS = 170;

/**
 * Diálogo de confirmación "om-pop": fondo semitransparente que aparece con fade
 * y tarjeta que entra con translateY + scale. Al cerrarse también anima la salida
 * (en vez de desaparecer de golpe), conservando el último contenido mostrado
 * mientras dura el fade-out.
 */
export function ConfirmDialog({ visible, kind, title, text, ctaLabel, onClose, cancelLabel, onCancel }: Props) {
  const { palette, semantic } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const last = useRef({ kind, title, text, ctaLabel, cancelLabel, hasCancel: !!onCancel });

  if (visible) last.current = { kind, title, text, ctaLabel, cancelLabel, hasCancel: !!onCancel };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.setValue(0);
      const enter = Animated.timing(progress, {
        toValue: 1,
        duration: ENTER_MS,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: true,
      });
      enter.start();
      return () => enter.stop();
    }
    const exit = Animated.timing(progress, {
      toValue: 0,
      duration: EXIT_MS,
      easing: Easing.bezier(0.4, 0, 1, 1),
      useNativeDriver: true,
    });
    exit.start(({ finished }) => {
      if (finished) setMounted(false);
    });
    return () => exit.stop();
  }, [visible]);

  if (!visible && !mounted) return null;

  const shown = last.current;
  const color = shown.kind === "error" ? semantic.gasto : semantic.ingreso;

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
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
        opacity: progress,
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
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
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
          <Text style={{ color, fontSize: 26, fontFamily: fonts.bodyBold }}>{shown.kind === "error" ? "!" : "✓"}</Text>
        </View>
        <Text style={{ fontFamily: fonts.displayRegular, fontSize: 23, color, textAlign: "center" }}>
          {shown.title}
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 22, color: palette.dim, textAlign: "center" }}>{shown.text}</Text>
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
            {shown.ctaLabel ?? (shown.kind === "error" ? "Volver" : "Listo")}
          </Text>
        </Pressable>
        {shown.hasCancel && (
          <Pressable
            onPress={onCancel}
            style={{ width: "100%", paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ color: palette.dim, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
              {shown.cancelLabel ?? "Cancelar"}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}
