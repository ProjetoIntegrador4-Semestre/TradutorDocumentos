import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Platform, Modal, Pressable, StyleSheet } from "react-native";
import TopGreeting from "../../components/TopGreeting";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

type Rec = { id: number; original_filename: string; file_type: string; created_at: string };
type SortBy = "recent" | "oldest";

const TYPES = [
  { label: "Selecione o tipo", value: null },
  { label: "DOCX", value: "DOCX" },
  { label: "PPTX", value: "PPTX" },
  { label: "PDF",  value: "PDF"  },
];

function TypeSelect({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  if (Platform.OS !== "web") {
    return (
      <Picker selectedValue={value} onValueChange={(v) => onChange(v)}>
        {TYPES.map(opt => <Picker.Item key={String(opt.value)} label={opt.label} value={opt.value} />)}
      </Picker>
    );
  }

  const currentLabel = TYPES.find(t => t.value === value)?.label ?? "Selecione o tipo";

  return (
    <>
      <TouchableOpacity style={[styles.selectBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} onPress={() => setOpen(true)}>
        <Text style={{ color: theme.colors.text }}>{currentLabel}</Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.muted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {TYPES.map((opt, idx) => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[styles.menuItem, idx !== TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
                onPress={() => { onChange(opt.value as any); setOpen(false); }}
              >
                <Text style={{ color: theme.colors.text }}>{opt.label}</Text>
                {opt.value === value && <Ionicons name="checkmark" size={18} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default function History() {
  const [type, setType] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [items, setItems] = useState<Rec[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const now = Date.now();
    setItems([
      { id: 1, original_filename: "Arquivo 1.docx", file_type: "DOCX", created_at: new Date(now - 1 * 864e5).toISOString() },
      { id: 2, original_filename: "Slides.pptx",     file_type: "PPTX", created_at: new Date(now - 3 * 864e5).toISOString() },
      { id: 3, original_filename: "Contrato.pdf",    file_type: "PDF",  created_at: new Date(now - 7 * 864e5).toISOString() },
    ]);
  }, []);

  const data = useMemo(() => {
    const f = items.filter(i =>
      (!type || i.file_type === type) &&
      (!q || i.original_filename.toLowerCase().includes(q.toLowerCase()))
    );
    return f.sort((a, b) => (sortBy === "recent"
      ? +new Date(b.created_at) - +new Date(a.created_at)
      : +new Date(a.created_at) - +new Date(b.created_at)));
  }, [items, type, q, sortBy]);

  function remove(id: number) { setItems(p => p.filter(x => x.id !== id)); }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopGreeting />

      <View style={{ padding: 16, rowGap: 12 }}>
        <View style={[styles.headerChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text, fontWeight: "700" }}>Histórico de Requisição</Text>
        </View>

        {/* FILTROS */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ marginBottom: 6, color: theme.colors.text, fontWeight: "600" }}>Filtros</Text>

          <TypeSelect value={type} onChange={setType} />

          <View style={{ flexDirection: "row", columnGap: 8, marginTop: 8 }}>
            <TextInput
              placeholder="Palavra chave"
              value={q}
              onChangeText={setQ}
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
            />
            <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: theme.colors.primaryText }}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* ORDENAR */}
          <View style={{ flexDirection: "row", columnGap: 8, marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => setSortBy("recent")}
              style={[styles.chip, { borderColor: sortBy === "recent" ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <Text style={{ color: sortBy === "recent" ? theme.colors.primary : theme.colors.muted, fontWeight: "600" }}>Mais recentes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortBy("oldest")}
              style={[styles.chip, { borderColor: sortBy === "oldest" ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <Text style={{ color: sortBy === "oldest" ? theme.colors.primary : theme.colors.muted, fontWeight: "600" }}>Mais antigos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA */}
        <FlatList
          data={data}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
              <View>
                <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Text style={{ color: theme.colors.muted }}>
                  {item.original_filename} • {item.file_type}
                </Text>
              </View>
              <TouchableOpacity onPress={() => remove(item.id)} style={styles.deleteBtn}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 12 },
  headerChip: { alignSelf: "center", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 18, borderWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10 },
  searchBtn: { borderRadius: 12, paddingHorizontal: 12, justifyContent: "center" },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  // select web
  selectBtn: { height: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center", padding: 16 },
  menu: { width: 260, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  deleteBtn: { backgroundColor: "#EF4444", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
});
