import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // ou spinner opcional
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  // Usuário normal ou admin sempre vão para translator
  return <Redirect href="/translator" />;
}
