import { authFetch } from "./client";

// POST /translate  -> stream do arquivo traduzido
export async function uploadAndTranslate(file, targetLang) {
  const form = new FormData();
  form.append("file", file);
  form.append("target_lang", targetLang); // ajuste o nome do campo se no backend for diferente

  const res = await authFetch(`/translate`, { method: "POST", body: form }, true);
  // Se o backend retornar JSON de job, adapte. Aqui assumimos retorno binário.
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = "Falha na tradução";
    if (contentType.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      msg = j.detail || msg;
    }
    throw new Error(msg);
  }
  const blob = await res.blob();
  // tenta inferir nome do arquivo pelo header
  const cd = res.headers.get("content-disposition") || "";
  const m = /filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i.exec(cd);
  const filename = decodeURIComponent(m?.[1] || m?.[2] || `traduzido_${file.name}`);
  return { blob, filename };
}

// GET /records
export async function fetchRecords() {
  const res = await authFetch(`/records`);
  if (!res.ok) throw new Error("Falha ao carregar histórico");
  return res.json();
}

// GET /records/{id}/download -> blob
export async function downloadRecord(id) {
  const res = await authFetch(`/records/${id}/download`);
  if (!res.ok) throw new Error("Falha no download");
  const blob = await res.blob();
  // tenta file name
  const cd = res.headers.get("content-disposition") || "";
  const m = /filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i.exec(cd);
  const filename = decodeURIComponent(m?.[1] || m?.[2] || `arquivo_${id}`);
  return { blob, filename };
}
