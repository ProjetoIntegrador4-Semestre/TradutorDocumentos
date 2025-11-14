import axios, { AxiosError } from "axios";

/** ====== BASE / ENDPOINTS ====== */
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://100.30.34.113:8080";

const BOOT_TOKEN = (import.meta as any)?.env?.VITE_BOOT_TOKEN || "";

export const ENDPOINTS = {
  // Auth (via /api no backend)
  login: "/api/auth/signin",
  register: "/api/auth/signup",

  // Endpoints públicos 
  translate: "/translate-file",
  languages: "/languages",
  records: "/records",
  files: "/files",

  // Password reset
  forgot: "/auth/password/forgot",
  reset: "/auth/password/reset",
} as const;

/** ====== Axios ====== */
export const api = axios.create({
  baseURL: API_BASE.endsWith("/") ? API_BASE : API_BASE + "/",
  timeout: 60_000,
  withCredentials: false,
});

/** ====== Token helpers (com evento) ====== */
function notifyAuthChange() {
  try { window.dispatchEvent(new Event("auth:change")); } catch {}
}

function getToken(): string | null {
  return localStorage.getItem("access_token");
}
export function setToken(token: string) {
  localStorage.setItem("access_token", token);
  notifyAuthChange();
}
export function clearToken() {
  localStorage.removeItem("access_token");
  notifyAuthChange();
}

/** ====== Interceptors ====== */
api.interceptors.request.use((config) => {
  const token = getToken();
  const url = (config.url || "").replace(/^\/+/, "");
  const isLogin = url.includes("api/auth/signin") || url.endsWith("api/auth/signin");

  config.headers = config.headers ?? {};
  if (isLogin && BOOT_TOKEN) {
    (config.headers as any).Authorization = `Bearer ${BOOT_TOKEN}`;
  } else if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => Promise.reject(err)
);

/** ====== Tipagens ====== */
export type RoleString =
  | "ROLE_USER" | "ROLE_ADMIN"
  | "USER" | "ADMIN"
  | "user" | "admin";

export interface MeDTO {
  id: number | string;
  username: string;
  email: string;
  role: RoleString;
}

export interface TranslationRecordDTO {
  id: number | string;
  originalName: string;
  translatedName?: string;
  sourceLang?: string;
  targetLang?: string;
  fileType?: string;
  sizeBytes?: number;
  status?: "DONE" | "PENDING" | "ERROR";
  createdAt?: string | number;
  downloadUrl?: string;
}

export interface Paged<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;   // page size
}

/** ====== Helpers ====== */
function parseContentDispositionFilename(header?: string | null): string | null {
  if (!header) return null;
  try {
    const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(header);
    if (match?.[1]) {
      try   { return decodeURIComponent(match[1]); }
      catch { return match[1]; }
    }
  } catch {}
  return null;
}

function b64UrlToJson<T = any>(b64url: string): T | null {
  try {
    const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch { return null; }
}

function decodeJwtPayload<T = any>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return b64UrlToJson<T>(parts[1]);
  } catch { return null; }
}

function extractServerMessage(err: unknown): string | undefined {
  const ax = err as AxiosError<any>;
  const data = ax?.response?.data as any;
  if (!data) return;
  return data?.message || data?.error || (typeof data === "string" ? data : undefined);
}

export function absoluteUrl(path: string): string {
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base + p;
}

async function fetchDownloadAsBlob(pathOrFilename: string): Promise<Blob> {
  const url = pathOrFilename.startsWith("/files/")
    ? pathOrFilename
    : `${ENDPOINTS.files}/${encodeURIComponent(pathOrFilename)}`;
  const resp = await api.get(url.replace(/^\/+/, ""), { responseType: "blob" });
  return resp.data as Blob;
}

/** ====== Auth (usuário/senha) ====== */
export async function login(email: string, password: string): Promise<MeDTO> {
  const resp = await api.post(
    ENDPOINTS.login,
    { email, password },
    { headers: { "Content-Type": "application/json" } }
  );
  const data = resp.data as any;
  const token: string = data?.accessToken || data?.access_token || data?.token || "";
  if (!token) throw new Error("Token não recebido no login.");
  setToken(token);

  const me: MeDTO = {
    id: data?.id ?? data?.userId ?? data?.sub ?? "me",
    email: data?.email,
    role: (data?.role || "user") as RoleString,
    username: data?.username || (data?.email?.split?.("@")[0] ?? "user"),
  };
  return me;
}

