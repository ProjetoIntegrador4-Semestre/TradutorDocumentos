import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { LANGUAGES } from "../../constants/languages";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { useTranslation } from "react-i18next";

export default function Translator() {
  const { lang, setLang } = useLang();
  const [folder, setFolder] = useState("Pasta 1");
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

  async function pick() {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!res.canceled) setFile(res.assets[0]);
  }

  async function translate() {
    if (!file) return Alert.alert("Selecione um arquivo");
    setLoading(true);
    try {
      const out = FileSystem.documentDirectory + `traduzido_${file.name || "arquivo"}`;
      await FileSystem.writeAsStringAsync(out, "arquivo-falso", { encoding: FileSystem.EncodingType.UTF8 });
      Alert.alert("Sucesso", `Simulação concluída. (mock)\nDestino: ${out}`);
    } finally { setLoading(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopGreeting />

      <View style={{ padding: 16, rowGap: 16 }}>
        <View>
          <Text style={{ marginBottom: 6, color: theme.colors.text }}>{t("translator.chooseLang")}</Text>
          <Picker selectedValue={lang} onValueChange={(v) => setLang(String(v))}>
            {LANGUAGES.map((l) => <Picker.Item key={l.code} label={l.label} value={l.code} />)}
          </Picker>
          <Text style={{ color: theme.colors.primary, marginTop: 4 }}>{t("translator.moreLangs")}</Text>
        </View>

        <View>
          <Text style={{ marginBottom: 6, color: theme.colors.text }}>{t("translator.selectFolder")}</Text>
          <Picker selectedValue={folder} onValueChange={(v) => setFolder(String(v))}>
            <Picker.Item label="Pasta 1" value="Pasta 1" />
            <Picker.Item label="Pasta 2" value="Pasta 2" />
          </Picker>
        </View>

        <TouchableOpacity
          onPress={pick}
          style={{ height: 140, borderWidth: 1, borderColor: theme.colors.border, borderStyle: "dashed", borderRadius: 10, backgroundColor: theme.colors.surface, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: theme.colors.primary, textAlign: "center" }}>
            {file ? `Selecionado: ${file.name}\n(Toque para trocar)` : t("translator.selectFile")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={translate}
          disabled={loading}
          style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingVertical: 14, alignItems: "center", opacity: loading ? 0.6 : 1 }}
        >
          <Text style={{ color: theme.colors.primaryText, fontWeight: "700", letterSpacing: 2 }}>{t("translator.translate")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
