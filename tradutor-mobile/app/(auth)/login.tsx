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
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function onLogin() {
    try {
      setErrorMsg(""); // Limpa erro anterior
      
      if (!email.trim() || !pwd.trim()) {
        setErrorMsg("Preencha e-mail e senha.");
        return;
      }
      
      setSubmitting(true);
      await signIn(email.trim().toLowerCase(), pwd);
      router.replace("/translator"); // sem (tabs)
    } catch (e: any) {
      console.log("=== ERRO NO LOGIN ===");
      console.log("Erro completo:", e);
      console.log("Status:", e?.status);
      console.log("Message:", e?.message);
      
      let errorMessage = e?.message ?? "Falha no login";
      
      // Verifica se é erro de senha incorreta
      if (e?.status === 401 || errorMessage.toLowerCase().includes("credenciais") || 
          errorMessage.toLowerCase().includes("senha") || errorMessage.toLowerCase().includes("password") ||
          errorMessage.toLowerCase().includes("incorrect") || errorMessage.toLowerCase().includes("invalid")) {
        errorMessage = "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.";
      } else if (e?.status === 404) {
        errorMessage = "Usuário não encontrado. Verifique o e-mail ou crie uma nova conta.";
      }
      
      console.log("Mensagem final:", errorMessage);
      setErrorMsg(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f2f2f2" }}>
      <View style={{ flexDirection: "row", justifyContent: "center", columnGap: 20, marginBottom: 16 }}>
        <Text style={{ color: "#2b64ff", fontWeight: "700" }}>Login</Text>

        {/* trocamos Link asChild por Link simples para evitar SlotClone */}
        <Link href="/register" style={{ color: "#2b64ff" }}>
          Cadastre-se
        </Link>
      </View>

      <Text style={{ color: "#555", marginBottom: 16 }}>
        Faça login para traduzir seus documentos de forma rápida e segura. Com sua conta, você
        acompanha o progresso das traduções e tem acesso ao histórico.
      </Text>

      {errorMsg ? (
        <View style={{ backgroundColor: "#fee", borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#fcc" }}>
          <Text style={{ color: "#c00", fontSize: 14 }}>{errorMsg}</Text>
        </View>
      ) : null}

      <Input
        label="Email"
        placeholder="Insira seu email..."
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrorMsg(""); // Limpa erro ao digitar
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Input
        label="Senha"
        placeholder="Insira sua senha..."
        value={pwd}
        onChangeText={(text) => {
          setPwd(text);
          setErrorMsg(""); // Limpa erro ao digitar
        }}
        secure
      />

      <View style={{ alignItems: "flex-end", marginTop: 6 }}>
        <TouchableOpacity onPress={() => router.push("/forgot")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ color: "#2b64ff", fontWeight: "600" }}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 12 }}>
        <TouchableOpacity
          onPress={onLogin}
          disabled={submitting}
          style={{ backgroundColor: "#2b4bff", borderRadius: 8, paddingVertical: 14, alignItems: "center", opacity: submitting ? 0.7 : 1 }}
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

      <GoogleButton onPress={() => Alert.alert("Google", "Integração Google será ativada depois")} />
    </View>
  );
}
