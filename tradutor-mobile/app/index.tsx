import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";  // Certifique-se de importar o ThemeProvider corretamente

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // ou spinner opcional
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <ThemeProvider>  {/* Envolva a aplicação com o ThemeProvider */}
      <Redirect href="/translator" />
    </ThemeProvider>
  );
}
