import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { LANGUAGES } from "../../constants/languages";
import { getDefaultLang } from "../../lib/storage";

export default function Translator() {
  const [lang, setLang] = useState("pt");
  const [folder, setFolder] = useState("Pasta 1");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => { const d = await getDefaultLang(); if (d) setLang(d); })(); }, []);

  async function pick() {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!res.canceled) setFile(res.assets[0]);
  }

  async function translate() {
    if (!file) return Alert.alert("Selecione um arquivo");
    setLoading(true);
    try {
      // Mock somente visual
      const out = FileSystem.documentDirectory + `traduzido_${file.name || "arquivo"}`;
      await FileSystem.writeAsStringAsync(out, "arquivo-falso", { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert("Sucesso", `Simulação concluída. (mock)\nDestino: ${out}`);
    } finally { setLoading(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#e9e9ea" }}>
      <TopGreeting />
      <View style={{ padding: 16, rowGap: 16 }}>
        <View>
          <Text style={{ marginBottom: 6 }}>Escolha para qual idioma deseja traduzir:</Text>
          <Picker selectedValue={lang} onValueChange={(v) => setLang(String(v))}>
            {LANGUAGES.map(l => <Picker.Item key={l.code} label={l.label} value={l.code} />)}
          </Picker>
          <Text style={{ color: "#2b64ff", marginTop: 4 }}>+200 idiomas</Text>
        </View>

        <View>
          <Text style={{ marginBottom: 6 }}>Selecione em qual pasta deseja salvar:</Text>
          <Picker selectedValue={folder} onValueChange={(v) => setFolder(String(v))}>
            <Picker.Item label="Pasta 1" value="Pasta 1" />
            <Picker.Item label="Pasta 2" value="Pasta 2" />
          </Picker>
        </View>

        <TouchableOpacity
          onPress={pick}
          style={{ height: 140, borderWidth: 1, borderColor: "#dcdcdc", borderStyle: "dashed", borderRadius: 10,
                   backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#2b64ff", textAlign: "center" }}>
            {file ? `Selecionado: ${file.name}\n(Toque para trocar)` : "Clique aqui para selecionar o arquivo que deseja traduzir"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={translate}
          disabled={loading}
          style={{ backgroundColor: "#2b4bff", borderRadius: 8, paddingVertical: 14, alignItems: "center", opacity: loading ? 0.6 : 1 }}>
          <Text style={{ color: "#fff", fontWeight: "700", letterSpacing: 2 }}>TRADUZIR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
