import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import TranslatorPage from "./pages/TranslatorPage";
import HistoryPage from "./pages/HistoryPage";
import FoldersPage from "./pages/FoldersPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
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
