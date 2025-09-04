
import React, { createContext, useContext, useState } from "react";

type User = { name: string; email: string } | null;
type Ctx = { user: User; signIn: (u: User) => void; signOut: () => void };

const Ctx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({ name: "Usuário(a)", email: "teste@email.com" });
  const signIn = (u: User) => setUser(u);
  const signOut = () => setUser(null);
  return <Ctx.Provider value={{ user, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
