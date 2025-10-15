// src/pages/OAuthCallback.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { consumeOAuthTokenFromUrl, getMe } from "../services/api";

export default function OAuthCallback() {
  const nav = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const token = consumeOAuthTokenFromUrl(); // lê ?token=... ou #access_token=...
      if (!token) {
        setError("Não foi possível obter o token do Google.");
        return;
      }
      try {
        await getMe(); 
        nav("/translator", { replace: true });
      } catch {
        setError("Token inválido ou expirado.");
      }
    })();
  }, [nav]);

  return (
    <div style={{ maxWidth: 480, margin: "15vh auto", padding: 24, textAlign: "center" }}>
      {!error ? (<><h2>Entrando…</h2><p>Concluindo seu login com o Google.</p></>)
              : (<><h2>Ops</h2><p>{error}</p><a href="/">Voltar</a></>)}
    </div>
  );
}
