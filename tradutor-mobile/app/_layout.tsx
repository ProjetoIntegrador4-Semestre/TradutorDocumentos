// app/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "../i18n"; // se você usa i18n
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { LangProvider } from "../context/LangContext";

function Inner() {
  const { theme, resolved } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <StatusBar style={resolved === "dark" ? "light" : "dark"} />
      <Slot />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LangProvider>
          <Inner />
        </LangProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
