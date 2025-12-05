// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";  // << IMPORTANTE

export default function TabsLayout() {
  const { theme } = useTheme();
  const { user } = useAuth(); // << AQUI PEGAMOS O USER

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let name: any = "help-circle-outline";

          if (route.name === "translator")
            name = focused ? "document-text" : "document-text-outline";
          if (route.name === "history")
            name = focused ? "time" : "time-outline";
          if (route.name === "folders")
            name = focused ? "folder" : "folder-outline";
          if (route.name === "settings")
            name = focused ? "settings" : "settings-outline";

          // Ícone da aba Admin
          if (route.name === "admin")
            name = focused ? "shield" : "shield-outline";

          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="translator" options={{ title: "Tradutor" }} />
      <Tabs.Screen name="history" options={{ title: "Histórico" }} />
      <Tabs.Screen name="folders" options={{ title: "Pastas" }} />
      <Tabs.Screen name="settings" options={{ title: "Config." }} />

      {/* 🔥 Adiciona a aba Admin SOMENTE SE o usuário for admin */}
      {user?.role === "admin" && (
        <Tabs.Screen name="admin" options={{ title: "Admin" }} />
      )}
    </Tabs>
  );
}
