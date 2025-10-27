// app/(tabs)/history.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, ActivityIndicator, FlatList } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { apiFetch, BASE_URL } from "../../lib/api";
import * as WebBrowser from "expo-web-browser";
import { useFocusEffect } from "expo-router";

type RecordItem = {
  id: string | number;
  name: string;
  type?: string;
  targetLang?: string;
  createdAt?: string;
  url?: string;
};

const TYPE_OPTIONS = [
  { key: "all",  label: "Todos" },
  { key: "pdf",  label: "PDF" },
  { key: "docx", label: "DOCX" },
  { key: "pptx", label: "PPTX" },
  { key: "txt",  label: "TXT" },
];

// --- helpers de normalização -----------------------------------------------

function basenameFromUrl(u?: string): string | undefined {
  if (!u) return;
  try {
    const noHash = u.split("#")[0];
    const noQuery = noHash.split("?")[0];
    const segs = noQuery.split("/");
    const last = segs[segs.length - 1];
    if (!last) return;
    return decodeURIComponent(last);
  } catch {
    return;
  }
}

function extFromName(n?: string): string | undefined {
  if (!n) return;
  const m = n.match(/\.([a-z0-9]+)$/i);
  return m?.[1]?.toLowerCase();
}

function coalesceName(r: any): string {
  // tenta vários campos comuns
  const candidates = [
    r?.name, r?.filename, r?.fileName, r?.originalName, r?.originalname,
    r?.original_filename, r?.original_file_name, r?.originName, r?.sourceName,
    r?.baseName, r?.displayName,
  ].filter(Boolean);

  let n = (candidates[0] as string | undefined)?.toString();
  if (!n || n.toLowerCase() === "arquivo") {
    // tenta extrair da URL
    n = basenameFromUrl(r?.url) ?? basenameFromUrl(r?.downloadUrl);
  }
  // último fallback: id com extensão
  if (!n) {
    const t = (r?.type ?? r?.ext)?.toString()?.toLowerCase();
    n = r?.id ? `arquivo_${r.id}${t ? "." + t : ""}` : "arquivo";
  }
  return n;
}

export default function HistoryScreen() {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RecordItem[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "pdf" | "docx" | "pptx" | "txt">("all");
  const [order, setOrder] = useState<"desc" | "asc">("desc");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/records");

      const normalized: RecordItem[] = (Array.isArray(data) ? data : []).map((r: any, idx: number) => {
        const name = coalesceName(r);
        // tipo: usa backend ou deduz pela extensão
        const type =
          (r?.type ?? r?.ext)?.toString()?.toLowerCase() ||
          extFromName(name) ||
          undefined;

        return {
          id: r?.id ?? idx,
          name,
          type,
          targetLang: (r?.targetLang ?? r?.toLang ?? r?.langTo ?? "").toString().toUpperCase() || undefined,
          createdAt: r?.createdAt ?? r?.created_at ?? r?.date ?? undefined,
          url: r?.url ?? r?.downloadUrl ?? (r?.id ? `${BASE_URL}/records/${r.id}/download` : undefined),
        };
      });

      setItems(normalized);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    let ticks = 0;
    const id = setInterval(() => {
      ticks += 1;
      if (ticks > 5) { clearInterval(id); return; }
      load();
    }, 2000);
    return () => clearInterval(id);
  }, [load]);

  const filtered = useMemo(() => {
    let list = items.slice();
    const q = query.trim().toLowerCase();

    if (q) {
      list = list.filter(it =>
        it.name?.toLowerCase().includes(q) ||
        it.targetLang?.toLowerCase().includes(q)
      );
    }
    if (type !== "all") {
      list = list.filter(it => (it.type || "").toLowerCase() === type);
    }
    list.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return order === "desc" ? (db - da) : (da - db);
    });
    return list;
  }, [items, query, type, order]);

  function openItem(it: RecordItem) {
    const href = it.url ?? "#";
    if (Platform.OS === "web") window.open(href, "_blank");
    else WebBrowser.openBrowserAsync(href);
  }

  const Empty = (
    <View style={{ paddingVertical: 40, alignItems: "center" }}>
      <Text style={{ color: theme.colors.muted }}>Nenhuma tradução encontrada.</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "700" }}>Histórico</Text>

        <View style={{ marginTop: 12 }}>
          <TextInput
            placeholder="Filtrar por nome ou idioma..."
            placeholderTextColor={theme.colors.muted}
            value={query}
            onChangeText={setQuery}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 10,
            }}
          />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {TYPE_OPTIONS.map(opt => {
              const active = type === (opt.key as any);
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setType(opt.key as any)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: active ? "#EEF2FF" : theme.colors.surface,
                  }}
                >
                  <Text style={{ color: active ? theme.colors.primary : theme.colors.text }}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() => setOrder(p => (p === "desc" ? "asc" : "desc"))}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Text style={{ color: theme.colors.text }}>
                {order === "desc" ? "Mais recentes" : "Mais antigas"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={load}
              style={{
                marginLeft: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: theme.colors.primary,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading && items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => String(it.id)}
          ListEmptyComponent={Empty}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "600" }} numberOfLines={1}>
                {item.name}
              </Text>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                {!!item.type && (
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                    Tipo: {item.type.toUpperCase()}
                  </Text>
                )}
                {!!item.targetLang && (
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                    Para: {item.targetLang}
                  </Text>
                )}
                {!!item.createdAt && (
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                )}
              </View>

              <View style={{ marginTop: 10, flexDirection: "row" }}>
                {Platform.OS === "web" ? (
                  <a
                    href={item.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      backgroundColor: theme.colors.primary,
                      color: "#fff",
                      padding: 8,
                      borderRadius: 8,
                      fontWeight: 600 as any,
                    }}
                  >
                    Abrir
                  </a>
                ) : (
                  <TouchableOpacity
                    onPress={() => openItem(item)}
                    style={{
                      backgroundColor: theme.colors.primary,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>Abrir</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
