// app/(tabs)/history.tsx
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
} from "react-native";
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

  // auto-refresh quando uma tradução termina
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
        if (!mime) return true;
        if (typeFilter === "pdf") return mime.includes("pdf");
        if (typeFilter === "docx") return mime.includes("word");
        if (typeFilter === "pptx")
          return mime.includes("presentation") || mime.includes("powerpoint");
        if (typeFilter === "txt") return mime.includes("text");
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

  function openRecord(r: RecordItem) {
    let raw =
      r.downloadUrl ||
      r.fileUrl ||
      (r.translatedFilename ? `/files/${r.translatedFilename}` : null);

    if (!raw) return;

    // se vier só "/files/xxx", prefixa com o backend (8080)
    const url = raw.startsWith("http") ? raw : `${BASE_URL}${raw}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
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
        Histórico
      </Text>

      {/* filtro por texto */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Filtrar por nome ou idioma..."
        placeholderTextColor={theme.colors.muted}
        style={{
          backgroundColor: "#fff",
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: 10,
        }}
      />

      {/* chips de tipo */}
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
                borderColor: active
                  ? theme.colors.primary
                  : theme.colors.border,
                backgroundColor: active ? "#EEF2FF" : "#fff",
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
            backgroundColor: "#f3f4ff",
          }}
        >
          <Text style={{ color: theme.colors.text }}>
            {sortDesc ? "Mais recentes" : "Mais antigos"}
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
          <Text style={{ color: "#fff", fontWeight: "600" }}>Atualizar</Text>
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
            Nenhuma tradução encontrada.
          </Text>
        )}

        {filtered.map((r) => (
          <View
            key={r.id}
            style={{
              backgroundColor: "#fff",
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
              Tipo: {typeLabelOf(r)}   {"   "}Para: {langLabelOf(r)}
            </Text>
            <Text style={{ color: theme.colors.muted, marginBottom: 8 }}>
              {dateLabelOf(r)}
            </Text>

            <TouchableOpacity
              onPress={() => openRecord(r)}
              style={{
                alignSelf: "flex-start",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: "#2563eb",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Abrir</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
