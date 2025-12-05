// app/(tabs)/AdminScreen.tsx

import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Contexto para gerenciar autenticação

const AdminScreen = () => {
  const { user, signOut } = useAuth();
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', role: 'user' },
    { id: '2', name: 'Jane Doe', role: 'admin' },
  ]);

  const handleAddUser = () => {
    const newUser = {
      id: (users.length + 1).toString(),
      name: 'Novo Usuário',
      role: 'user',
    };
    setUsers([...users, newUser]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handlePromoteUser = (id: string) => {
    const updated = users.map(u =>
      u.id === id ? { ...u, role: 'admin' } : u
    );
    setUsers(updated);
  };

  return (
    <View>
      <Text>Bem-vindo, {user?.name}</Text>

      <Button title="Logout" onPress={signOut} />

      <Button title="Adicionar usuário" onPress={handleAddUser} />

      <FlatList
        data={users}
        keyExtractor={u => u.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name} — {item.role}</Text>

            {item.role !== 'admin' && (
              <Button title="Promover para admin" onPress={() => handlePromoteUser(item.id)} />
            )}

            <Button title="Excluir" onPress={() => handleDeleteUser(item.id)} />
          </View>
        )}
      />
    </View>
  );
};
