// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import Input from "../../components/Input";
import GoogleButton from "../../components/GoogleButton";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onLogin() {
    try {
      if (!email.trim() || !pwd.trim()) {
        return Alert.alert("Ops", "Preencha e-mail e senha.");
      }
      setSubmitting(true);
      await signIn(email.trim().toLowerCase(), pwd);
      router.replace("/(tabs)/translator");
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha no login");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
      <View style={{ flexDirection: "row", justifyContent: "center", columnGap: 20, marginBottom: 16 }}>
        <Text style={{ color: "#2b64ff", fontWeight: "700" }}>Login</Text>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity>
            <Text style={{ color: "#2b64ff" }}>Cadastre-se</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text style={{ color: "#555", marginBottom: 16 }}>
        Faça login para traduzir seus documentos de forma rápida e segura. Com sua conta, você acompanha o progresso das traduções e tem acesso ao histórico.
      </Text>

      <Input
        label="Email"
        placeholder="Insira seu email..."
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Input
        label="Senha"
        placeholder="Insira sua senha..."
        value={pwd}
        onChangeText={setPwd}
        secure
      />

      <View style={{ alignItems: "flex-end", marginTop: 6 }}>
        <TouchableOpacity onPress={() => router.push("/(auth)/forgot")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: "#2b64ff", fontWeight: "600" }}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 12 }}>
        <TouchableOpacity
          onPress={onLogin}
          disabled={submitting}
          style={{
            backgroundColor: "#2b4bff",
            borderRadius: 8,
            paddingVertical: 14,
            alignItems: "center",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", letterSpacing: 2 }}>
            {submitting ? "Entrando..." : "LOGIN"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 18 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#cfcfcf" }} />
        <Text style={{ marginHorizontal: 8, color: "#888" }}>OU</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#cfcfcf" }} />
      </View>

      <GoogleButton
        title="LOGIN COM GOOGLE"
        onPress={async () => {
          try {
            await signInWithGoogle();
          } catch (e: any) {
            Alert.alert("Google", e?.message ?? "Falha no login com Google");
          }
        }}
      />
    </View>
  );
}
