// app/(auth)/oauth-google.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useAuth } from "../../context/AuthContext";

export default function OAuthGoogle() {
  const router = useRouter();
  const { completeSocialLogin } = useAuth();

  useEffect(() => {
    (async () => {
      const href = typeof window !== "undefined" ? window.location.href : "";
      const parsed = Linking.parse(href);
      const qp = parsed.queryParams || {};

      let token = (qp?.access_token || qp?.token) as string | undefined;
      let email = (qp?.email as string | undefined) ?? null;

      if (!token && typeof window !== "undefined") {
        try {
          const url = new URL(href);
          const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
          token = token || (hash.get("access_token") ?? hash.get("token") ?? undefined);
          email = email || hash.get("email");
        } catch {}
      }

      if (token) {
        await completeSocialLogin(token, email);
        router.replace("/(tabs)/translator");
      } else {
        router.replace("/(auth)/login");
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 8 }}>Conectando...</Text>
    </View>
  );
}
