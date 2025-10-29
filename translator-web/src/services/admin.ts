import { api } from "./api";
import type { RoleString, Paged } from "./api";

/* ============================
   Tipos
   ============================ */
export interface AdminUserDTO {
  id: number | string;
  username: string;
  email: string;
  role: RoleString;      // "user" | "admin"
  enabled: boolean;
}

export interface AdminUserQuery {
  page?: number;
  size?: number;
  q?: string;
  role?: "user" | "admin";
  enabled?: boolean;
}

export interface AdminRecordDTO {
  id: number | string;
  originalName?: string;
  translatedName?: string;
  sourceLang?: string;
  targetLang?: string;
  fileType?: string;
  sizeBytes?: number;
  status?: string;
  createdAt?: string | number;
  downloadUrl?: string;
}

export type AdminUserPatch = Partial<Pick<AdminUserDTO, "username" | "role" | "enabled">>;

/* ============================
   Helpers
   ============================ */
function mapRecordItem(serverItem: any): AdminRecordDTO {
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

function extractError(e: any): { status?: number; message: string } {
  const status = e?.response?.status;
  const data = e?.response?.data;
  const msg =
    data?.error ||
    data?.message ||
    e?.message ||
    "Ocorreu um erro inesperado.";
  return { status, message: msg };
}

/* ============================
   Users
   ============================ */
export async function adminListUsers(
  query: AdminUserQuery = {}
): Promise<Paged<AdminUserDTO>> {
  const params = new URLSearchParams();
  if (typeof query.page === "number") params.set("page", String(query.page));
  if (typeof query.size === "number") params.set("size", String(query.size));
  if (query.q) params.set("q", query.q);
  if (query.role) params.set("role", query.role);
  if (typeof query.enabled === "boolean") params.set("enabled", String(query.enabled));

  const url = "/api/admin/users" + (params.toString() ? `?${params.toString()}` : "");
  const r = await api.get(url);
  return r.data as Paged<AdminUserDTO>;
}

export async function adminUpdateUser(
  id: number | string,
  patch: AdminUserPatch
): Promise<AdminUserDTO> {
  const r = await api.patch(`/api/admin/users/${id}`, patch, {
    headers: { "Content-Type": "application/json" },
  });
  return r.data as AdminUserDTO;
}

/**
 * Exclui usuário. Se houver vínculos (documentos), o backend retorna 409.
 * Passe { force: true } para exclusão forçada (?force=true) que apaga os documentos antes.
 */
export async function adminDeleteUser(
  id: number | string,
  opts: { force?: boolean } = {}
): Promise<void> {
  const qs = opts.force ? "?force=true" : "";
  try {
    await api.delete(`/api/admin/users/${id}${qs}`);
  } catch (e: any) {
    const { status, message } = extractError(e);
    if (status === 409) {
      // Conflito de integridade (usuário com documentos vinculados)
      throw new Error(
        message || "Usuário possui documentos vinculados. Exclua-os ou use a exclusão forçada."
      );
    }
    throw new Error(message);
  }
}

/** Atalho para exclusão forçada */
export async function adminForceDeleteUser(id: number | string): Promise<void> {
  return adminDeleteUser(id, { force: true });
}

/* ============================
   Registros (documentos) do usuário
   ============================ */
export async function adminListUserRecords(
  userId: number | string,
  page = 0,
  size = 20
): Promise<Paged<AdminRecordDTO>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const r = await api.get(`/api/admin/users/${userId}/records?${params.toString()}`);
  const data = r.data;

  if (data && Array.isArray(data.content)) {
    return {
      ...data,
      content: data.content.map(mapRecordItem),
    };
  }
  if (Array.isArray(data)) {
    const content = data.map(mapRecordItem);
    return {
      content,
      totalElements: content.length,
      totalPages: 1,
      number: 0,
      size,
    };
  }
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size,
  };
}

export async function adminDeleteUserRecord(
  userId: number | string,
  recordId: number | string
): Promise<void> {
  try {
    await api.delete(`/api/admin/users/${userId}/records/${recordId}`);
  } catch (e: any) {
    const { message } = extractError(e);
    throw new Error(message);
  }
}
