import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user } = useAuth();
  // Grupos (auth/tabs) não fazem parte da URL:
  return <Redirect href={user ? "/translator" : "/login"} />;
}
