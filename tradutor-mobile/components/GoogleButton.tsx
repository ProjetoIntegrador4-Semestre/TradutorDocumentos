// components/GoogleButton.tsx
import React from "react";
import {
  Platform,
  TouchableOpacity,
  Text,
  Linking,
  View,
  Image,
} from "react-native";
import { BASE_URL } from "../lib/api";

type Props = {
  title?: string;
};

export default function GoogleButton({
  title = "Entrar com Google",
}: Props) {
  const onPress = () => {
    const authUrl = `${BASE_URL}/oauth2/authorization/google`;

    if (Platform.OS === "web") {
      // abre o fluxo de login NA MESMA ABA
      window.location.href = authUrl;
    } else {
      // mobile: abre no navegador
      Linking.openURL(authUrl);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#dadce0",
        backgroundColor: "#ffffff",
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignSelf: "stretch",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={{
            uri: "https://img.icons8.com/color/48/google-logo.png",
          }}
          style={{ width: 18, height: 18, marginRight: 8 }}
        />
        <Text
          style={{
            color: "#3c4043",
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
