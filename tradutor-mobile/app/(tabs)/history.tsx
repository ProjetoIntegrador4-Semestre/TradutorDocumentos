import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import { Picker } from "@react-native-picker/picker";

type Rec = { id: number; original_filename: string; file_type: string; created_at: string };

export default function History() {
  const [type, setType] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Rec[]>([]);

  useEffect(() => {
    // Mock de dados
    setItems([
      { id: 1, original_filename: "Arquivo 1.docx", file_type: "DOCX", created_at: new Date().toISOString() },
      { id: 2, original_filename: "Slides.pptx",     file_type: "PPTX", created_at: new Date().toISOString() },
      { id: 3, original_filename: "Contrato.pdf",    file_type: "PDF",  created_at: new Date().toISOString() },
    ]);
  }, []);

  function filtered() {
    return items.filter(i =>
      (!type || i.file_type === type) &&
      (!q || i.original_filename.toLowerCase().includes(q.toLowerCase()))
    );
  }

  function remove(id: number) {
    setItems(p => p.filter(x => x.id !== id));
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#e9e9ea" }}>
      <TopGreeting />
      <View style={{ padding: 16, rowGap: 12 }}>
        <TouchableOpacity style={{ alignSelf: "center", paddingVertical: 6, paddingHorizontal: 18, backgroundColor: "#fff", borderRadius: 12 }}>
          <Text>Histórico de Requisição</Text>
        </TouchableOpacity>

        <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12 }}>
          <Text style={{ marginBottom: 6 }}>Filtros</Text>
          <Picker selectedValue={type} onValueChange={(v) => setType(v)} >
            <Picker.Item label="Selecione o tipo" value={null} />
            <Picker.Item label="DOCX" value="DOCX" />
            <Picker.Item label="PPTX" value="PPTX" />
            <Picker.Item label="PDF" value="PDF" />
          </Picker>
          <View style={{ flexDirection: "row", columnGap: 8, marginTop: 8 }}>
            <TextInput placeholder="Palavra chave" value={q} onChangeText={setQ}
              style={{ flex: 1, borderWidth: 1, borderColor: "#dcdcdc", borderRadius: 6, padding: 10, backgroundColor: "#fff" }} />
            <TouchableOpacity style={{ backgroundColor: "#2b64ff", borderRadius: 6, paddingHorizontal: 12, justifyContent: "center" }}>
              <Text style={{ color: "#fff" }}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filtered()}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text>Arquivo - {new Date(item.created_at).toLocaleDateString()}</Text>
                <Text style={{ color: "#666" }}>{item.original_filename} • {item.file_type}</Text>
              </View>
              <TouchableOpacity onPress={() => remove(item.id)} style={{ backgroundColor: "#d82626", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 }}>
                <Text style={{ color: "#fff" }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}
