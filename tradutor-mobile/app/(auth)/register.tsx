import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import Input from "../../components/Input";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onRegister() {
    if (pwd !== confirm) return Alert.alert("Atenção", "Senhas não conferem");
    try {
      setSubmitting(true);
      await signUp(name.trim(), email.trim().toLowerCase(), pwd);
      router.replace("/translator"); // sem (tabs)
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha no cadastro");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
      <View style={{ flexDirection: "row", justifyContent: "center", columnGap: 20, marginBottom: 16 }}>
        {/* Link simples (sem asChild) */}
        <Link href="/login" style={{ color: "#2b64ff" }}>
          Login
        </Link>
        <Text style={{ color: "#2b64ff", fontWeight: "700" }}>Cadastre-se</Text>
      </View>

      <Text style={{ color: "#555", marginBottom: 16 }}>
        Registre-se em poucos passos e tenha acesso a um serviço de tradução completo.
      </Text>

      <Input label="Nome" placeholder="Insira seu nome..." value={name} onChangeText={setName} />
      <Input label="Email" placeholder="Insira seu email..." value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Senha" placeholder="Insira sua senha..." value={pwd} onChangeText={setPwd} secure />
      <Input label="Confirmar Senha" placeholder="Confirme sua senha..." value={confirm} onChangeText={setConfirm} secure />

      <TouchableOpacity
        onPress={onRegister}
        disabled={submitting}
        style={{ backgroundColor: "#2b4bff", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 4, opacity: submitting ? 0.7 : 1 }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", letterSpacing: 2 }}>
          {submitting ? "Criando..." : "CRIAR CONTA"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
