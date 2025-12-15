import React from "react";
import { Link, useNavigate } from "react-router-dom";
// import { resetPassword } from "../services/api";
import "../styles/auth.css";

function getTokenFromUrl(): string {
  const q = new URLSearchParams(window.location.search);
  // cobrimos nomes comuns: token / reset_token / code
  return q.get("token") || q.get("reset_token") || q.get("code") || "";
}

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const [senha, setSenha] = React.useState("");
  const [confirma, setConfirma] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const token = React.useMemo(getTokenFromUrl, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setOk(null);

    if (!token) {
      setErro("Link inválido ou expirado. Solicite novamente.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirma) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      // await resetPassword(token, senha);
      setOk("Senha redefinida com sucesso! Você já pode fazer login.");
      setTimeout(() => nav("/login"), 1200);
    } catch (err: any) {
      setErro(err?.response?.data?.detail || err?.message || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Redefinir senha</h2>
        <p className="description">
          Defina sua nova senha para acessar sua conta.
        </p>

        {erro && <p className="error">{erro}</p>}
        {ok && <p className="success">{ok}</p>}

        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <input
              type="password"
              placeholder="Nova senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirmar senha"
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              required
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </button>
        </form>

        <div className="foot">
          Lembrou a senha?{" "}
          <Link className="link" to="/login">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
}
