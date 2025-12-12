import { createTheme } from "@mui/material/styles";

export const getDesignTokens = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#1976D2" },
      secondary: { main: "#00BFA6" },
      background: {
        default: mode === "light" ? "#ECEFF1" : "#18233dff",
        paper: mode === "light" ? "#FFFFFF" : "#121826",
      },
      text: {
        primary: mode === "light" ? "#314461ff" : "#E2E8F0",
        secondary: mode === "light" ? "#475569" : "#94A3B8",
      },
      divider: mode === "light"
        ? "rgba(2,6,23,0.08)"
        : "rgba(148,163,184,0.2)",
    },
    shape: { borderRadius: 12 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow:
              mode === "light"
                ? "0 2px 8px rgba(2,6,23,0.06)"
                : "0 2px 14px rgba(0,0,0,0.35)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 12, fontWeight: 600 },
        },
      },
    },
    typography: {
      fontFamily: `"Inter","Roboto","Helvetica","Arial",sans-serif`,
      h5: { fontWeight: 700 },
    },
  });
