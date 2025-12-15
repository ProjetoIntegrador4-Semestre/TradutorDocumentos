import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from "react-native";
import * as Sharing from 'expo-sharing';
import { File as ExpoFile, Paths } from 'expo-file-system';
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { apiFetch, BASE_URL } from "../../lib/api";
import { appEvents } from "../../lib/events";

type RecordItem = {
  id: number;
  originalName?: string;
  originalFilename?: string;
  translatedName?: string;
  translatedFilename?: string;
  targetLang?: string;
  targetLanguage?: string;
  mimeType?: string;
  fileType?: string;
  createdAt?: string;
  created?: string;
  downloadUrl?: string;
  fileUrl?: string;
};

const TYPE_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "pdf", label: "PDF" },
  { key: "docx", label: "DOCX" },
  { key: "pptx", label: "PPTX" },
  { key: "txt", label: "TXT" },
];

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [items, setItems] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/records");
      const list = Array.isArray(data) ? data : data?.content || [];
      setItems(list as RecordItem[]);
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    appEvents.on("history:refresh", handler);
    return () => {
      appEvents.off("history:refresh", handler as any);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...items]
      .filter((it) => {
        if (!term) return true;
        const name =
          it.translatedName ||
          it.translatedFilename ||
          it.originalName ||
          it.originalFilename ||
          "";
        const lang = (it.targetLang || it.targetLanguage || "").toLowerCase();
        return (
          name.toLowerCase().includes(term) ||
          lang.includes(term)
        );
      })
      .filter((it) => {
        if (typeFilter === "all") return true;
        const mime = (it.mimeType || it.fileType || "").toLowerCase();
        const fileName = titleOf(it).toLowerCase();
        if (!mime && !fileName) return true;
        
        if (typeFilter === "pdf") {
          return mime.includes("pdf") || fileName.endsWith(".pdf");
        }
        if (typeFilter === "docx") {
          return mime.includes("word") || mime.includes("docx") || fileName.endsWith(".docx") || fileName.endsWith(".doc");
        }
        if (typeFilter === "pptx") {
          return mime.includes("presentation") || mime.includes("powerpoint") || fileName.endsWith(".pptx") || fileName.endsWith(".ppt");
        }
        if (typeFilter === "txt") {
          return mime.includes("text") || fileName.endsWith(".txt");
        }
        return true;
      })
      .sort((a, b) => {
        const da = new Date(a.createdAt || a.created || 0).getTime();
        const db = new Date(b.createdAt || b.created || 0).getTime();
        return sortDesc ? db - da : da - db;
      });
  }, [items, search, typeFilter, sortDesc]);

  function titleOf(r: RecordItem) {
    return (
      r.translatedName ||
      r.translatedFilename ||
      r.originalName ||
      r.originalFilename ||
      "arquivo"
    );
  }

  function typeLabelOf(r: RecordItem) {
    const mime = (r.mimeType || r.fileType || "").toLowerCase();
    if (!mime) return "—";
    if (mime.includes("pdf")) return "PDF";
    if (mime.includes("word")) return "DOCX";
    if (mime.includes("presentation") || mime.includes("powerpoint"))
      return "PPTX";
    if (mime.includes("text")) return "TXT";
    return mime;
  }

  function langLabelOf(r: RecordItem) {
    const l = (r.targetLang || r.targetLanguage || "").toUpperCase();
    return l || "—";
  }

  function dateLabelOf(r: RecordItem) {
    const d = new Date(r.createdAt || r.created || "");
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString();
  }

  async function deleteRecord(r: RecordItem) {
    Alert.alert(
      t('history.confirmDelete'),
      `${t('history.deleteMessage')} "${titleOf(r)}"?`,
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/records/${r.id}`, { method: "DELETE" });
              Alert.alert(t('common.success'), t('history.deleteSuccess'));
              load();
            } catch (error: any) {
              console.error("Erro ao excluir:", error);
              Alert.alert(t('common.error'), t('history.deleteError'));
            }
          },
        },
      ]
    );
  }

  async function openRecord(r: RecordItem) {
    let raw =
      r.downloadUrl ||
      r.fileUrl ||
      (r.translatedFilename ? `/files/${r.translatedFilename}` : null);

    if (!raw) return;

    const url = raw.startsWith("http") ? raw : `${BASE_URL}${raw}`;
    const fileName = titleOf(r);

    try {
      if (Platform.OS === "web") {
        window.open(url, "_blank");
        return;
      }

      // Verifica se é PDF - PDF pode abrir direto
      const isPdf = fileName.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        // Para PDF, tenta abrir direto primeiro
        try {
          await Linking.openURL(url);
          return;
        } catch (e) {
          console.log("Erro ao abrir PDF direto, tentando download...");
        }
      }

      // Para outros arquivos ou se PDF falhar, faz download e compartilha
      Alert.alert("Baixando", "Aguarde, baixando arquivo...");

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao baixar arquivo`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const file = new ExpoFile(Paths.cache, fileName);
      
      // Verifica se o arquivo já existe e remove
      if (file.exists) {
        console.log("Arquivo já existe, removendo...");
        file.delete();
      }
      
      // Cria o arquivo e escreve os dados
      file.create();
      file.write(bytes);
      
      const fileUri = file.uri;

      const isShareAvailable = await Sharing.isAvailableAsync();
      
      if (isShareAvailable) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: 'Abrir arquivo traduzido',
        });
      } else {
        Alert.alert(
          "Arquivo Baixado",
          `Arquivo salvo em: ${fileUri}\n\nCompartilhamento não disponível neste dispositivo.`
        );
      }

    } catch (error: any) {
      console.error("Erro ao abrir arquivo:", error);
      
      let errorMessage = error.message || "Erro desconhecido";
      
      if (errorMessage.includes("404")) {
        errorMessage = "Arquivo não encontrado no servidor (404).";
      } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
        errorMessage = "Erro de autenticação.";
      }
      
      Alert.alert("Erro", errorMessage);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 16 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: 12,
        }}
      >
        {t('history.title')}
      </Text>

      {/* filtro por texto */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={t('history.filterByName')}
        placeholderTextColor={theme.colors.muted}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: 10,
          color: "#9E9E9E",  // Cor cinza

        }}
      />

      {/* filtro por tipo */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 10,
        }}
      >
        {TYPE_FILTERS.map((f) => {
          const active = f.key === typeFilter;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setTypeFilter(f.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? "#EEF2FF" : theme.colors.surface,
              }}
            >
              <Text
                style={{
                  color: active ? theme.colors.primary : theme.colors.text,
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* sort + refresh */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => setSortDesc((p) => !p)}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "#4751c8ff",
          }}
        >
          <Text style={{ color: theme.colors.text }}>
            {sortDesc ? t('history.newest') : t('history.oldest')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={load}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: theme.colors.primary,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>{t('common.refresh')}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={{ paddingVertical: 12 }}>
          <ActivityIndicator />
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.length === 0 && !loading && (
          <Text style={{ color: theme.colors.muted }}>
            {t('history.noTranslations')}
          </Text>
        )}

        {filtered.map((r) => (
          <View
            key={r.id}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontWeight: "600",
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {titleOf(r)}
            </Text>

            <Text style={{ color: theme.colors.muted, marginBottom: 2 }}>
              {t('history.type')}: {typeLabelOf(r)}   {"   "}{t('history.to')}: {langLabelOf(r)}
            </Text>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              {dateLabelOf(r)}
            </Text>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => openRecord(r)}
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>{t('common.open')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => deleteRecord(r)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: "#dc2626",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
