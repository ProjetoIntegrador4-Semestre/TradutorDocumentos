import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme"; 

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "ios" ? Math.max(8, insets.bottom) : 8;
  const baseHeight = 56;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500", marginBottom: 2 },
        tabBarStyle: {
          height: baseHeight + (Platform.OS === "ios" ? insets.bottom : 0),
          paddingTop: 6,
          paddingBottom: bottomPad,
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="translator"
        options={{ title: "Tradutor", tabBarIcon: ({ color, size }) => <Ionicons name="language" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: "Histórico", tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="folders"
        options={{ title: "Pastas", tabBarIcon: ({ color, size }) => <Ionicons name="folder-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
