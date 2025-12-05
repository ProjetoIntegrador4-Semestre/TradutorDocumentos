import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../lib/api";
import { getAuth } from "../../lib/storage";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "yes" | "no">(
    "all"
  );

  const isAdmin = user?.role === "admin";

  // 🔥 Carregar usuários
  async function loadUsers() {
    try {
      setLoading(true);
      const auth = await getAuth();
      const token = auth?.token;

      const res = await fetch(`${BASE_URL}/api/admin/users`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao carregar.");

      const data = await res.json();
      setUsers(data.content ?? []);
      setFiltered(data.content ?? []);
    } catch (e) {
      if (isAdmin) alert("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  // 🔥 Alterar função
  async function toggleRole(u: any) {
    const newRole = u.role === "admin" ? "user" : "admin";

    const auth = await getAuth();
    const token = auth?.token;

    const res = await fetch(`${BASE_URL}/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) return alert("Erro ao atualizar função.");
    loadUsers();
  }

  // 🔥 Ativar/Desativar
  async function toggleEnabled(u: any) {
    const auth = await getAuth();
    const token = auth?.token;

    const res = await fetch(`${BASE_URL}/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ enabled: !u.enabled }),
    });

    if (!res.ok) return alert("Erro ao atualizar status.");
    loadUsers();
  }

  // 🔥 Excluir usuário
  async function deleteUser(id: number) {
    const auth = await getAuth();
    const token = auth?.token;

    const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return alert("Erro ao excluir usuário.");
    loadUsers();
  }

  // 🔍 Filtrar e buscar
  function applyFilters() {
    let list = [...users];

    list = list.filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (enabledFilter === "yes") list = list.filter((u) => u.enabled);
    if (enabledFilter === "no") list = list.filter((u) => !u.enabled);

    setFiltered(list);
  }

  useEffect(() => {
    applyFilters();
  }, [search, roleFilter, enabledFilter, users]);

  useEffect(() => {
    if (isAdmin) loadUsers();
    else setLoading(false);
  }, []);

  // 🛑 Tela restrita
  if (!isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
          🚫 Área restrita
        </Text>
        <Text style={{ fontSize: 16, textAlign: "center" }}>
          Apenas administradores podem acessar esta aba.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🎨 UI moderna
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f6f6f6" }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          alignSelf: "center",
          marginBottom: 15,
        }}
      >
        👥 Gerenciamento de Usuários
      </Text>

      {/* 🔍 Campo de busca */}
      <TextInput
        placeholder="🔎 Buscar usuário..."
        value={search}
        onChangeText={setSearch}
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 12,
          fontSize: 16,
          borderWidth: 1,
          borderColor: "#ddd",
          marginBottom: 15,
        }}
      />

      {/* 🔘 Filtros */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            setRoleFilter((prev) =>
              prev === "all" ? "admin" : prev === "admin" ? "user" : "all"
            )
          }
          style={{
            backgroundColor: "#007bff",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            🔧 Função:{" "}
            {roleFilter === "all"
              ? "Todos"
              : roleFilter === "admin"
              ? "Admins"
              : "Users"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setEnabledFilter((prev) =>
              prev === "all" ? "yes" : prev === "yes" ? "no" : "all"
            )
          }
          style={{
            backgroundColor: "#28a745",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            🔌 Status:{" "}
            {enabledFilter === "all"
              ? "Todos"
              : enabledFilter === "yes"
              ? "Ativos"
              : "Inativos"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              marginTop: 15,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#ddd",
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 4,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 5 }}>
              {item.username} {item.role === "admin" ? "⭐" : ""}
            </Text>

            <Text style={{ fontSize: 15 }}>📧 {item.email}</Text>
            <Text style={{ fontSize: 15 }}>🛠️ Função: {item.role}</Text>
            <Text style={{ fontSize: 15 }}>
              🔌 Status: {item.enabled ? "Ativo" : "Inativo"}
            </Text>

            {/* Botões */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 15,
              }}
            >
              {/* Alterar função */}
              <TouchableOpacity
                onPress={() => toggleRole(item)}
                style={{
                  backgroundColor: "#007bff",
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  🔁 {item.role === "admin" ? "Tornar User" : "Tornar Admin"}
                </Text>
              </TouchableOpacity>

              {/* Ativar / Desativar */}
              <TouchableOpacity
                onPress={() => toggleEnabled(item)}
                style={{
                  backgroundColor: item.enabled ? "#ffc107" : "#28a745",
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {item.enabled ? "⛔ Desativar" : "✔ Ativar"}
                </Text>
              </TouchableOpacity>

              {/* Excluir */}
              <TouchableOpacity
                onPress={() => deleteUser(item.id)}
                style={{
                  backgroundColor: "red",
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>🗑 Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
