import type { RoleString } from "../services/api";

export function isAdminRole(role?: RoleString | string | null | undefined): boolean {
  const r = String(role || "").toLowerCase().replace(/^role_/, "");
  return r === "admin";
}
