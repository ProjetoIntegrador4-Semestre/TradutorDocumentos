import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  function onSend() {
    if (!email.trim()) {
      Alert.alert("Ops", "Informe seu e-mail.");
      return;
    }
    Alert.alert(
      "Esqueci minha senha",
      `Enviamos um link de redefinição para: ${email}`
    );
    router.replace("/(auth)/login");
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: theme.colors.text, marginBottom: 8 }}>
        Esqueci minha senha
      </Text>

      <Text style={{ color: theme.colors.muted, marginBottom: 16 }}>
        Digite seu e-mail para enviarmos um link de redefinição.
      </Text>

      <Text style={{ color: theme.colors.text, marginBottom: 6 }}>E-mail</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="email@exemplo.com"
        placeholderTextColor={theme.colors.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 10,
          padding: 12,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
        }}
      />

      <TouchableOpacity
        onPress={onSend}
        style={{
          marginTop: 16,
          backgroundColor: theme.colors.primary,
          borderRadius: 10,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.primaryText, fontWeight: "700" }}>
          Enviar link
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("/(auth)/login")}
        style={{ marginTop: 12, alignItems: "center" }}
      >
        <Text style={{ color: theme.colors.text }}>Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}
