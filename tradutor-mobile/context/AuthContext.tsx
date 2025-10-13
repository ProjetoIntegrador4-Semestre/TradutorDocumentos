// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BASE_URL, ApiError } from "../lib/api";
import { getAuth, saveAuth, clearAuth } from "../lib/storage";

type User = { id?: string | number; name?: string; email: string; role?: string };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getAuth();
        if (saved?.token && saved?.user) setUser(saved.user);
        else await clearAuth();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // --- LOGIN (sem token) ---
  async function signIn(email: string, password: string) {
    const userId = email.trim().toLowerCase();
    const payload = { email: userId, username: userId, password };

    const res = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = null; try { data = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok) {
      if (res.status === 401) throw new ApiError("E-mail ou senha incorretos.", 401);
      const msg = data?.message || data?.error || text || `Erro ${res.status}`;
      console.log("SIGNIN ERROR →", res.status, msg);
      throw new ApiError(msg, res.status, data ?? text);
    }

    const token: string | undefined = data?.token || data?.accessToken;
    if (!token) throw new ApiError("Token não retornado pelo login.");

    const u = {
      id: data?.id,
      email: data?.email ?? userId,
      role: data?.role,
      name: data?.username ?? data?.name ?? (data?.email ? String(data.email).split("@")[0] : "Usuário(a)"),
    };

    await saveAuth(token, u, null);
    setUser(u);
  }

  // --- CADASTRO (sem token) ---
  async function signUp(name: string, email: string, password: string) {
    const payload = { username: name, name, email, password, confirmPassword: password };

    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: any = null; try { data = text ? JSON.parse(text) : null; } catch {}

    if (!res.ok) {
      const msg = data?.message || data?.error || text || `Erro ${res.status}`;
      console.log("SIGNUP ERROR →", res.status, msg);
      throw new ApiError(msg, res.status, data ?? text);
    }

    // Faz login após cadastrar
    await signIn(email, password);
  }

  async function signOut() {
    await clearAuth();
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
