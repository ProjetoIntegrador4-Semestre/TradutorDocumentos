import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function TopGreeting() {
  const { user } = useAuth();
  return (
    <View style={{ backgroundColor: "#1c1c1e", paddingVertical: 10, paddingHorizontal: 16 }}>
      <Text style={{ color: "#fff" }}>Bem vindo {user?.name ?? "Usuário(a)"}</Text>
    </View>
  );
}
