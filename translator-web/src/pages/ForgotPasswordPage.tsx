import React from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/api";
import "../styles/auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setOk(null);
    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setOk("Se o e-mail existir, você receberá um link para redefinir a senha.");
    } catch (err: any) {
      setErro(err?.response?.data?.detail || err?.message || "Não foi possível enviar o e-mail agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Recuperar senha</h2>
        <p className="description">
          Informe seu e-mail para receber um link seguro de redefinição de senha.
        </p>

        {erro && <p className="error">{erro}</p>}
        {ok && <p className="success">{ok}</p>}

        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link"}
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
