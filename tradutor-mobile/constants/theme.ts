
export type Colors = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  border: string;
  shadow: string;
  headerBg: string;
  headerText: string;
};

export type Theme = {
  colors: Colors;
  radius: number;
  spacing: number;
};

export const lightColors: Colors = {
  bg: "#F6F7F9",
  surface: "#FFFFFF",
  text: "#151718",
  muted: "#6B7280",
  primary: "#3B82F6",
  primaryText: "#FFFFFF",
  border: "#E5E7EB",
  shadow: "rgba(16, 24, 40, 0.08)",
  headerBg: "#1F2937",
  headerText: "#FFFFFF",
};

export const darkColors: Colors = {
  bg: "#0B0F14",
  surface: "#111418",
  text: "#E5E7EB",
  muted: "#9CA3AF",
  primary: "#60A5FA",
  primaryText: "#0B0F14",
  border: "#1F2937",
  shadow: "rgba(0, 0, 0, 0.5)",
  headerBg: "#0B0F14",
  headerText: "#E5E7EB",
};

const makeTheme = (colors: Colors): Theme => ({ colors, radius: 12, spacing: 16 });

export const THEMES: Record<"light" | "dark", Theme> = {
  light: makeTheme(lightColors),
  dark: makeTheme(darkColors),
};

export type ThemeName = keyof typeof THEMES;
export const getTheme = (name: ThemeName): Theme => THEMES[name];


export const theme: Theme = THEMES.light;

export default THEMES;
