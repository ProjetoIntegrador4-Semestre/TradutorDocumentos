import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, Pressable } from "react-native";

export default function CreateFolderSheet({
  visible, onClose, onCreate
}: { visible: boolean; onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");

  function handleCreate() {
    onCreate(name);
    setName("");
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} onPress={onClose}>
        <View style={{ marginTop: "auto", backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, rowGap: 10 }}>
          <View style={{ width: 36, height: 4, alignSelf: "center", borderRadius: 2, backgroundColor: "#ddd", marginBottom: 4 }} />
          <Text style={{ fontWeight: "600", fontSize: 16 }}>Criar nova pasta</Text>
          <TextInput
            placeholder="Nome da pasta"
            value={name}
            onChangeText={setName}
            style={{ borderWidth: 1, borderColor: "#dcdcdc", borderRadius: 8, padding: 10, backgroundColor: "#fff" }}
          />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", columnGap: 10 }}>
            <TouchableOpacity onPress={onClose}><Text>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: "#2b64ff", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Criar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
