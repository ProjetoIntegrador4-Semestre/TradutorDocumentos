import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = { name: string; email: string };

type AuthCtx = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("@user");
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  async function signIn(email: string, _password: string) {
    const mock = { name: "Usuário(a)", email };
    setUser(mock);
    await AsyncStorage.setItem("@user", JSON.stringify(mock));
  }

  async function signUp(name: string, email: string, _password: string) {
    const mock = { name, email };
    setUser(mock);
    await AsyncStorage.setItem("@user", JSON.stringify(mock));
  }

  async function signOut() {
    setUser(null);
    await AsyncStorage.removeItem("@user");
  }

  return <Ctx.Provider value={{ user, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}
