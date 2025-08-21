import { getToken, getRefresh, setToken, setRefresh, clearAuth } from "../auth";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function tryRefresh() {
  const r = getRefresh();
  if (!r) return false;
  const res = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: r }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (data?.access_token) {
    setToken(data.access_token);
    if (data.refresh_token) setRefresh(data.refresh_token);
    return true;
  }
  return false;
}

export async function authFetch(path, options = {}, binary = false) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 401 && await tryRefresh()) {
    const headers2 = new Headers(options.headers || {});
    const t2 = getToken();
    if (t2) headers2.set("Authorization", `Bearer ${t2}`);
    const res2 = await fetch(`${API}${path}`, { ...options, headers: headers2 });
    return res2;
  }
  if (res.status === 401) clearAuth();
  return res;
}

export const apiBase = API;
