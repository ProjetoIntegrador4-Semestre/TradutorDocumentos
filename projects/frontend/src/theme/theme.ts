import { createTheme } from "@mui/material/styles";

export const getDesignTokens = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#1976D2" },
      secondary: { main: "#00BFA6" },
      background: {
        default: mode === "light" ? "#ECEFF1" : "#0F172A",  
        paper: mode === "light" ? "#FDFDFD" : "#121826",     
      },
      text: {
        primary: mode === "light" ? "#1E293B" : "#E2E8F0",
        secondary: mode === "light" ? "#475569" : "#94A3B8",
      },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: mode === "light" ? "1px solid #D0D7DE" : "none",
            boxShadow: mode === "light" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 12,
            fontWeight: 600,
          },
        },
      },
    },
    typography: {
      fontFamily: `"Inter","Roboto","Helvetica","Arial",sans-serif`,
      h5: { fontWeight: 700 },
    },
  });

