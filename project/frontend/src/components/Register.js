import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../auth';
import googleLogo from '../assets/google-logo.png'; // Add Google logo image
import { getGoogleAuthUrl } from '../auth';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    try {
      await register(name, email, password);
      setSuccess('Cadastro realizado com sucesso! Redirecionando para login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="container">
      <h2>Cadastro</h2>
      <p className="description">
        Registre-se em poucos passos e tenha acesso a um serviço de tradução completo.
      </p>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Insira seu nome..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Insira seu email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Insira sua senha..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirme sua senha..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">FINALIZE SEU CADASTRO</button>
      </form>
      <div className="or">ou</div>
      <button className="google-btn" onClick={() => (window.location.href = getGoogleAuthUrl())}>
        <img src={googleLogo} alt="Google logo" /> LOGIN COM GOOGLE
      </button>
      <p>
        Já tem uma conta? <a href="/login" className="link">Faça login</a>
      </p>
    </div>
  );
}

export default Register;