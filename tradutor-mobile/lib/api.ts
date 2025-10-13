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

export async function apiFetch(path: string, init: RequestInit = {}) {
  const { token } = (await getAuth()) ?? {};
  const headers = new Headers(init.headers as any);

  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  // Se o token expirou/é inválido, o backend devolve 401:
  if (res.status === 401) {
    await clearAuth();
    throw new ApiError("Sessão expirada. Entre novamente.", 401);
  }

  // Tenta decodificar JSON; se não tiver corpo, retorna null
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Erro ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }
  return data;
}
