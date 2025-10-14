import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getDesignTokens } from "../theme/theme";

type Ctx = { mode: "light" | "dark"; toggle: () => void };
export const ThemeModeContext = React.createContext<Ctx>({ mode: "light", toggle: () => {} });

export default function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "dark"
  );

  const theme = React.useMemo(() => getDesignTokens(mode), [mode]);

  const toggle = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("theme", next);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
