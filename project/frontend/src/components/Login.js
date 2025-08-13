import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, getGoogleAuthUrl } from '../auth';
import googleLogo from '../assets/google-logo.png'; // Add Google logo image

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError('Erro ao iniciar login com Google');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <p className="description">
        Faça login para traduzir seus documentos de forma rápida e segura. Com sua conta, você acompanha o progresso das traduções e tem acesso a todo o histórico de arquivos.
      </p>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
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
        <button type="submit">LOGIN</button>
      </form>
      <div className="or">ou</div>
      <button className="google-btn" onClick={handleGoogleLogin}>
        <img src={googleLogo} alt="Google logo" /> LOGIN COM GOOGLE
      </button>
      <p>
        Não tem uma conta? <a href="/register" className="link">Cadastre-se</a>
      </p>
    </div>
  );
}

export default Login;