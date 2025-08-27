import React, { useState } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  placeholder?: string;
  secure?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "email-address";
};

export default function Input({ label, placeholder, secure, value, onChangeText, keyboardType }: Props) {
  const [hide, setHide] = useState(!!secure);

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ marginBottom: 6, color: "#333" }}>{label}</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={hide}
          style={{
            borderWidth: 1, borderColor: "#cfcfcf", borderRadius: 6,
            paddingVertical: 10, paddingHorizontal: 12, paddingRight: secure ? 42 : 12,
            backgroundColor: "#fff"
          }}
        />
        {secure && (
          <TouchableOpacity
            onPress={() => setHide((p) => !p)}
            style={{ position: "absolute", right: 10, top: 10 }}
          >
            <Ionicons name={hide ? "eye-off-outline" : "eye-outline"} size={22} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
