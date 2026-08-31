import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, G, Filter, FeGaussianBlur } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

type Props = {
  desktop: boolean;
};

function withAlpha(rgb: string, alpha: number) {
  return `rgba(${rgb},${alpha})`;
}

export function BackgroundWaves({ desktop }: Props) {
  const { theme } = useTheme();
  const dark = theme === "oscuro";
  const base = dark ? "233,230,220" : "27,24,19";
  const accentBase = dark ? "185,154,75" : "150,118,46";

  const waveA = withAlpha(base, desktop ? (dark ? 0.075 : 0.065) : dark ? 0.13 : 0.11);
  const waveB = withAlpha(accentBase, desktop ? (dark ? 0.09 : 0.08) : dark ? 0.16 : 0.14);
  const waveC = withAlpha(base, desktop ? (dark ? 0.095 : 0.085) : dark ? 0.16 : 0.13);
  const waveNone = withAlpha(base, 0);
  const blur = desktop ? 10 : 18;

  return (
    <Svg
      viewBox="0 0 1200 800"
      preserveAspectRatio={desktop ? "none" : "xMinYMid slice"}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="waveGrad1" x1="0" y1="0" x2="0.55" y2="1">
          <Stop offset="0" stopColor={waveA} />
          <Stop offset="1" stopColor={waveNone} />
        </LinearGradient>
        <LinearGradient id="waveGrad2" x1="1" y1="0" x2="0.2" y2="1">
          <Stop offset="0" stopColor={waveB} />
          <Stop offset="1" stopColor={waveNone} />
        </LinearGradient>
        <LinearGradient id="waveGrad3" x1="0.2" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor={waveC} />
          <Stop offset="1" stopColor={waveNone} />
        </LinearGradient>
        <Filter id="waveBlur">
          <FeGaussianBlur stdDeviation={blur} />
        </Filter>
      </Defs>
      <G filter="url(#waveBlur)">
        <Path
          d="M0 300 C 300 240 520 420 800 340 C 980 288 1100 200 1200 150 L1200 800 L0 800 Z"
          fill="url(#waveGrad1)"
        />
        <Path
          d="M0 480 C 260 430 480 620 760 540 C 960 484 1100 400 1200 360 L1200 800 L0 800 Z"
          fill="url(#waveGrad2)"
        />
        <Path
          d="M0 660 C 300 610 500 760 820 700 C 1020 662 1120 620 1200 590 L1200 800 L0 800 Z"
          fill="url(#waveGrad3)"
        />
      </G>
    </Svg>
  );
}
