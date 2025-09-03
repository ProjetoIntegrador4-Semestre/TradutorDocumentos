// src/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //backend
    nav("/tradutor");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="description">Faça login para traduzir seus documentos de forma rápida e segura. Com sua conta, você acompanha o progresso das traduções e tem acesso a todo o histórico de arquivos.</p>

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
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button className="btn" onClick={() => nav("/tradutor")} type="submit">Entrar</button>
        </form>

        <div className="or">ou</div>

        <button className="google-btn" onClick={() => nav("/tradutor")}>
          <img src="/google-logo.png" alt="Google" />
          Entrar com Google
        </button>

        <div className="foot">
          Não tem conta?{" "}
          <Link className="link" to="/cadastro">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
