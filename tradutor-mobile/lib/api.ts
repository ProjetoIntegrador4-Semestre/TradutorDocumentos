// lib/api.ts
import { getAuth, clearAuth } from "./storage";

export const BASE_URL = "http://localhost:8080";

export class ApiError extends Error {
  status?: number;
  details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path: string) {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * authFetch → anexa o JWT (se existir) e retorna o Response "cru".
 * Use em rotas PROTEGIDAS (ex.: /translate-file, /records, etc).
 * NÃO use em /api/auth/signin e /api/auth/signup.
 */
export async function authFetch(path: string, init: RequestInit = {}) {
  const saved = await getAuth();
  const token = saved?.token;

  const headers = new Headers(init.headers as any);
  headers.set("Accept", "application/json");

  // Não setar Content-Type quando for FormData (boundary é automático)
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(buildUrl(path), { ...init, headers });

  // Se o token expirou/é inválido, limpe a sessão (deixe o caller decidir o fluxo)
  if (res.status === 401) {
    await clearAuth();
  }

  return res;
}

/**
 * apiFetch → usa authFetch, faz parse do corpo e lança erro em !ok.
 * Útil quando você já espera JSON e quer tratar erro aqui.
 */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await authFetch(path, init);

  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError("Sessão expirada. Entre novamente.", 401);
    }
    const msg = (data && (data.message || data.error)) || `Erro ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }

  return data;
}
