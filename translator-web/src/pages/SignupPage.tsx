import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, humanizeSignupError } from "../services/api";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importando ícones do react-icons
import "../styles/auth.css";

export default function SignupPage() {
  const nav = useNavigate();
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [confirma, setConfirma] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  
  // Estados para mostrar/esconder as senhas
  const [showSenha, setShowSenha] = React.useState(false);
  const [showConfirma, setShowConfirma] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setOk(null);

    if (senha !== confirma) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await register(nome, email, senha);
      setOk("Cadastro realizado com sucesso! Faça login para continuar.");
      setTimeout(() => nav("/login"), 1200);
    } catch (err: any) {
      setErro(humanizeSignupError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Cadastre-se</h2>
        <p className="description">
          Registre-se em poucos passos e tenha acesso a um serviço de tradução completo
        </p>

        {erro && <p className="error">{erro}</p>}
        {ok && <p className="success">{ok}</p>}

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

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showConfirma ? "text" : "password"} // Alternando entre texto e senha
                placeholder="Confirmar senha"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                required
              />
              <div
                className="eye-icon"
                onClick={() => setShowConfirma(!showConfirma)} // Alterna o estado do olho
              >
                {showConfirma ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="foot">
          Já tem conta?{" "}
          <Link className="link" to="/login">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
