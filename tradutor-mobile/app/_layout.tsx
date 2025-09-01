import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { theme } from "../constants/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </AuthProvider>
  );
}
