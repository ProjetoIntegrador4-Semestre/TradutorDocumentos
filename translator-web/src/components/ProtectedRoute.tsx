// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { RoleString } from "../services/api";

type Props = {
  children: React.ReactNode;
  fallbackPath?: string;            // para onde mandar se não autenticado
  requireRole?: Extract<RoleString, "user" | "admin">; // role requerida, ex.: "admin"
};

export default function ProtectedRoute({
  children,
  fallbackPath = "/login",
  requireRole,
}: Props) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // ou um spinner se preferir

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace state={{ from: location }} />;
  }

  if (requireRole && String(user?.role || "").toLowerCase() !== requireRole) {
    // autenticado mas não tem a role — redireciona para página padrão do app
    return <Navigate to="/tradutor" replace />;
  }

  return <>{children}</>;
}
