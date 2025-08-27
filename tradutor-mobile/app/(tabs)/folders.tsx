import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import CreateFolderSheet from "../../components/CreateFolderSheet";
import FolderCard from "../../components/FolderCard";

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
    <View style={{ flex: 1, backgroundColor: "#e9e9ea" }}>
      <TopGreeting />
      <View style={{ padding: 16, rowGap: 12 }}>
        <TouchableOpacity style={{ alignSelf: "center", paddingVertical: 6, paddingHorizontal: 18, backgroundColor: "#fff", borderRadius: 12 }}>
          <Text>Pastas</Text>
        </TouchableOpacity>

        <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12 }}>
          <Text style={{ color: "#2b64ff", marginBottom: 6 }}>Armazenamento Disponível</Text>
          <View style={{ height: 8, backgroundColor: "#e5e5e5", borderRadius: 6, overflow: "hidden" }}>
            <View style={{ width: "10%", backgroundColor: "#2b64ff", height: 8 }} />
          </View>
          <Text style={{ color: "#666", marginTop: 4 }}>0,5 GB de 5 GB usados</Text>
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12, rowGap: 10 }}>
          <Text style={{ fontWeight: "600" }}>Criar nova pasta</Text>
          <TouchableOpacity
            onPress={() => setSheetOpen(true)}
            style={{ alignSelf: "flex-start", backgroundColor: "#2b64ff", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>+ Nova pasta</Text>
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
