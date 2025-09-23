import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../lib/api";
import { ApiError } from "../lib/api";
import { getAuth, saveAuth, clearAuth } from "../lib/storage";

type User = { id?: string; name?: string; email: string };

/*******  d323c8f0-99d4-4b0a-96eb-9e4fc8ac9198  *******/type AuthCtx = {
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

  // carrega sessão
  useEffect(() => {
    (async () => {
      try {
        const { token, user } = await getAuth();
        if (token && user) setUser(user);
        else await clearAuth();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // LOGIN: /auth/login (x-www-form-urlencoded)
  async function signIn(email: string, password: string) {
    const body = new URLSearchParams({
      grant_type: "password",
      username: email,
      password,
      scope: "",
      client_id: "",
      client_secret: "",
    });

    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    let data: any = null; try { data = await res.json(); } catch {}
    if (!res.ok) throw new ApiError(data?.message || data?.detail || `Erro ${res.status}`, res.status, data);

    const token: string | undefined = data?.access_token || data?.accessToken || data?.token;
    if (!token) throw new ApiError("Token não retornado pelo login", 500, data);

    const u: User = { email, name: data?.user?.name || "Usuário(a)", id: data?.user?.id };
    await saveAuth(token, u, null);
    setUser(u);
  }

  // CADASTRO: /auth/register (JSON { email, password, role })
  async function signUp(name: string, email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "user" }),
    });

    let data: any = null; try { data = await res.json(); } catch {}
    if (!res.ok) throw new ApiError(data?.message || data?.detail || `Erro ${res.status}`, res.status, data);

    // se o cadastro não retornar token, faz login em seguida
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
