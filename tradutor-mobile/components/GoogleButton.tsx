import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GoogleButton({ title = "LOGIN COM GOOGLE", onPress }: { title?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ borderWidth: 1, borderColor: "#111", borderRadius: 8, paddingVertical: 12, alignItems: "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", columnGap: 8 }}>
        <Ionicons name="logo-google" size={18} color="#111" />
        <Text style={{ fontWeight: "600" }}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
