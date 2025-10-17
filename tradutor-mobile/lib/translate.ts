// lib/translate.ts
import { authFetch } from "./api";

export type TranslateResponse = {
  id?: string;
  name?: string;
  translatedName?: string;
  targetLang?: string;
  downloadUrl?: string;
  message?: string;
};

type NativeAsset = { uri: string; name?: string; mimeType?: string; type?: string; size?: number };

// mantenha em sincronia com o backend (application.properties / docker)
export const MAX_MB = 50;
export const MAX_BYTES = MAX_MB * 1024 * 1024;

function getPrettyName(f: File | NativeAsset) {
  const n = (f as File)?.name
    ?? (f as NativeAsset)?.name
    ?? ((f as NativeAsset)?.uri ? String((f as NativeAsset).uri).split("/").pop() : "arquivo");
  return n || "arquivo";
}

/**
 * target_lang (snake_case) é o que o backend espera.
 * source_lang é opcional; só envie se você tiver esse valor.
 */
export async function translateFile(
  file: File | NativeAsset,
  targetLang: string,
  sourceLang?: string
): Promise<TranslateResponse> {
  // pré-checagem de tamanho quando disponível
  const size = (file as File)?.size ?? (file as NativeAsset)?.size;
  if (typeof size === "number" && size > MAX_BYTES) {
    throw new Error(`"${getPrettyName(file)}" é muito grande. Limite ${MAX_MB} MB.`);
  }

  const form = new FormData();
  const isNative = (file as NativeAsset)?.uri && !(file instanceof File);

  if (isNative) {
    const f = file as NativeAsset;
    form.append(
      "file",
      {
        // @ts-ignore (formato aceito no RN)
        uri: f.uri,
        name: f.name || "documento",
        type: f.mimeType || f.type || "application/pdf",
      } as any
    );
  } else {
    form.append("file", file as File);
  }

  // 👇 campo correto para o backend Java
  form.append("target_lang", targetLang);
  if (sourceLang) form.append("source_lang", sourceLang);

  const res = await authFetch("/translate-file", {
    method: "POST",
    body: form, // não setar Content-Type manualmente
  });

  if (res.status === 401) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  if (res.status === 413) {
    throw new Error(`"${getPrettyName(file)}" excede ${MAX_MB} MB (413).`);
  }

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message || data.error)) ||
      text ||
      `Falha ${res.status}`;
    throw new Error(msg);
  }
  return data || {};
}

/** Envia vários arquivos em sequência (evita sobrecarregar o backend). */
export async function translateMany(
  files: (File | NativeAsset)[],
  targetLang: string,
  onProgress?: (idx: number, total: number, status: "ok" | "erro", detail?: string) => void
) {
  const results: { name: string; ok: boolean; data?: TranslateResponse; error?: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    try {
      const data = await translateFile(f, targetLang);
      results.push({ name: getPrettyName(f), ok: true, data });
      onProgress?.(i + 1, files.length, "ok");
      await new Promise(r => setTimeout(r, 150));
    } catch (e: any) {
      const msg = e?.message ?? "Falha ao traduzir.";
      results.push({ name: getPrettyName(f), ok: false, error: msg });
      onProgress?.(i + 1, files.length, "erro", msg);
    }
  }

  return results;
}
