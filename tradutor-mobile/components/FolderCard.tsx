import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function FolderCard({
  folder, onShare, onDelete
}: { folder: { id: string; name: string; owner: string; created_at: string }; onShare: () => void; onDelete: () => void }) {
  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8,
      flexDirection: "row", justifyContent: "space-between", alignItems: "center"
    }}>
      <View>
        <Text style={{ fontWeight: "600" }}>📁 {folder.name}</Text>
        <Text style={{ color: "#666" }}>
          User: {folder.owner} • {new Date(folder.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={{ flexDirection: "row", columnGap: 12 }}>
        <TouchableOpacity onPress={onShare} style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "#eee" }}>
          <Text>Compartilhar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "#d82626" }}>
          <Text style={{ color: "#fff" }}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
