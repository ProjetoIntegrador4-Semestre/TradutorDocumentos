import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import { useAuth } from "../../context/AuthContext";
import { Picker } from "@react-native-picker/picker";
import { LANGUAGES } from "../../constants/languages";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const { theme, mode, setMode } = useTheme();
  const { lang, setLang } = useLang();
  const { t } = useTranslation();
  const router = useRouter();

  const Chip = ({ label, value }: { label: string; value: "light" | "dark" }) => (
    <TouchableOpacity
      onPress={() => setMode(value)}
      style={{
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
        borderWidth: 1, borderColor: mode === value ? theme.colors.primary : theme.colors.border,
        backgroundColor: mode === value ? "#EEF2FF" : theme.colors.surface, marginRight: 8,
      }}
    >
      <Text style={{ color: mode === value ? theme.colors.primary : theme.colors.muted, fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopGreeting />
      <View style={{ padding: 16, rowGap: 12 }}>
        <View style={{ alignSelf: "center", width: 120, height: 120, borderRadius: 60, backgroundColor: "#d9d9d9", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 42, color: "#777" }}>👤</Text>
        </View>

        <View style={{ backgroundColor: theme.colors.surface, borderRadius: 10, padding: 12, rowGap: 10, borderWidth: 1, borderColor: theme.colors.border }}>
          <Text style={{ color: theme.colors.text }}>{t("settings.name")}</Text>
          <TextInput value={name} onChangeText={setName} editable={false} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, padding: 10, color: theme.colors.text }} />
          <Text style={{ color: theme.colors.text }}>{t("settings.email")}</Text>
          <TextInput value={email} onChangeText={setEmail} editable={false} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 6, padding: 10, color: theme.colors.text }} />

          <Text style={{ color: theme.colors.text }}>{t("settings.language")}</Text>
          <Picker selectedValue={lang} onValueChange={(v) => setLang(String(v))}>
            {LANGUAGES.map((l) => <Picker.Item key={l.code} label={l.label} value={l.code} />)}
          </Picker>

          <Text style={{ color: theme.colors.text, marginTop: 6 }}>{t("settings.theme")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Chip label={t("settings.light")} value="light" />
            <Chip label={t("settings.dark")} value="dark" />
          </View>
        </View>

        <TouchableOpacity
          onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}
          style={{ backgroundColor: "#d82626", borderRadius: 8, paddingVertical: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>{t("settings.logout")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
