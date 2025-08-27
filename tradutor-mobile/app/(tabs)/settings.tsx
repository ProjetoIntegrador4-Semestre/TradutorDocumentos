import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Switch, TouchableOpacity } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import { useAuth } from "../../context/AuthContext";
import { Picker } from "@react-native-picker/picker";
import { LANGUAGES } from "../../constants/languages";
import { getDefaultLang, setDefaultLang } from "../../lib/storage";
import { useRouter } from "expo-router";

export default function Settings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [lang, setLang] = useState("pt");
  const [dark, setDark] = useState(false);
  const router = useRouter();

  useEffect(() => { (async () => { const d = await getDefaultLang(); if (d) setLang(d); })(); }, []);
  async function onLang(v: string) { setLang(v); await setDefaultLang(v); }

  return (
    <View style={{ flex: 1, backgroundColor: "#e9e9ea" }}>
      <TopGreeting />
      <View style={{ padding: 16, rowGap: 12 }}>
        <View style={{ alignSelf: "center", width: 120, height: 120, borderRadius: 60, backgroundColor: "#d9d9d9", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 42, color: "#777" }}>👤</Text>
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12, rowGap: 10 }}>
          <Text>Nome</Text>
          <TextInput value={name} onChangeText={setName} editable={false} style={{ borderWidth: 1, borderColor: "#dcdcdc", borderRadius: 6, padding: 10 }} />
          <Text>Email</Text>
          <TextInput value={email} onChangeText={setEmail} editable={false} style={{ borderWidth: 1, borderColor: "#dcdcdc", borderRadius: 6, padding: 10 }} />
          <Text>Idioma</Text>
          <Picker selectedValue={lang} onValueChange={onLang}>
            {LANGUAGES.map(l => <Picker.Item key={l.code} label={l.label} value={l.code} />)}
          </Picker>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text>Tema</Text>
            <Switch value={dark} onValueChange={setDark} />
          </View>
        </View>

        <TouchableOpacity
          onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}
          style={{ backgroundColor: "#d82626", borderRadius: 8, paddingVertical: 14, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
