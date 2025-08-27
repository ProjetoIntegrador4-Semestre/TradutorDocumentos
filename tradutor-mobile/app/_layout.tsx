import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </AuthProvider>
  );
}
