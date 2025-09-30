// components/GoogleButton.tsx
import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";

export default function GoogleButton({
  onPress,
  title = "LOGIN COM GOOGLE",
}: {
  onPress?: () => void;
  title?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <Image
        source={{ uri: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" }}
        style={{ width: 18, height: 18 }}
      />
      <Text style={{ fontWeight: "700", color: "#333" }}>{title}</Text>
    </TouchableOpacity>
  );
}
