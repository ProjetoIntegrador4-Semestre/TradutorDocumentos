import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Platform } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import CreateFolderSheet from "../../components/CreateFolderSheet";
import RenameFolderSheet from "../../components/RenameFolderSheet";
import FolderCard from "../../components/FolderCard";
import { useTheme } from "../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export type Folder = { id: string; name: string; owner: string; created_at: string; children?: Folder[] };

function addChild(node: Folder, parentId: string, child: Folder): Folder {
  if (node.id === parentId) return { ...node, children: [child, ...(node.children ?? [])] };
  return { ...node, children: (node.children ?? []).map((c) => addChild(c, parentId, child)) };
}
function removeNode(node: Folder, id: string): Folder {
  return { ...node, children: (node.children ?? []).filter((c) => c.id !== id).map((c) => removeNode(c, id)) };
}
function updateName(node: Folder, id: string, name: string): Folder {
  if (node.id === id) return { ...node, name };
  return { ...node, children: (node.children ?? []).map((c) => updateName(c, id, name)) };
}
function findById(node: Folder, id: string): Folder | null { if (node.id === id) return node; for (const c of node.children ?? []) { const f = findById(c, id); if (f) return f; } return null; }
function getFolderByPath(root: Folder, pathIds: string[]): Folder { let cur = root; for (let i=1;i<pathIds.length;i++) cur=(cur.children??[]).find(c=>c.id===pathIds[i])??cur; return cur; }

// confirm cross-platform
function confirmDelete(message: string): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => {
    Alert.alert("Confirmar", message, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: "Excluir", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export default function Folders() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [tree, setTree] = useState<Folder>({
    id: "root",
    name: "Todas as pastas",
    owner: "User",
    created_at: new Date().toISOString(),
    children: [
      { id: "1", name: "Pasta 1", owner: "User", created_at: "2025-08-22", children: [] },
      { id: "2", name: "Pasta 2", owner: "User", created_at: "2025-04-02", children: [
        { id: "2-1", name: "Relatórios", owner: "User", created_at: "2025-04-15", children: [] },
      ]},
      { id: "3", name: "Pasta 3", owner: "User", created_at: "2024-12-04", children: [] },
      { id: "4", name: "Pasta 4", owner: "User", created_at: "2025-08-21", children: [] },
    ],
  });
  const [pathIds, setPathIds] = useState<string[]>(["root"]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const current = useMemo(() => getFolderByPath(tree, pathIds), [tree, pathIds]);
  const currentChildren = (current.children ?? []).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  function onCreate(name: string) {
    if (!name.trim()) return;
    const newF: Folder = { id: String(Date.now()), name, owner: "User", created_at: new Date().toISOString(), children: [] };
    setTree((t) => addChild(t, pathIds[pathIds.length - 1], newF));
    setSheetOpen(false);
  }
  function openFolder(id: string) { setPathIds((p) => [...p, id]); }
  function goTo(levelIndex: number) { setPathIds((p) => p.slice(0, levelIndex + 1)); }
  function onRename(newName: string) {
    const trimmed = newName.trim(); if (!trimmed) return setRenameOpen(false);
    setTree((t) => updateName(t, pathIds[pathIds.length - 1], trimmed));
    setRenameOpen(false);
  }
  async function onDelete(folder: Folder) {
    if (folder.id === "root") return;
    const ok = await confirmDelete(`Deseja realmente excluir a pasta “${folder.name}”?`);
    if (!ok) return;
    if (pathIds[pathIds.length - 1] === folder.id) setPathIds((p) => p.slice(0, -1));
    setTree((t) => removeNode(t, folder.id));
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopGreeting />

      <View style={{ padding: 16, rowGap: 12 }}>
        <View style={[styles.headerChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text, fontWeight: "700" }}>Pastas</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, gap: 10 }]}>
          {/* Breadcrumb */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
            {pathIds.map((id, i) => {
              const f = findById(tree, id)!; const isLast = i === pathIds.length - 1;
              return (
                <View key={id} style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity disabled={isLast} onPress={() => goTo(i)}>
                    <Text style={{ color: isLast ? theme.colors.text : theme.colors.primary, fontWeight: isLast ? "700" : "600" }}>{f.name}</Text>
                  </TouchableOpacity>
                  {!isLast && <Text style={{ marginHorizontal: 6, color: theme.colors.muted }}>›</Text>}
                </View>
              );
            })}
          </View>

          {/* Ações da pasta atual */}
          {current.id !== "root" && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setRenameOpen(true)} style={[styles.smallBtn, { borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.text, fontWeight: "600", fontSize: 12 }}>Renomear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(current)} style={[styles.smallBtn, { backgroundColor: "#EF4444", borderColor: "#EF4444" }]}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Armazenamento */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.primary, marginBottom: 6, fontWeight: "600" }}>Armazenamento Disponível</Text>
          <View style={styles.progressTrack}><View style={[styles.progressBar, { backgroundColor: theme.colors.primary }]} /></View>
          <Text style={{ color: theme.colors.muted, marginTop: 4 }}>0,5 GB de 5 GB usados</Text>
        </View>

        {/* Criar dentro da atual */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ fontWeight: "700", color: theme.colors.text, marginBottom: 8 }}>
            Criar nova pasta {current.id !== "root" ? `em “${current.name}”` : ""}
          </Text>
          <TouchableOpacity onPress={() => setSheetOpen(true)} style={[styles.cta, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.ctaText}>+ Nova pasta</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <FlatList
          data={currentChildren}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingTop: 6, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <FolderCard
              folder={item}
              onOpen={() => openFolder(item.id)}
              onShare={() => Alert.alert("Compartilhar", `Compartilhar a pasta “${item.name}” (mock).`)}
              onDelete={() => onDelete(item)}
            />
          )}
          ListEmptyComponent={
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, alignItems: "center" }]}>
              <Text style={{ color: theme.colors.muted }}>Sem subpastas aqui ainda.</Text>
            </View>
          }
        />
      </View>

      {/* Botão voltar flutuante */}
      {pathIds.length > 1 && (
        <TouchableOpacity
          onPress={() => goTo(pathIds.length - 2)}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16 + insets.bottom + 60,
            backgroundColor: theme.colors.surface,
            borderRadius: 24, width: 48, height: 48,
            alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: theme.colors.border,
            shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
          }}
          accessibilityLabel="Voltar uma pasta"
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      )}

      <CreateFolderSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onCreate={onCreate} />
      <RenameFolderSheet visible={renameOpen} onClose={() => setRenameOpen(false)} onConfirm={onRename} initialName={current.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 12 },
  headerChip: { alignSelf: "center", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 18, borderWidth: 1 },
  progressTrack: { height: 8, backgroundColor: "#E5E7EB", borderRadius: 6, overflow: "hidden" },
  progressBar: { width: "10%", height: 8 },
  cta: { alignSelf: "flex-start", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  ctaText: { color: "#fff", fontWeight: "700" },
  smallBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
});
