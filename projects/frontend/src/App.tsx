import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import TranslatorPage from "./pages/TranslatorPage";
import HistoryPage from "./pages/HistoryPage";
import FoldersPage from "./pages/FoldersPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "../src/pages/LoginPage"
import RegisterPage from "../src/pages/RegisterPage";

export default function App() {
  const { pathname } = useLocation();
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/cadastro");

  if (isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/tradutor" />} />
        <Route path="/tradutor" element={<TranslatorPage />} />
        <Route path="/historico" element={<HistoryPage />} />
        <Route path="/pastas" element={<FoldersPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/tradutor" />} />
      </Routes>
    </AppShell>
  );
}
