export type ThemeName = "oscuro" | "claro";

export type Palette = {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  dim: string;
  line: string;
  accent: string;
  shell: string;
};

export const semantic = {
  ingreso: "#6FA98A",
  gasto: "#B0563E",
};

export const palettes: Record<ThemeName, Palette> = {
  oscuro: {
    bg: "#131211",
    surface: "#1B1A17",
    surface2: "#23211D",
    text: "#E9E6DC",
    dim: "rgba(233,230,220,.55)",
    line: "rgba(233,230,220,.11)",
    accent: "#B99A4B",
    shell: "#0C0B0A",
  },
  claro: {
    bg: "#F4F1EA",
    surface: "#EAE6DB",
    surface2: "#DFDACC",
    text: "#1B1813",
    dim: "rgba(27,24,19,.58)",
    line: "rgba(27,24,19,.14)",
    accent: "#96762E",
    shell: "#D9D3C4",
  },
};
