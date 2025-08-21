const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const setToken = (t) => localStorage.setItem('access_token', t);
export const getToken = () => localStorage.getItem('access_token');
export const setRefresh = (t) => localStorage.setItem('refresh_token', t);
export const getRefresh = () => localStorage.getItem('refresh_token');
export const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export async function register(name, email, password) {
  const res = await fetch(`${API}/auth/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: name, email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data.detail || 'Erro no cadastro';
  return data;
}

export async function login(email, password) {
  const params = new URLSearchParams();
  params.append('username', email); 
  params.append('password', password);

  const res = await fetch(`${API}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data.detail || 'Credenciais inválidas';

  setToken(data.access_token);
  setRefresh(data.refresh_token);
  return data;
}

export async function refresh() {
  const r = getRefresh();
  if (!r) throw 'Sem refresh token';
  const res = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: r }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data.detail || 'Falha no refresh';
  setToken(data.access_token);
  setRefresh(data.refresh_token);
  return data;
}

export function getGoogleAuthUrl() {
  return `${API}/auth/google/login`;
}

export async function authFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return res;
}
