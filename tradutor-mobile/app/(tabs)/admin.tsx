import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../lib/api";
import { getAuth } from "../../lib/storage";
import { useTheme } from "../../context/ThemeContext";  // Importando o tema

export default function AdminPage() {
  const { user } = useAuth();
  const { theme } = useTheme();  // Usando o tema
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "yes" | "no">(
    "all"
  );

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    applyFilters();
  }, [search, roleFilter, enabledFilter, users]);

  //  Carregar usuários
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

  //  Alterar função
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

  //  Ativar/Desativar
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

  //  Excluir usuário
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

  //  Filtrar e buscar
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
    if (isAdmin) loadUsers();
    else setLoading(false);
  }, []);

  //  Tela restrita
  if (!isAdmin) {
    return (
      <View style={styles.centered}>
        <Text style={styles.restrictedTitle}>🚫 Área restrita</Text>
        <Text style={styles.restrictedText}>
          Apenas administradores podem acessar esta aba.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  //
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <Text style={[styles.pageTitle, { color: theme.colors.text }]}>👥 Gerenciamento de Usuários</Text>

      {/* 🔍 Campo de busca */}
      <TextInput
        placeholder=" Buscar usuário..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
      />

      {/*  Filtros */}
      <View style={styles.filters}>
        <TouchableOpacity
          onPress={() =>
            setRoleFilter((prev) =>
              prev === "all" ? "admin" : prev === "admin" ? "user" : "all"
            )
          }
          style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.filterButtonText}>Função: {roleFilter}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setEnabledFilter((prev) =>
              prev === "all" ? "yes" : prev === "yes" ? "no" : "all"
            )
          }
          style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.filterButtonText}>Status: {enabledFilter}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.userCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.userCardTitle, { color: theme.colors.text }]}>
              {item.username} {item.role === "admin" ? "*" : ""}
            </Text>
            <Text style={[styles.userCardText, { color: theme.colors.muted }]}> {item.email}</Text>
            <Text style={[styles.userCardText, { color: theme.colors.muted }]}> Função: {item.role}</Text>
            <Text style={[styles.userCardText, { color: theme.colors.muted }]}>
                 Status: {item.enabled ? " Ativo" : "Inativo"}
            </Text>

            {/* Botões */}
            <View style={styles.actionButtons}>
              {/* Alterar função */}
              <TouchableOpacity
                onPress={() => toggleRole(item)}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.actionButtonText}>
                   {item.role === "admin" ? "Tornar User" : "Tornar Admin"}
                </Text>
              </TouchableOpacity>

              {/* Ativar / Desativar */}
              <TouchableOpacity
                onPress={() => toggleEnabled(item)}
                style={[
                  styles.actionButton,
                  { backgroundColor: item.enabled ? "#535353ff" : "#28a745" },
                ]}
              >
                <Text style={styles.actionButtonText}>
                  {item.enabled ? " Desativar" : "✔ Ativar"}
                </Text>
              </TouchableOpacity>

              {/* Excluir */}
              <TouchableOpacity
                onPress={() => deleteUser(item.id)}
                style={[styles.actionButton, { backgroundColor: "#dc2626" }]}
              >
                <Text style={styles.actionButtonText}>🗑 Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7F9FB",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#B0C1D1",
    marginBottom: 15,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    width: "48%",
    marginTop: 5,
  },
  filterButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  userCard: {
    padding: 20,
    marginTop: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  userCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
  },
  userCardText: {
    fontSize: 15,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    padding: 2,
    borderRadius: 10,
    width: "32%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  restrictedText: {
    fontSize: 16,
    textAlign: "center",
  },
});

