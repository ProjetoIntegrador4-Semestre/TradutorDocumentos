import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { THEMES } from "../constants/theme";


type Mode = "light" | "dark" | "system";
type ThemeCtx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  resolved: "light" | "dark";
  theme: typeof THEMES.light;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = (useColorScheme() || "light") as "light" | "dark";
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("@theme_mode");
      if (saved === "light" || saved === "dark" || saved === "system") setMode(saved);
    })();
  }, []);

  useEffect(() => { AsyncStorage.setItem("@theme_mode", mode).catch(() => {}); }, [mode]);

  const resolved = mode === "system" ? system : mode;
  const theme = useMemo(() => (resolved === "dark" ? THEMES.dark : THEMES.light), [resolved]);

  return <Ctx.Provider value={{ mode, setMode, resolved, theme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used within ThemeProvider");
  return v;
}