export async function register(name: string, email: string, password: string): Promise<void> {
  const username = name?.trim() || email.split("@")[0];
  await api.post(
    ENDPOINTS.register,
    { username, email, password, role: ["user"] },
    { headers: { "Content-Type": "application/json" } }
  );
}

/** Lê o "me" decodificando o JWT local (sem chamar /me) */
export async function getMe(): Promise<MeDTO> {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Sem token");

  const payload = decodeJwtPayload<any>(token) || {};
  const email = payload.email || "";
  const role = (payload.role || "user") as RoleString;

  // preferir 'name', depois 'username'
  const usernameFromToken =
    (payload.name && String(payload.name).trim()) ||
    (payload.username && String(payload.username).trim()) ||
    (email ? email.split("@")[0] : "user");

  return {
    id: payload.id ?? payload.sub ?? "me",
    email,
    role,
    username: usernameFromToken,
  };
}

export function logout(): void {
  clearToken();
}

/** ====== Google OAuth ====== */
export function getGoogleOAuthUrl(): string | null {
  const u = (import.meta as any)?.env?.VITE_GOOGLE_OAUTH_URL as string | undefined;
  if (u && u.trim()) return u.trim();
  try {
    const base = API_BASE.replace(/\/+$/, "");
    // backend agora redireciona sempre para o callback configurado nele
    return `${base}/oauth2/authorization/google`;
  } catch {
    return null;
  }
}

export function beginGoogleLogin(): void {
  const url = getGoogleOAuthUrl();
  if (!url) {
    console.warn("VITE_GOOGLE_OAUTH_URL não configurada.");
    return;
  }
  window.location.href = url;
}

