import React, { useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { DESKTOP_BREAKPOINT } from "../theme/layout";
import { BackgroundWaves } from "./BackgroundWaves";
import { Nav } from "./Nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { palette } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_BREAKPOINT;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.bg,
        overflow: "hidden",
        flexDirection: desktop ? "row" : "column-reverse",
      }}
    >
      <BackgroundWaves desktop={desktop} />
      <Nav desktop={desktop} collapsed={desktop && collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
    </View>
  );
}
