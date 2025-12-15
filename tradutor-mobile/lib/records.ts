// lib/records.ts
import { authFetch } from "./api";
import { BASE_URL } from "./api";

export type RecordItem = {
  id: number | string;
  originalName?: string;
  translatedName?: string;
  targetLang?: string;
  filePath?: string;      // ex.: "translated/abc.pdf"
  downloadUrl?: string;   // se o backend já mandar isso
};

export async function fetchLatestRecord(): Promise<RecordItem | null> {
  const res = await authFetch("/records?limit=1", { method: "GET" });
  if (!res.ok) return null;
  const data = await res.json();
  const item: RecordItem | undefined = Array.isArray(data) ? data[0] : data?.content?.[0] || data?.[0];
  if (!item) return null;

  // Se não vier downloadUrl, tenta montar via /files/<filePath>
  if (!item.downloadUrl && item.filePath) {
    item.downloadUrl = `${BASE_URL}/files/${item.filePath.replace(/^\/+/, "")}`;
  }
  return item;
}
