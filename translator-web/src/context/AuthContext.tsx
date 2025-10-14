import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { MeDTO } from "../services/api";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logout as apiLogout,
  requestPasswordReset,
  resetPassword as apiResetPassword,
  getGoogleOAuthUrl,
} from "../services/api";

type AuthState = {
  user: MeDTO | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  startGoogleLogin: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<MeDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch (_e) {
      // token inválido/expirado ou usuário não encontrado
      setUser(null);
    }
  }, []);

  // Bootstrap: se existir token salvo, tenta buscar /auth/me
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    (async () => {
      if (token) {
        await refreshMe();
      } else {
        setUser(null);
      }
      setLoading(false);
    })();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await apiLogin(email, password);
      await refreshMe();
    } finally {
      setLoading(false);
    }
  }, [refreshMe]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      await apiRegister(name, email, password);
      // opcional: já efetuar login após cadastro
      await apiLogin(email, password);
      await refreshMe();
    } finally {
      setLoading(false);
    }
  }, [refreshMe]);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await apiResetPassword(token, newPassword);
  }, []);

  const startGoogleLogin = useCallback(() => {
    const url = getGoogleOAuthUrl();
    if (url) {
      window.location.href = url;
    } else {
      console.warn("VITE_GOOGLE_OAUTH_URL não configurada.");
    }
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshMe,
    forgotPassword,
    resetPassword,
    startGoogleLogin,
  }), [user, loading, login, register, logout, refreshMe, forgotPassword, resetPassword, startGoogleLogin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

/**
 * Componente helper opcional para proteger rotas
 */
export const RequireAuth: React.FC<React.PropsWithChildren<{ fallback?: React.ReactNode }>> = ({ children, fallback = null }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // ou um spinner
  if (!isAuthenticated) return <>{fallback}</>;
  return <>{children}</>;
};
