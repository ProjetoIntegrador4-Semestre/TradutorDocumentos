// context/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { THEMES, Theme, ThemeName } from "../constants/theme"; // Certifique-se de que o caminho está correto

// Tipo do contexto de tema
type ThemeContextType = {
  theme: Theme;
  setTheme: (themeName: ThemeName) => void;
  mode: "light" | "dark"; // Mode que define se é claro ou escuro
  setMode: (mode: "light" | "dark") => void; // Função para alterar o mode
};

// Criando o contexto de tema
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provedor de contexto para envolver os componentes da aplicação
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"light" | "dark">("dark"); // Inicia com dark mode
  const [theme, setTheme] = useState<Theme>(THEMES[mode]); // Define o tema baseado no modo

  // Função para atualizar o tema quando o modo é alterado
  const changeTheme = (newMode: "light" | "dark") => {
    setMode(newMode);
    setTheme(THEMES[newMode]); // Atualiza o tema com base no novo mode
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, mode, setMode: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook customizado para acessar o contexto do tema em qualquer componente
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
