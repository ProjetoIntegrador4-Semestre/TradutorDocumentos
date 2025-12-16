import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { Picker } from "@react-native-picker/picker";
import { LANGUAGES } from "../../constants/languages";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router"; // Importando o router para navegação

export default function Settings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const { theme, setTheme, mode, setMode } = useTheme();
  const { lang, setLang } = useLang();
  const { t } = useTranslation();
  const router = useRouter(); // Usando o router para navegação

  // Atualiza o nome e o email caso o user seja alterado no contexto
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const Chip = ({ label, value }: { label: string; value: "light" | "dark" }) => (
    <TouchableOpacity
      onPress={() => setMode(value)} // Usando setMode para alternar o modo
      style={{
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: value === mode ? theme.colors.primary : theme.colors.surface, // Alterando cor do fundo com base no tema
        marginRight: 12,
        marginTop: 10,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      }}
    >
      <Text
        style={{
          color: value === mode ? "#fff" : theme.colors.primary,
          fontWeight: "700",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Função para realizar o logout e redirecionar para a tela de login
  const handleLogout = async () => {
    await signOut(); // Chama a função de logout
    router.replace("/login"); // Redireciona para a tela de login
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingHorizontal: 16, paddingVertical: 20 }}>
      <TopGreeting />

      <View style={{ alignSelf: "center", width: 120, height: 120, borderRadius: 60, backgroundColor: "#d9d9d9", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <Text style={{ fontSize: 50, color: "#777" }}>👤</Text>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 15,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: 20,
          elevation: 2, // Android shadow
          shadowColor: theme.colors.primary, // IOS shadow
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 8 }}>{t("settings.name")}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          editable={false} // Faz o campo de nome não ser editável
          style={{
            backgroundColor: theme.colors.bg,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 12,
            color: theme.colors.text,
            marginBottom: 16,
          }}
        />

        <Text style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 8 }}>{t("settings.email")}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          editable={false} // Faz o campo de email não ser editável
          style={{
            backgroundColor: theme.colors.bg,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 12,
            color: theme.colors.text,
            marginBottom: 16,
          }}
        />

        <Text style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 8 }}>{t("settings.language")}</Text>
        <Picker
          selectedValue={lang}
          onValueChange={(value) => setLang(value)}
          style={{
            backgroundColor: theme.colors.surface, // Cor de fundo
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.border, // Cor da borda
            color: theme.colors.text, // Cor do texto
            paddingVertical: 12,
            marginBottom: 16,
          }}
        >
          {LANGUAGES.map((l) => (
            <Picker.Item key={l.code} label={l.label} value={l.code} />
          ))}
        </Picker>

        <Text style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 8 }}>{t("settings.theme")}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <Chip label={t("settings.light")} value="light" />
          <Chip label={t("settings.dark")} value="dark" />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout} // Usando a função de logout
        style={{
          backgroundColor: "#d82626",
          borderRadius: 8,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>{t("settings.logout")}</Text>
      </TouchableOpacity>
    </View>
  );
}
