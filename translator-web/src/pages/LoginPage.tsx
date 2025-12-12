import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, beginGoogleLogin, humanizeAuthError } from "../services/api";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import "../styles/auth.css";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [erro, setError] = React.useState<string | null>(null);
  
  // Estado para mostrar/esconder a senha
  const [showSenha, setShowSenha] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, senha);
      nav("/tradutor", { replace: true });
    } catch (err: any) {
      setError(humanizeAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="description">
          Faça login para traduzir seus documentos de forma rápida e segura. Com sua conta, você
          acompanha o progresso das traduções e tem acesso a todo o histórico de arquivos.
        </p>

        {erro && <p className="error">{erro}</p>}

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

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showSenha ? "text" : "password"} // Alternando entre texto e senha
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <div
                className="eye-icon"
                onClick={() => setShowSenha(!showSenha)} // Alterna o estado do olho
              >
                {showSenha ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="or">ou</div>

        <button className="google-btn" type="button" onClick={() => beginGoogleLogin()}>
          <img src="/google-logo.png" alt="Google" />
          Entrar com Google
        </button>

        <div className="foot">
          Não tem conta?{" "}
          <Link className="link" to="/cadastro">
            Cadastre-se
          </Link>
        </div>

        <div className="foot" style={{ marginTop: 10 }}>
          <Link className="link" to="/esqueci-senha">Esqueceu a senha?</Link>
        </div>
      </div>
    </div>
  );
}
