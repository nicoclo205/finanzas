import React, { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../theme/ThemeContext";
import { fonts } from "../theme/fonts";

type NavItem = { key: string; label: string; glyph: string; route: string };

const ITEMS: NavItem[] = [
  { key: "list", label: "Listado", glyph: "≡", route: "/" },
  { key: "form", label: "Registrar", glyph: "+", route: "/registrar" },
  { key: "settings", label: "Ajustes", glyph: "✳", route: "/ajustes" },
];

const EXPANDED_WIDTH = 236;
const COLLAPSED_WIDTH = 78;
const EXPANDED_PAD = 20;
const COLLAPSED_PAD = 26;
const COLLAPSED_ITEM_SIZE = 44;
const DURATION = 300;
const EASING = Easing.bezier(0.2, 0.8, 0.2, 1);

type Props = {
  desktop: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function Nav({ desktop, collapsed, onToggleCollapse }: Props) {
  const { palette } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const progress = useRef(new Animated.Value(collapsed ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: collapsed ? 1 : 0,
      duration: DURATION,
      easing: EASING,
      useNativeDriver: false,
    }).start();
  }, [collapsed]);

  const width = desktop
    ? progress.interpolate({ inputRange: [0, 1], outputRange: [EXPANDED_WIDTH, COLLAPSED_WIDTH] })
    : "100%";
  const padding = desktop
    ? progress.interpolate({ inputRange: [0, 1], outputRange: [EXPANDED_PAD, COLLAPSED_PAD] })
    : 10;
  const labelWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [160, 0] });
  const labelOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const labelGap = progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <Animated.View
      style={{
        flexDirection: desktop ? "column" : "row",
        width,
        padding,
        gap: desktop ? 4 : 2,
        backgroundColor: palette.surface,
        borderTopWidth: desktop ? 0 : 1,
        borderRightWidth: desktop ? 1 : 0,
        borderColor: palette.line,
        alignItems: desktop ? (collapsed ? "center" : "stretch") : "center",
        overflow: "hidden",
      }}
    >
      {desktop && (
        <Pressable onPress={onToggleCollapse} style={{ alignSelf: "flex-end", padding: 6, marginBottom: 12 }}>
          <Text style={{ color: palette.dim, fontFamily: fonts.monoRegular, fontSize: 13 }}>
            {collapsed ? "»" : "«"}
          </Text>
        </Pressable>
      )}
      {ITEMS.map((item) => {
        const active = item.route === "/" ? pathname === "/" : pathname.startsWith(item.route);
        return (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as any)}
            style={
              collapsed
                ? {
                    width: COLLAPSED_ITEM_SIZE,
                    height: COLLAPSED_ITEM_SIZE,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    backgroundColor: active ? `${palette.accent}24` : "transparent",
                  }
                : {
                    flex: desktop ? undefined : 1,
                    flexDirection: desktop ? "row" : "column",
                    alignItems: "center",
                    justifyContent: desktop ? "flex-start" : "center",
                    paddingVertical: desktop ? 13 : 10,
                    paddingHorizontal: desktop ? 14 : 4,
                    borderRadius: 12,
                    backgroundColor: active ? `${palette.accent}24` : "transparent",
                  }
            }
          >
            <Text
              style={{
                color: active ? palette.accent : palette.dim,
                fontSize: desktop ? 16 : 14,
                lineHeight: desktop ? 16 : 14,
                textAlign: "center",
                textAlignVertical: "center",
              }}
            >
              {item.glyph}
            </Text>
            {desktop && !collapsed ? (
              <Animated.View style={{ width: labelWidth, marginLeft: labelGap, opacity: labelOpacity, overflow: "hidden" }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: active ? palette.accent : palette.dim,
                    fontFamily: fonts.bodySemiBold,
                    fontSize: 15,
                  }}
                >
                  {item.label}
                </Text>
              </Animated.View>
            ) : !desktop ? (
              <Text
                style={{
                  color: active ? palette.accent : palette.dim,
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 11,
                  marginTop: 6,
                }}
              >
                {item.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </Animated.View>
  );
}
