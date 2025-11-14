import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MeDTO } from "../services/api";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
  logout as apiLogout,
  requestPasswordReset,
  resetPassword as apiResetPassword,
  beginGoogleLogin, // ⬅️ usar direto
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

  /** Lê o token local e tenta montar o "me" decodificando o JWT */
  const refreshMe = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  /** Bootstrap inicial */
  useEffect(() => {
    (async () => {
      await refreshMe();
      setLoading(false);
    })();
  }, [refreshMe]);

  /** Reage a mudanças do token (login/logout/OAuth) via evento "auth:change" */
  useEffect(() => {
    const onAuthChange = () => {
      // Atualiza imediatamente a identidade
      refreshMe();
    };
    window.addEventListener("auth:change", onAuthChange);
    return () => window.removeEventListener("auth:change", onAuthChange);
  }, [refreshMe]);

  /** Login tradicional */
  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        await apiLogin(email, password);
        await refreshMe();
      } finally {
        setLoading(false);
      }
    },
    [refreshMe]
  );

  /** Cadastro + login opcional */
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        await apiRegister(name, email, password);
        await apiLogin(email, password); // opcional: já autentica
        await refreshMe();
      } finally {
        setLoading(false);
      }
    },
    [refreshMe]
  );

  /** Logout */
  const logout = useCallback(() => {
    apiLogout(); // limpa token e dispara "auth:change"
    setUser(null);
  }, []);

  /** Forgot/reset */
  const forgotPassword = useCallback(async (email: string) => {
    await requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await apiResetPassword(token, newPassword);
  }, []);

  /** Google OAuth (leva para o backend iniciar o fluxo) */
  const startGoogleLogin = useCallback(() => {
    beginGoogleLogin();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
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
    }),
    [user, loading, login, register, logout, refreshMe, forgotPassword, resetPassword, startGoogleLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

/** Proteção de rotas opcional */
export const RequireAuth: React.FC<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>
> = ({ children, fallback = null }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // pode trocar por spinner
  if (!isAuthenticated) return <>{fallback}</>;
  return <>{children}</>;
};
