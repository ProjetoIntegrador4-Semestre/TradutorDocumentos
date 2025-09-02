import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, Pressable } from "react-native";
import { theme } from "../constants/theme";

export default function RenameFolderSheet({
  visible, initialName, onClose, onConfirm
}: {
  visible: boolean;
  initialName: string;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}) {
  const [name, setName] = useState(initialName);
  useEffect(() => { setName(initialName); }, [initialName]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex:1, backgroundColor:"rgba(0,0,0,0.3)" }} onPress={onClose}>
        <View style={{ marginTop:"auto", backgroundColor:"#fff", borderTopLeftRadius:16, borderTopRightRadius:16, padding:16, gap:10 }}>
          <View style={{ width:36, height:4, alignSelf:"center", borderRadius:2, backgroundColor:"#ddd", marginBottom:4 }} />
          <Text style={{ fontWeight:"700", fontSize:16, color:theme.colors.text }}>Renomear pasta</Text>
          <TextInput
            placeholder="Novo nome"
            value={name}
            onChangeText={setName}
            style={{ borderWidth:1, borderColor:theme.colors.border, borderRadius:8, padding:10, backgroundColor:"#fff" }}
          />
          <View style={{ flexDirection:"row", justifyContent:"flex-end", gap:10 }}>
            <TouchableOpacity onPress={onClose}><Text>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity
              onPress={() => { onConfirm(name.trim()); }}
              style={{ backgroundColor:theme.colors.primary, borderRadius:8, paddingVertical:10, paddingHorizontal:14 }}
            >
              <Text style={{ color:"#fff", fontWeight:"700" }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
