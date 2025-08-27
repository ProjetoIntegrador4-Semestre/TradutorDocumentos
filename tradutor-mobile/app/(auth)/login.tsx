import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import Input from "../../components/Input";
import GoogleButton from "../../components/GoogleButton";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const router = useRouter();

  async function onLogin() {
    try {
      await signIn(email, pwd);
      router.replace("/(tabs)/translator");
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha no login");
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
      <View style={{ flexDirection: "row", justifyContent: "center", columnGap: 20, marginBottom: 16 }}>
        <Text style={{ color: "#2b64ff", fontWeight: "700" }}>Login</Text>
        <Link href="/(auth)/register" asChild><TouchableOpacity><Text style={{ color: "#2b64ff" }}>Cadastre -se</Text></TouchableOpacity></Link>
      </View>

      <Text style={{ color: "#555", marginBottom: 16 }}>
        Faça login para traduzir seus documentos de forma rápida e segura. Com sua conta, você acompanha o progresso das traduções e tem acesso ao histórico.
      </Text>

      <Input label="Email" placeholder="Insira seu email..." value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Senha" placeholder="Insira sua senha..." value={pwd} onChangeText={setPwd} secure />

      <View style={{ marginTop: 8 }}>
        <TouchableOpacity onPress={onLogin} style={{ backgroundColor: "#2b4bff", borderRadius: 8, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700", letterSpacing: 2 }}>LOGIN</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 18 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#cfcfcf" }} />
        <Text style={{ marginHorizontal: 8, color: "#888" }}>OU</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#cfcfcf" }} />
      </View>

      <GoogleButton onPress={() => Alert.alert("Google", "Integrar Google Sign-In aqui")} />
    </View>
  );
}
