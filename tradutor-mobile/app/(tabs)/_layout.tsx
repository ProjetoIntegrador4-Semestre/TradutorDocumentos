// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";  // << IMPORTANTE

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth(); // << AQUI PEGAMOS O USER
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 6,
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
      <Tabs.Screen name="translator" options={{ title: t('tabs.translator') }} />
      <Tabs.Screen name="history" options={{ title: t('tabs.history') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />

      {/* 🔥 Adiciona a aba Admin SOMENTE SE o usuário for admin */}
      {user?.role === "admin" && (
        <Tabs.Screen name="admin" options={{ title: t('tabs.admin') }} />
      )}
      
      {/* Esconde a tela AdminScreen da navegação */}
      <Tabs.Screen 
        name="AdminScreen" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}
