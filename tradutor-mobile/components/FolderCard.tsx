import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

type F = { id: string; name: string; owner: string; created_at: string; children?: F[] };

export default function FolderCard({
  folder,
  onOpen,
  onShare,
  onDelete,
}: {
  folder: F;
  onOpen?: () => void;
  onShare: () => void;
  onDelete: () => void;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const date = new Date(folder.created_at).toLocaleDateString();
  const count = folder.children?.length ?? 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <TouchableOpacity style={styles.info} onPress={onOpen} activeOpacity={0.7}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>📁 {folder.name}</Text>
        <Text style={[styles.meta, { color: theme.colors.muted }]}>
          User: {folder.owner} • {date}{count ? ` • ${count} item${count > 1 ? "s" : ""}` : ""}
        </Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onShare}
          style={[styles.btn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, marginRight: 8 }]}
        >
          <Text style={[styles.btnGhostText, { color: theme.colors.text }]}>{t("common.share")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={[styles.btn, { backgroundColor: "#EF4444", borderColor: "#EF4444" }]}>
          <Text style={styles.btnDangerText}>{t("common.delete")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  info: { flex: 1, minWidth: 0, paddingRight: 8 },
  title: { fontWeight: "700", marginBottom: 4, fontSize: 14 },
  meta: { fontSize: 12 },
  actions: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  btn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, minHeight: 32 },
  btnGhostText: { fontWeight: "600", fontSize: 12 },
  btnDangerText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
