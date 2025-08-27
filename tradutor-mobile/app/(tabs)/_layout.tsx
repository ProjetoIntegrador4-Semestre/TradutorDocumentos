import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="translator" options={{ title: "Tradutor", tabBarIcon: ({color, size}) => (<Ionicons name="language" color={color} size={size}/>) }} />
      <Tabs.Screen name="history"    options={{ title: "Histórico", tabBarIcon: ({color, size}) => (<Ionicons name="document-text-outline" color={color} size={size}/>) }} />
      <Tabs.Screen name="folders"    options={{ title: "Pastas", tabBarIcon: ({color, size}) => (<Ionicons name="folder-outline" color={color} size={size}/>) }} />
      <Tabs.Screen name="settings"   options={{ title: "Perfil",   tabBarIcon: ({color, size}) => (<Ionicons name="person-circle-outline" color={color} size={size}/>) }} />
    </Tabs>
  );
}
