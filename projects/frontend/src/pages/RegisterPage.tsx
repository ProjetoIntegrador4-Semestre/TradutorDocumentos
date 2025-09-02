import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function RegisterPage() {
  const nav = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirma) {
      setErro("As senhas não coincidem.");
      return;
    }
    setErro("");
    // backend
    nav("/tradutor");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Cadastre-se</h2>
        <p className="description">Registre-se em poucos passos e tenha acesso a um serviço de tradução completo</p>

        {erro && <p className="error">{erro}</p>}

        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirmar senha"
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              required
            />
          </div>

          <button className="btn" type="submit">Cadastrar</button>
        </form>

        <div className="or">ou</div>

        <button className="google-btn" onClick={() => nav("/tradutor")}>
          <img src="/google-logo.png" alt="Google" />
          Cadastre-se com Google
        </button>

        <div className="foot">
          Já tem conta?{" "}
          <Link className="link" to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
