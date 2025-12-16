import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, Pressable } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

type Props = { visible: boolean; initialName: string; onClose: () => void; onConfirm: (newName: string) => void; };

export default function RenameFolderSheet({ visible, initialName, onClose, onConfirm }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  useEffect(() => setName(initialName), [initialName]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} onPress={onClose}>
        <View style={{ marginTop: "auto", backgroundColor: theme.colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 }}>
          <View style={{ width: 36, height: 4, alignSelf: "center", borderRadius: 2, backgroundColor: theme.colors.border, marginBottom: 10 }} />
          <Text style={{ fontWeight: "700", fontSize: 16, color: theme.colors.text, marginBottom: 8 }}>{t("folders.rename")}</Text>

          <TextInput
            placeholder="Novo nome"
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.colors.muted}
            style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 10, backgroundColor: theme.colors.surface, color: theme.colors.text }}
          />

          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingVertical: 10, paddingHorizontal: 12, marginRight: 8 }}>
              <Text style={{ color: theme.colors.text }}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(name.trim())} style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 }}>
              <Text style={{ color: theme.colors.primaryText, fontWeight: "700" }}>{t("common.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
