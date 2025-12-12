import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Platform, ActivityIndicator, Alert, Linking } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from 'expo-sharing';
import { Paths, File as ExpoFile } from 'expo-file-system';
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { translateMany, MAX_MB } from "../../lib/translate";
import { useNotifications } from "../../lib/useNotifications";
import { useRouter } from "expo-router";
import { BASE_URL } from "../../lib/api";
import { appEvents } from "../../lib/events";
import { getAuth } from "../../lib/storage";

type UIFile = File | { uri: string; name?: string; mimeType?: string; type?: string; size?: number };

const TARGETS = [
  { code: "en", label: "Inglês" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Espanhol" },
  { code: "fr", label: "Francês" },
  { code: "de", label: "Alemão" },
  { code: "it", label: "Italiano" },
];

function normalizeDownloadUrl(data: any): string | null {
  console.log("=== normalizeDownloadUrl - DATA RECEBIDO ===");
  console.log(JSON.stringify(data, null, 2));
  
  // Primeiro tenta pegar a URL direta
  const direct =
    data?.downloadUrl ?? 
    data?.downloadURL ?? 
    data?.url ?? 
    data?.href ?? 
    data?.fileUrl ?? 
    data?.outputUrl;
  if (direct) {
    let s = String(direct);
    
    // Decodifica o nome do arquivo se estiver encodado
    // Ex: /files/Curr%C3%ADculo -> /files/Currículo
    s = decodeURIComponent(s);
    
    // Se já começa com http, usa direto
    let finalUrl = s.startsWith("http") ? s : `${BASE_URL}${s.startsWith("/") ? s : `/${s}`}`;
    
    console.log("URL FINAL construída (direct, decodificada):", finalUrl);
    return finalUrl;
  }
  
  // Tenta pegar o ID do registro para construir a URL de download
  const recordId = data?.id;
  if (recordId) {
    const finalUrl = `${BASE_URL}/records/${recordId}/download`;
    console.log("URL de download por ID:", finalUrl);
    return finalUrl;
  }
  
  // Tenta pegar o caminho do arquivo
  const path =
    data?.filePath ?? 
    data?.path ?? 
    data?.outputPath ?? 
    data?.translatedPath;
  if (path) {
    let cleanPath = String(path);
    cleanPath = cleanPath.replace(/^\/+/, "");
    const finalUrl = `${BASE_URL}/files/${cleanPath}`;
    
    console.log("URL de PATH encontrada:", finalUrl);
    return finalUrl;
  }
  
  console.log("NENHUMA URL encontrada no data!");
  return null;
}

async function openFile(url: string, fileName: string) {
  try {
    console.log("=== ABRINDO ARQUIVO ===");
    console.log("URL original:", url);
    console.log("Nome:", fileName);
    
    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }

    const auth = await getAuth();
    const token = auth?.token;
    
    if (!token) {
      Alert.alert("Erro", "Token não encontrado. Faça login novamente.");
      return;
    }

    // Mostra mensagem de download
    Alert.alert("Baixando", "Aguarde, baixando arquivo...");

    console.log("Fazendo download da URL:", url);
    console.log("Com Authorization Bearer token");
    
    try {
      // Cria o arquivo usando a nova API
      const file = new ExpoFile(Paths.cache, fileName);
      
      console.log("URI de destino:", file.uri);
      
      // Faz o download usando fetch
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log("Status do download:", response.status);
      
      if (!response.ok) {
        Alert.alert(
          "Arquivo não encontrado", 
          "O arquivo traduzido não foi encontrado no servidor. Isso pode acontecer se:\n\n" +
          "• O arquivo foi excluído\n" +
          "• Houve um problema no servidor\n\n" +
          "Tente traduzir o arquivo novamente."
        );
        return;
      }

      // Converte resposta para array buffer e salva
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      console.log("Tamanho do arquivo:", bytes.length, "bytes");
      
      // Verifica se o arquivo já existe e remove
      if (file.exists) {
        console.log("Arquivo já existe, removendo...");
        file.delete();
      }
      
      // Cria o arquivo e escreve os dados
      console.log("Criando arquivo...");
      file.create();
      
      console.log("Escrevendo dados...");
      file.write(bytes);

      console.log("✅ Arquivo baixado com sucesso!");
      console.log("URI do arquivo:", file.uri);

      // Compartilha o arquivo
      const isShareAvailable = await Sharing.isAvailableAsync();
      
      if (isShareAvailable) {
        console.log("Compartilhando arquivo...");
        await Sharing.shareAsync(file.uri, {
          mimeType: getMimeType(fileName),
          dialogTitle: 'Abrir arquivo traduzido',
          UTI: getUTI(fileName),
        });
      } else {
        Alert.alert(
          "Arquivo Baixado",
          `Arquivo salvo em: ${file.uri}\n\nO compartilhamento não está disponível neste dispositivo.`
        );
      }
    } catch (downloadError: any) {
      console.error("Erro durante o download:", downloadError);
      throw downloadError; // Re-lança para ser tratado pelo catch externo
    }

  } catch (error: any) {
    console.error("=== ERRO AO ABRIR/BAIXAR ARQUIVO ===");
    console.error(error);
    
    let errorMessage = error.message || "Erro desconhecido";
    
    if (errorMessage.includes("404")) {
      errorMessage = "Arquivo não encontrado no servidor (404). Verifique se a tradução foi concluída corretamente.";
    } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
      errorMessage = "Erro de autenticação. Faça login novamente.";
    } else if (errorMessage.includes("Network")) {
      errorMessage = "Erro de conexão. Verifique sua internet.";
    }
    
    Alert.alert("Erro", errorMessage);
  }
}

