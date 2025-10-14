// src/pages/OAuthCallback.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { consumeOAuthTokenFromUrl } from "../services/api"; // ajuste o alias se não usa @
import { useAuth } from "../context/AuthContext";          // opcional, se estiver usando o contexto
import "../styles/auth.css";

export default function OAuthCallback() {
  const nav = useNavigate();
  const { refreshMe } = useAuth?.() ?? { refreshMe: async () => {} }; // fallback se não tiver contexto
  const [msg, setMsg] = React.useState("Concluindo login...");

  React.useEffect(() => {
    (async () => {
      try {
        // tenta extrair token do hash/query e salvar no storage
        const token = consumeOAuthTokenFromUrl();
        if (!token) {
          setMsg("Token não recebido. Tente novamente.");
          // redireciona para login após breve pausa
          setTimeout(() => nav("/login", { replace: true }), 1500);
          return;
        }

        // opcional: atualiza o perfil logado
        try {
          await refreshMe();
        } catch {
          // se der erro, segue mesmo assim; o BE pode não expor /auth/me
        }

        // vá para a tela pós-login
        nav("/tradutor", { replace: true });
      } catch (_e) {
        setMsg("Falha no login com Google. Tente novamente.");
        setTimeout(() => nav("/login", { replace: true }), 1500);
      }
    })();
  }, [nav, refreshMe]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login com Google</h2>
        <p className="description">{msg}</p>
      </div>
    </div>
  );
}
