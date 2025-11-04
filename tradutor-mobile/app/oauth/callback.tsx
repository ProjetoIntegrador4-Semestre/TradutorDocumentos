// app/oauth/callback.tsx
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { saveAuth } from "../../lib/storage";

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams() as { token?: string; error?: string };

  useEffect(() => {
    (async () => {
      const token = params.token;
      if (!token) {
        alert(params.error ? `Erro no login: ${params.error}` : "Token ausente no callback.");
        router.replace("/(auth)/login");
        return;
      }

      // Monte um usuário mínimo — backend já codificou name/email no JWT se quiser ler depois
      const user = { email: "google@user", name: "Google User" };

      await saveAuth(token, user, null);
      router.replace("/"); // enviar para home/tabs
    })();
  }, [params, router]);

  return null;
}