/** Lê token do callback (?token=... ou #access_token=...), salva e limpa a URL */
export function consumeOAuthTokenFromUrl(): string | null {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const token =
    search.get("token") ||
    search.get("access_token") ||
    hash.get("token") ||
    hash.get("access_token") ||
    hash.get("id_token");

  if (token) {
    setToken(token);
    try {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch {}
    return token;
  }
  return null;
}

/** ====== Tradução de arquivo ====== */
export interface TranslateParams {
  target_lang?: string;
  source_lang?: string;
  targetLang?: string;
  sourceLang?: string;
}

export async function uploadAndTranslate(
  file: File,
  params: TranslateParams
): Promise<{ blob: Blob; filename: string }> {
  const form = new FormData();
  form.append("file", file);

  const target = params.targetLang || params.target_lang;
  const source = params.sourceLang || params.source_lang;

  if (!target || !target.trim()) {
    throw new Error("targetLang (idioma de destino) é obrigatório.");
  }

  form.append("targetLang", target);
  form.append("target_lang", target);
  if (source && source.trim()) {
    form.append("sourceLang", source);
    form.append("source_lang", source);
  }

  const resp = await api.post(ENDPOINTS.translate, form, { responseType: "blob" });

  const contentType = String(resp.headers["content-type"] || "");
  const isJson =
    contentType.includes("application/json") ||
    (resp.data instanceof Blob && resp.data.type.includes("application/json"));

  if (isJson) {
    const text = await (resp.data as Blob).text();
    const json = JSON.parse(text || "{}");
    const urlOrFile: string = json.downloadUrl || json.outputFile || "";
    if (!urlOrFile) throw new Error("Resposta sem downloadUrl/outputFile.");

    const blob = await fetchDownloadAsBlob(urlOrFile);
    const filename =
      urlOrFile.startsWith("/files/")
        ? decodeURIComponent(urlOrFile.split("/").pop() || `translated_${file.name}`)
        : decodeURIComponent(urlOrFile || `translated_${file.name}`);

    return { blob, filename };
  }

  const cd = resp.headers["content-disposition"] as string | undefined;
  const filename = parseContentDispositionFilename(cd) || `translated_${file.name}`;
  return { blob: resp.data as Blob, filename };
}

/** Download de um arquivo existente (/files/...) */
export async function downloadFile(filename: string): Promise<Blob> {
  return fetchDownloadAsBlob(filename);
}

/** ====== Línguas & Histórico ====== */
export async function getLanguages(): Promise<Array<{ code: string; name: string }>> {
  const r = await api.get(ENDPOINTS.languages);
  return (r.data as any[]) || [];
}

export interface RecordsQuery {
  page?: number;
  size?: number;
  q?: string;
  status?: string;
  from?: string;
  to?: string;
}

function mapRecordItem(serverItem: any): TranslationRecordDTO {
  return {
    id: serverItem.id ?? serverItem.recordId ?? serverItem.uuid ?? serverItem._id,
    originalName:
      serverItem.originalName ??
      serverItem.originalFilename ??
      serverItem.filename ??
      serverItem.name,
    translatedName: serverItem.translatedName ?? serverItem.outputFile ?? undefined,
    sourceLang: serverItem.sourceLang ?? serverItem.detectedLang ?? serverItem.source_lang,
    targetLang: serverItem.targetLang ?? serverItem.target_lang,
    fileType: serverItem.fileType ?? serverItem.mimeType ?? serverItem.type,
    sizeBytes: serverItem.sizeBytes ?? serverItem.size ?? undefined,
    status: serverItem.status ?? undefined,
    createdAt: serverItem.createdAt ?? serverItem.created_at ?? serverItem.createdDate,
    downloadUrl: serverItem.downloadUrl ?? serverItem.download_url,
  };
}

export async function getRecords(
  query: RecordsQuery = {}
): Promise<Paged<TranslationRecordDTO>> {
  const params = new URLSearchParams();
  if (typeof query.page === "number") params.set("page", String(query.page));
  if (typeof query.size === "number") params.set("size", String(query.size));
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);

  const url = ENDPOINTS.records + (params.toString() ? `?${params.toString()}` : "");
  const r = await api.get(url);
  const data = r.data;

  if (data && Array.isArray(data.content)) {
    return {
      ...data,
      content: data.content.map(mapRecordItem),
    } as Paged<TranslationRecordDTO>;
  }

  if (Array.isArray(data)) {
    const content = data.map(mapRecordItem);
    const size = query.size ?? (content.length || 10);
    const page = query.page ?? 0;
    return {
      content,
      totalElements: content.length,
      totalPages: 1,
      number: page,
      size,
    };
  }

  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: query.size ?? 10,
  };
}

/** ====== Shims ====== */
export type HistoryItem = TranslationRecordDTO;
export type HistoryFilters = RecordsQuery;

export async function getHistory(
  filters: HistoryFilters = {}
): Promise<Paged<HistoryItem>> {
  return getRecords(filters);
}

/** ====== Humanizers ====== */
export function humanizeAuthError(err: unknown): string {
  const ax = err as AxiosError;
  const status = ax?.response?.status;
  const msg = extractServerMessage(err);

  if (status === 401) return "Credenciais inválidas.";
  if (status === 403) return "Sem permissão para acessar.";
  if (status === 429) return "Muitas tentativas. Tente novamente em instantes.";
  if (status && status >= 500) return "Erro no servidor. Tente novamente mais tarde.";
  if (msg) return msg;
  return "Não foi possível realizar o login.";
}

export function humanizeSignupError(err: unknown): string {
  const ax = err as AxiosError;
  const status = ax?.response?.status;
  const msg = extractServerMessage(err);

  if (status === 409) return "E-mail já cadastrado.";
  if (status === 400) return msg || "Dados inválidos no cadastro.";
  if (status && status >= 500) return "Erro no servidor. Tente novamente mais tarde.";
  return msg || "Não foi possível concluir o cadastro.";
}

/** ====== Password reset ====== */
export async function requestPasswordReset(email: string): Promise<void> {
  await api.post(ENDPOINTS.forgot, { email }, { headers: { "Content-Type": "application/json" } });
}
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post(ENDPOINTS.reset, { token, password: newPassword }, { headers: { "Content-Type": "application/json" } });
}
