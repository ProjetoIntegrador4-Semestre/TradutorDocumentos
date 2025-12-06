import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, humanizeSignupError } from "../services/api";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import "../styles/auth.css";

// Função para avaliar a força da senha
const evaluatePasswordStrength = (password: string) => {
  let strength = 0;

  // Verificar o comprimento da senha
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Verificar se contém números
  if (/\d/.test(password)) strength += 1;

  // Verificar se contém letras maiúsculas
  if (/[A-Z]/.test(password)) strength += 1;

  // Verificar se contém caracteres especiais
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

  return strength;
};

// Mapeia a força da senha para cores e texto
const getStrengthLabel = (strength: number) => {
  switch (strength) {
    case 0:
    case 1:
      return { label: "Fraca", color: "#ff0000" };
    case 2:
      return { label: "Média", color: "#ffcc00" };
    case 3:
      return { label: "Boa", color: "#33cc33" };
    case 4:
      return { label: "Muito Boa", color: "#009900" };
    default:
      return { label: "", color: "" };
  }
};

export default function SignupPage() {
  const nav = useNavigate();
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [confirma, setConfirma] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = React.useState(false);

  // Estados para mostrar/esconder as senhas
  const [showSenha, setShowSenha] = React.useState(false);
  const [showConfirma, setShowConfirma] = React.useState(false);

  // Calcular a força da senha
  const passwordStrength = evaluatePasswordStrength(senha);
  const strengthLabel = getStrengthLabel(passwordStrength);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setOk(null);

    if (passwordStrength < 2) {
      setErro("A senha precisa ser no mínimo 'Média' (Use letras, números e símbolos).");
      return;
    }

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
                type={showSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <div
                className="eye-icon"
                onClick={() => setShowSenha(!showSenha)}
              >
                {showSenha ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>

            {isPasswordFocused && senha && (
              <div className="strength-container">
                <div 
                  className="password-strength-bar" 
                  style={{ 
                    width: `${passwordStrength * 25}%`, 
                    backgroundColor: strengthLabel.color 
                  }}
                />
                <span className="strength-text" style={{ color: strengthLabel.color }}>
                  {strengthLabel.label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showConfirma ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirma}
                onChange={(e) => setConfirma(e.target.value)}
                required
              />
              <div
                className="eye-icon"
                onClick={() => setShowConfirma(!showConfirma)}
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
