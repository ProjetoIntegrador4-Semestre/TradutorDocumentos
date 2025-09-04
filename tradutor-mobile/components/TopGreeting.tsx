import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function TopGreeting() {
  const { user } = useAuth();
  const { theme } = useTheme();
  return (
    <View style={{ backgroundColor: theme.colors.headerBg, paddingVertical: 10, paddingHorizontal: 16 }}>
      <Text style={{ color: theme.colors.headerText }}>Bem vindo {user?.name ?? "Usuário(a)"}</Text>
    </View>
  );
}
