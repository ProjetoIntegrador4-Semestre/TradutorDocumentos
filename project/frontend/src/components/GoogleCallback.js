import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setToken } from '../auth';

function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (token) {
      setToken(token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { state: { error: 'Falha na autenticação com Google' }, replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="container">
      <h2>Processando login...</h2>
      <p>Aguarde enquanto autenticamos sua conta.</p>
    </div>
  );
}

export default GoogleCallback;