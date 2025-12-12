// app/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import "../i18n"; 
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { LangProvider } from "../context/LangContext";

// Ignora warning do Expo Go sobre push notifications (não afeta funcionalidade)
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

function Inner() {
  const { theme, mode } = useTheme(); // Use 'mode' ao invés de 'resolved'
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
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
