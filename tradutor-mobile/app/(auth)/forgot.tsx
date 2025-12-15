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
      "Pronto",
      "Se esse e-mail existir, você receberá um link para redefinir a senha."
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.bg }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: theme.colors.text, marginBottom: 12 }}>
        Esqueci minha senha
      </Text>

      <Text style={{ color: theme.colors.muted, marginBottom: 12 }}>
        Digite seu e-mail e enviaremos um link para redefinir sua senha.
      </Text>

      <Text style={{ color: theme.colors.text, marginBottom: 6 }}>E-mail</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 6,
          padding: 10,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
        }}
        placeholder="email@exemplo.com"
      />

      <TouchableOpacity
        onPress={onSend}
        style={{
          marginTop: 16,
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.colors.primaryText, fontWeight: "700" }}>
          Enviar link
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("/login")}
        style={{ marginTop: 12, alignItems: "center" }}
      >
        <Text style={{ color: theme.colors.text }}>Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );
}
