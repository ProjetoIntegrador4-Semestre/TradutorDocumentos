
import React from "react";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "../context/AuthContext";      
import { ThemeProvider, useTheme } from "../context/ThemeContext";

function Frame() {
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
        <Frame />
      </ThemeProvider>
    </AuthProvider>
  );
}
