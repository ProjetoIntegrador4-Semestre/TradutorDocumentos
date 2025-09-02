import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

type Props = {
  folder: { id: string; name: string; owner: string; created_at: string; children?: Props["folder"][] };
  onOpen?: () => void;
  onShare: () => void;
  onDelete: () => void;
};

export default function FolderCard({ folder, onOpen, onShare, onDelete }: Props) {
  const date = new Date(folder.created_at).toLocaleDateString();
  const count = folder.children?.length ?? 0;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.info} onPress={onOpen} activeOpacity={0.7}>
        <Text numberOfLines={1} style={styles.title}>📁 {folder.name}</Text>
        <Text style={styles.meta}>
          User: {folder.owner} • {date}{count ? ` • ${count} item${count>1?"s":""}` : ""}
        </Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onShare} style={[styles.btn, styles.btnGhost, { marginRight: 8 }]}>
          <Text style={styles.btnGhostText}>Compartilhar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={[styles.btn, styles.btnDanger]}>
          <Text style={styles.btnDangerText}>Excluir</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  info: { flex: 1, minWidth: 0, paddingRight: 8 },
  title: { color: theme.colors.text, fontWeight: "700", marginBottom: 4, fontSize: 14 },
  meta: { color: theme.colors.muted, fontSize: 12 },
  actions: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  btn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, minHeight: 32 },
  btnGhost: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
  btnGhostText: { color: theme.colors.text, fontWeight: "600", fontSize: 12 },
  btnDanger: { backgroundColor: "#EF4444", borderColor: "#EF4444" },
  btnDangerText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
