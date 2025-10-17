// app/(tabs)/translator.tsx
import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator, Alert, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../../context/ThemeContext";
import { translateMany, MAX_MB } from "../../lib/translate";
import { useRouter } from "expo-router";
import { BASE_URL } from "../../lib/api";

type UIFile = File | { uri: string; name?: string; mimeType?: string; type?: string; size?: number };

const TARGETS = [
  { code: "en", label: "Inglês" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Espanhol" },
  { code: "fr", label: "Francês" },
  { code: "de", label: "Alemão" },
  { code: "it", label: "Italiano" }, // ✅ adicionado
];

// Constrói um link de download quando possível
function normalizeDownloadUrl(data: any): string | null {
  const direct =
    data?.downloadUrl ??
    data?.downloadURL ??
    data?.url ??
    data?.href ??
    data?.fileUrl ??
    data?.outputUrl;
  if (direct) {
    const s = String(direct);
    return s.startsWith("http") ? s : `${BASE_URL}${s.startsWith("/") ? s : `/${s}`}`;
  }
  const path =
    data?.filePath ??
    data?.path ??
    data?.outputPath ??
    data?.translatedPath;
  if (path) {
    return `${BASE_URL}/files/${String(path).replace(/^\/+/, "")}`;
  }
  return null;
}

export default function TranslatorScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [files, setFiles] = useState<UIFile[]>([]);
  const [target, setTarget] = useState<string>("en");
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, "pendente" | "ok" | "erro">>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [results, setResults] = useState<{ name: string; ok: boolean; url?: string | null; error?: string }[]>([]);

  // Web input hidden
  const inputRef = useRef<HTMLInputElement | null>(null);

  function fileName(f: UIFile) {
    // @ts-ignore
    return (f?.name as string) ?? (f as any)?.uri?.split("/").pop() ?? "arquivo";
  }

  function openPickerWeb() {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.click();
  }

  async function openPickerNative() {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "*/*",
      ],
    });
    if (res.canceled) return;
    const picked = (res.assets ?? []) as any[];
    setFiles((prev) => [...prev, ...picked]);
  }

  function onPick() {
    if (Platform.OS === "web") openPickerWeb();
    else openPickerNative();
  }

  function removeAt(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onTranslate() {
    if (!files.length) {
      Alert.alert("Atenção", "Selecione pelo menos um arquivo.");
      return;
    }

    setLoading(true);
    setResults([]);
    const startStatuses: Record<string, "pendente"> = {};
    files.forEach((f) => (startStatuses[fileName(f)] = "pendente"));
    setStatuses(startStatuses);
    setErrors({});

    try {
      const resultsRaw = await translateMany(files, target, (idx, total, status, detail) => {
        const f = files[idx - 1];
        const n = fileName(f);
        setStatuses((prev) => ({ ...prev, [n]: status === "ok" ? "ok" : "erro" }));
        if (status === "erro") {
          setErrors((prev) => ({ ...prev, [n]: detail }));
          if (detail?.includes("Sessão expirada")) {
            Alert.alert("Sessão expirada", "Faça login novamente.", [
              { text: "OK", onPress: () => router.replace("/(auth)/login") },
            ]);
          }
        }
      });

      const ui = resultsRaw.map((r) => ({
        name: r.name,
        ok: r.ok,
        url: r.ok ? normalizeDownloadUrl(r.data) : undefined,
        error: r.error,
      }));
      setResults(ui);

      const oks = resultsRaw.filter((r) => r.ok).length;
      const fails = resultsRaw.length - oks;
      Alert.alert("Concluído", `${oks} arquivo(s) traduzido(s), ${fails} erro(s).`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 16 }}>
      {/* input web escondido (múltiplos) */}
      {Platform.OS === "web" && (
        <input
          ref={inputRef as any}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.txt"
          style={{ display: "none" }}
          onChange={(ev) => {
            const list = (ev.target as HTMLInputElement).files;
            if (!list) return;
            const arr = Array.from(list);
            setFiles((prev) => [...prev, ...arr]);
          }}
        />
      )}

      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
        Tradutor de Documentos
      </Text>

      <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>Idioma de destino</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {TARGETS.map((t) => {
          const active = target === t.code;
          return (
            <TouchableOpacity
              key={t.code}
              onPress={() => setTarget(t.code)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? "#EEF2FF" : theme.colors.surface,
              }}
            >
              <Text style={{ color: active ? theme.colors.primary : theme.colors.text }}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista de arquivos */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
          Arquivos ({files.length}) — limite por arquivo: {MAX_MB} MB
        </Text>

        {files.length === 0 ? (
          <Text style={{ color: theme.colors.muted, marginBottom: 10 }}>Nenhum arquivo selecionado.</Text>
        ) : (
          files.map((f, idx) => {
            const n = fileName(f);
            const st = statuses[n];
            const err = errors[n];

            return (
              <View
                key={`${n}-${idx}`}
                style={{
                  marginBottom: 8,
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.bg,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: theme.colors.text, flex: 1 }} numberOfLines={1}>
                    {n}
                  </Text>
                  {st === "ok" && <Text style={{ color: "#16a34a", marginLeft: 8 }}>OK</Text>}
                  {st === "erro" && <Text style={{ color: "#dc2626", marginLeft: 8 }}>ERRO</Text>}
                  {st === "pendente" && <Text style={{ color: theme.colors.muted, marginLeft: 8 }}>Pendente</Text>}
                  <TouchableOpacity onPress={() => removeAt(idx)} disabled={loading} style={{ marginLeft: 12 }}>
                    <Text style={{ color: "#dc2626" }}>Remover</Text>
                  </TouchableOpacity>
                </View>
                {!!err && <Text style={{ color: "#dc2626", marginTop: 6 }}>{err}</Text>}
              </View>
            );
          })
        )}

        <TouchableOpacity
          onPress={onPick}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center",
            marginTop: 6,
          }}
          disabled={loading}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Selecionar arquivo(s)</Text>
        </TouchableOpacity>
      </View>

      {/* Enviar */}
      <TouchableOpacity
        onPress={onTranslate}
        disabled={loading || files.length === 0}
        style={{
          opacity: loading || files.length === 0 ? 0.6 : 1,
          backgroundColor: "#2b4bff",
          borderRadius: 8,
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "700", letterSpacing: 1 }}>
            Enviar para tradução ({files.length})
          </Text>
        )}
      </TouchableOpacity>

      {/* Resultados */}
      {results.length > 0 && (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 14,
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 8 }}>
            Traduções concluídas
          </Text>
          {results.map((r, i) => (
            <View
              key={`${r.name}-${i}`}
              style={{
                paddingVertical: 8,
                borderBottomWidth: i === results.length - 1 ? 0 : 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.text }} numberOfLines={1}>
                {r.name}
              </Text>

              {r.ok && r.url ? (
                Platform.OS === "web" ? (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    Baixar / Abrir tradução
                  </a>
                ) : (
                  <TouchableOpacity onPress={() => Linking.openURL(r.url!)}>
                    <Text style={{ color: "#2b64ff", fontWeight: "600" }}>Abrir tradução</Text>
                  </TouchableOpacity>
                )
              ) : r.ok && !r.url ? (
                <Text style={{ color: theme.colors.muted }}>
                  Tradução concluída, mas o link não foi informado. Verifique o histórico.
                </Text>
              ) : (
                <Text style={{ color: "#dc2626" }}>{r.error ?? "Falha ao traduzir."}</Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            onPress={() => setResults([])}
            style={{ marginTop: 10, alignSelf: "flex-end" }}
          >
            <Text style={{ color: theme.colors.muted }}>Limpar lista</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
