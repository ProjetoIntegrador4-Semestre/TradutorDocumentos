import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import CreateFolderSheet from "../../components/CreateFolderSheet";
import FolderCard from "../../components/FolderCard";
import { theme } from "../../constants/theme";

type Folder = { id: string; name: string; owner: string; created_at: string };

export default function Folders() {
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "Pasta 1", owner: "User", created_at: "2025-08-22" },
    { id: "2", name: "Pasta 2", owner: "User", created_at: "2025-04-02" },
    { id: "3", name: "Pasta 3", owner: "User", created_at: "2024-12-04" },
    { id: "4", name: "Pasta 4", owner: "User", created_at: "2025-08-21" },
  ]);
  const [sheetOpen, setSheetOpen] = useState(false);

  function onCreate(name: string) {
    if (!name.trim()) return;
    setFolders(p => [
      { id: String(Date.now()), name, owner: "User", created_at: new Date().toISOString() },
      ...p,
    ]);
    setSheetOpen(false);
  }

  function onShare(folder: Folder) {
    Alert.alert("Compartilhar", `Compartilhar a pasta “${folder.name}” (mock).`);
  }

  function onDelete(id: string) {
    setFolders(p => p.filter(f => f.id !== id));
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopGreeting />

      <View style={{ padding: theme.spacing, rowGap: 12 }}>
        <View style={styles.headerChip}>
          <Text style={{ color: theme.colors.text, fontWeight: "700" }}>Pastas</Text>
        </View>

        {/* Armazenamento */}
        <View style={styles.card}>
          <Text style={{ color: theme.colors.primary, marginBottom: 6, fontWeight: "600" }}>Armazenamento Disponível</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressBar} />
          </View>
          <Text style={{ color: theme.colors.muted, marginTop: 4 }}>0,5 GB de 5 GB usados</Text>
        </View>

        {/* Criar nova pasta */}
        <View style={styles.card}>
          <Text style={{ fontWeight: "700", color: theme.colors.text, marginBottom: 8 }}>Criar nova pasta</Text>
          <TouchableOpacity onPress={() => setSheetOpen(true)} style={styles.cta}>
            <Text style={styles.ctaText}>+ Nova pasta</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={folders}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingTop: 6, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <FolderCard
              folder={item}
              onShare={() => onShare(item)}
              onDelete={() => onDelete(item.id)}
            />
          )}
        />
      </View>

      <CreateFolderSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onCreate={onCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  headerChip: {
    alignSelf: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    width: "10%",
    height: 8,
    backgroundColor: theme.colors.primary,
  },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  ctaText: {
    color: theme.colors.primaryText,
    fontWeight: "700",
  },
});
