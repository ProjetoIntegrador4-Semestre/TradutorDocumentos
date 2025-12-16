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
  bg: "#F6F7F9",  // Cor de fundo claro
  surface: "#FFFFFF",  // Cor das superfícies
  text: "#111827",  // Cor do texto
  muted: "#6B7280",  // Texto suave
  primary: "#3B82F6",  // Cor dos botões
  primaryText: "#FFFFFF",  // Cor do texto dentro de botões
  border: "#E5E7EB",  // Cor das bordas
  shadow: "rgba(16, 24, 40, 0.08)",  // Sombra suave
  headerBg: "#1F2937",  // Cor do cabeçalho
  headerText: "#FFFFFF",  // Texto do cabeçalho
};

export const darkColors: Colors = {
  bg: "#18243e",  // Cor de fundo escuro
  surface: "#1F2937",  // Cor de superfície mais escura
  text: "#ddddddff",  // Cor do texto claro
  muted: "#c3bcbcff",  // Cor de texto suave no modo escuro
  primary: "#212bb9ff",  // Azul claro, cor principal dos botões
  primaryText: "#262b32ff",  // Cor do texto no botão
  border: "#2B2B2B",  // Cor das bordas escuras
  shadow: "rgba(0, 0, 0, 0.5)",  // Sombra escura
  headerBg: "#1F2937",  // Cor de fundo do cabeçalho
  headerText: "#E5E7EB",  // Texto do cabeçalho
};


const makeTheme = (colors: Colors): Theme => ({ colors, radius: 12, spacing: 16 });

export const THEMES: Record<"light" | "dark", Theme> = {
  light: makeTheme(lightColors),
  dark: makeTheme(darkColors),
};

export type ThemeName = keyof typeof THEMES;
export const getTheme = (name: ThemeName): Theme => THEMES[name];

export const theme: Theme = THEMES.dark;  // Usando o tema escuro por padrão

export default THEMES;
