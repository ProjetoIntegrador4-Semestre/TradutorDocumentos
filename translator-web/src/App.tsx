import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TranslatorPage from "./pages/TranslatorPage";
import OAuthCallback from "./pages/OAuthCallback";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />  {/* nova */}
      <Route path="/resetar-senha" element={<ResetPasswordPage />} />    {/* nova */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      <Route
        path="/tradutor"
        element={
          <ProtectedRoute>
            <AppShell>
              <TranslatorPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/historico"
        element={
          <ProtectedRoute>
            <AppShell>
              <HistoryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />



      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
