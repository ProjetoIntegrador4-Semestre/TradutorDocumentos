import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, listUsers, updateUserRole, removeToken } from '../auth';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        if (userData.role === 'admin') {
          try {
            const usersData = await listUsers();
            setUsers(usersData);
          } catch (err) {
            setError(err);
          }
        }
      } else {
        setError('Sessão expirada. Faça login novamente.');
        navigate('/login');
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const handleRoleChange = async (userEmail, newRole) => {
    try {
      const userToUpdate = users.find(u => u.email === userEmail);
      if (!userToUpdate) throw new Error('Usuário não encontrado');
      await updateUserRole(userToUpdate.id, newRole);
      setUsers(users.map(u => u.email === userEmail ? { ...u, role: newRole } : u));
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="container">
      <h2>Bem-vindo à Tela Principal</h2>
      {error && <p className="error">{error}</p>}
      {user && (
        <>
          <p>Logado como: {user.name} ({user.email}, {user.role})</p>
          {user.role === 'admin' ? (
            <div>
              <h3>Gerenciar Usuários</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.email}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.email, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="employee">Employee</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <h3>Funcionário</h3>
              <p>Bem-vindo, {user.name}! Aqui você pode visualizar suas informações básicas.</p>
              <p>Funcionalidades de funcionário em desenvolvimento.</p>
            </div>
          )}
          <button onClick={handleLogout} style={{ marginTop: '20px' }}>Sair</button>
        </>
      )}
    </div>
  );
}

export default Dashboard;