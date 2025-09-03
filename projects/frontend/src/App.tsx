// src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import TranslatorPage from "./pages/TranslatorPage";
import HistoryPage from "./pages/HistoryPage";
import FoldersPage from "./pages/FoldersPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Função de verificação de autenticação
const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  return token != null;  // Verifica se há um token JWT no localStorage
};

export default function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/cadastro";

  if (!isAuthenticated() && !isAuthPage) {
    return <Navigate to="/login" />;  // Redireciona para o login se não autenticado
  }

  return (
    <Routes>
      {/* Páginas de Login e Cadastro (não precisam do AppShell) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />

      {/* Páginas internas do App (exigem estar logado) */}
      <Route path="/" element={<Navigate to="/login" />} /> {/* Redireciona para /login ao acessar / */}
      <Route path="/tradutor" element={<AppShell><TranslatorPage /></AppShell>} />
      <Route path="/historico" element={<AppShell><HistoryPage /></AppShell>} />
      <Route path="/pastas" element={<AppShell><FoldersPage /></AppShell>} />
      <Route path="/configuracoes" element={<AppShell><SettingsPage /></AppShell>} />

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
