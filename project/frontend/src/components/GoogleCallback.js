import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setToken, setRefresh } from '../auth';

function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const access = query.get('token');
    const refresh = query.get('refresh');
    const error = query.get('error');

    if (error) {
      navigate('/login', { state: { error: `Erro na autenticação com Google: ${decodeURIComponent(error)}` }, replace: true });
      return;
    }

    if (access) {
      setToken(access);
      if (refresh) setRefresh(refresh);
      window.location.replace('/tradutor');
      return;
    }

    navigate('/login', { state: { error: 'Falha na autenticação com Google: Token não encontrado' }, replace: true });
  }, [location, navigate]);

  return (
    <div className="auth-container">
      <h2>Processando login...</h2>
      <p>Aguarde enquanto autenticamos sua conta.</p>
    </div>
  );
}

export default GoogleCallback;
