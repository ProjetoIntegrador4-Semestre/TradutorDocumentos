import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    setToken(response.data.access_token);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Erro ao fazer login';
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, confirm_password: password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Erro ao cadastrar';
  }
};

export const getGoogleAuthUrl = async () => {
  const response = await axios.get(`${API_URL}/auth/google/login`);
  return response.data.url;
};

export const handleGoogleCallback = async (code) => {
  try {
    const response = await axios.get(`${API_URL}/auth/google/callback?code=${code}`);
    setToken(response.data.access_token);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Erro ao autenticar com Google';
  }
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    removeToken();
    return null;
  }
};

export const listUsers = async () => {
  const token = getToken();
  if (!token) throw new Error('No token');
  try {
    const response = await axios.get(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Erro ao listar usuários';
  }
};

export const updateUserRole = async (userId, newRole) => {
  const token = getToken();
  if (!token) throw new Error('No token');
  try {
    const response = await axios.put(`${API_URL}/auth/users/${userId}/role`, { new_role: newRole }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Erro ao atualizar role';
  }
};