// Função auxiliar para determinar o MIME type baseado na extensão
function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'ppt': 'application/vnd.ms-powerpoint',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'txt': 'text/plain',
  };
  
  return mimeTypes[extension || ''] || 'application/octet-stream';
}

// Função auxiliar para UTI (necessário para iOS)
function getUTI(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const utiTypes: Record<string, string> = {
    'pdf': 'com.adobe.pdf',
    'docx': 'org.openxmlformats.wordprocessingml.document',
    'doc': 'com.microsoft.word.doc',
    'pptx': 'org.openxmlformats.presentationml.presentation',
    'txt': 'public.plain-text',
  };
  
  return utiTypes[extension || ''] || 'public.data';
}

export default function TranslatorScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { sendNotification } = useNotifications();

  const [files, setFiles] = useState<UIFile[]>([]);
  const [target, setTarget] = useState<string>("en");
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, "pendente" | "ok" | "erro">>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [results, setResults] = useState<{ name: string; ok: boolean; url?: string | null; error?: string }[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  function fileName(f: UIFile) {
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
      Alert.alert(t('translator.attention'), t('translator.selectAtLeastOne'));
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

      console.log("=== RESULTADOS BRUTOS DO BACKEND ===");
      console.log(JSON.stringify(resultsRaw, null, 2));

      const ui = resultsRaw.map((r) => {
        console.log("=== Processando resultado individual ===");
        console.log("r.data:", JSON.stringify(r.data, null, 2));
        const url = r.ok ? normalizeDownloadUrl(r.data) : undefined;
        console.log("URL final processada:", url);
        return {
          name: r.name,
          ok: r.ok,
          url: url,
          error: r.error,
        };
      });

      setResults(ui);

      appEvents.emit("history:refresh");

      const oks = resultsRaw.filter((r) => r.ok).length;
      const fails = resultsRaw.length - oks;
      
      // Envia notificação
      if (oks > 0) {
        await sendNotification(
          '✅ Tradução Concluída!',
          `${oks} arquivo(s) traduzido(s) com sucesso!`
        );
      }
      
      Alert.alert(t('common.success'), `${oks} ${t('translator.completedMessage').replace('arquivo(s) traduzido(s), erro(s).', `arquivo(s) traduzido(s), ${fails} erro(s).`)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, padding: 16 }}>
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
        {t('translator.title')}
      </Text>

      <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>{t('translator.targetLanguage')}</Text>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.border,
          marginBottom: 12,
          overflow: 'hidden',
        }}
      >
        <Picker
          selectedValue={target}
          onValueChange={(itemValue) => setTarget(itemValue)}
          style={{
            height: Platform.OS === 'ios' ? 180 : 50,
            color: theme.colors.text,
            backgroundColor: theme.colors.surface,
          }}
          itemStyle={{
            height: Platform.OS === 'ios' ? 180 : undefined,
            fontSize: 16,
          }}
        >
          {TARGETS.map((t) => (
            <Picker.Item label={t.label} value={t.code} key={t.code} />
          ))}
        </Picker>
      </View>

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
          {t('translator.files')} ({files.length}) — {t('translator.limitPerFile')}: {MAX_MB} MB
        </Text>

        {files.length === 0 ? (
          <Text style={{ color: theme.colors.muted, marginBottom: 10 }}>{t('translator.noFiles')}</Text>
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
          <Text style={{ color: "#fff", fontWeight: "700" }}>{t('translator.selectFile')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onTranslate}
        disabled={loading || files.length === 0}
        style={{
          opacity: loading || files.length === 0 ? 0.6 : 1,
          backgroundColor: "#232323ff",
          borderRadius: 8,
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#0054fbff", fontWeight: "700", letterSpacing: 1 }}>
            {t('translator.sendToTranslation')} ({files.length})
          </Text>
        )}
      </TouchableOpacity>

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
          <Text style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 8 }}>{t('translator.completed')}</Text>
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
                  <View style={{ marginTop: 6 }}>
                    <TouchableOpacity 
                      onPress={() => openFile(r.url!, r.name)} 
                      style={{ 
                        backgroundColor: '#16a34a', 
                        paddingHorizontal: 16, 
                        paddingVertical: 10, 
                        borderRadius: 6,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        {t('translator.openFile')}
                      </Text>
                    </TouchableOpacity>
                  </View>
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

          <TouchableOpacity onPress={() => setResults([])} style={{ marginTop: 10, alignSelf: "flex-end" }}>
            <Text style={{ color: theme.colors.muted }}>{t('translator.clearList')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
