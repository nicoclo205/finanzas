import React, { useEffect, useRef, useState } from "react";
import Svg, { Path, Line } from "react-native-svg";

const WAVE_D =
  "M0 22 C 20 22 24 6 40 8 C 56 10 60 36 80 32 C 100 28 104 10 124 12 C 144 14 148 34 168 30 C 188 26 192 8 212 11 C 228 13 232 24 240 22";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type Props = {
  variant?: "chart" | "loading";
  color: string;
  lineColor: string;
  width?: number;
  height?: number;
};

export function BalanceLine({ variant = "chart", color, lineColor, width = 240, height = 44 }: Props) {
  const from = variant === "chart" ? 760 : 0;
  const to = variant === "chart" ? 0 : -560;
  const [dashoffset, setDashoffset] = useState(from);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startRef.current = null;
    const duration = variant === "chart" ? 1400 : 1800;

    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = now - startRef.current;

      if (variant === "chart") {
        const t = Math.min(1, elapsed / duration);
        setDashoffset(from + (to - from) * easeOutCubic(t));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      } else {
        const t = (elapsed % duration) / duration;
        setDashoffset(from + (to - from) * t);
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [variant]);

  return (
    <Svg viewBox="0 0 240 44" width={width} height={height}>
      <Line x1={0} y1={22} x2={240} y2={22} stroke={lineColor} strokeWidth={1} strokeDasharray="3 5" />
      <Path
        d={WAVE_D}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={variant === "chart" ? "760" : "70 690"}
        strokeDashoffset={dashoffset}
      />
    </Svg>
  );
}
