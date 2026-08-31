import React from "react";
import { Slot } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";
import { useAppFonts } from "../theme/fonts";
import { AppShell } from "../components/AppShell";
import { SettingsProvider } from "../lib/SettingsContext";

function Root() {
  const [fontsLoaded] = useAppFonts();
  const { palette } = useTheme();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.shell }}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Root />
      </SettingsProvider>
    </ThemeProvider>
  );
}
