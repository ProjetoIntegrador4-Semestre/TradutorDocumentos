import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import Input from "../../components/Input";
import GoogleButton from "../../components/GoogleButton";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const router = useRouter();

  async function onRegister() {
    if (pwd !== confirm) return Alert.alert("Atenção", "Senhas não conferem");
    try {
      await signUp(name, email, pwd);
      router.replace("/(tabs)/translator");
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha no cadastro");
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
      <View style={{ flexDirection: "row", justifyContent: "center", columnGap: 20, marginBottom: 16 }}>
        <Link href="/(auth)/login" asChild><TouchableOpacity><Text style={{ color: "#2b64ff" }}>Login</Text></TouchableOpacity></Link>
        <Text style={{ color: "#2b64ff", fontWeight: "700" }}>Cadastre -se</Text>
      </View>

      <Text style={{ color: "#555", marginBottom: 16 }}>
        Registre-se em poucos passos e tenha acesso a um serviço de tradução completo.
      </Text>

      <Input label="Nome" placeholder="Insira seu nome..." value={name} onChangeText={setName} />
      <Input label="Email" placeholder="Insira seu email..." value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Senha" placeholder="Insira sua senha..." value={pwd} onChangeText={setPwd} secure />
      <Input label="Confirmar Senha" placeholder="Confirme sua senha..." value={confirm} onChangeText={setConfirm} secure />

      <TouchableOpacity onPress={onRegister} style={{ backgroundColor: "#2b4bff", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 4 }}>
        <Text style={{ color: "#fff", fontWeight: "700", letterSpacing: 2 }}>LOGIN</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 18 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#cfcfcf" }} />
        <Text style={{ marginHorizontal: 8, color: "#888" }}>OU</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#cfcfcf" }} />
      </View>

      <GoogleButton title="CADASTRAR COM GOOGLE" onPress={() => Alert.alert("Google", "Integrar Google Sign-In aqui")} />
    </View>
  );
}
