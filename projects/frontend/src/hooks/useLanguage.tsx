import React from "react";

type Lang = "pt-BR" | "en-US" | "es-ES" | "de-DE";
type Ctx = { lang: Lang; setLang: (v: Lang) => void; options: { v: Lang; label: string }[] };

export const LanguageContext = React.createContext<Ctx>({
  lang: "pt-BR",
  setLang: () => {},
  options: [],
});

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(
    (localStorage.getItem("site_lang") as Lang) || "pt-BR"
  );
  const setLang = (v: Lang) => {
    setLangState(v);
    localStorage.setItem("site_lang", v);
  };
  const options = React.useMemo(
    () => [
      { v: "pt-BR", label: "Português (Brasil)" },
      { v: "en-US", label: "English (US)" },
      { v: "es-ES", label: "Español" },
      { v: "de-DE", label: "Deutsch" },
    ],
    []
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, options }}>
      {children}
    </LanguageContext.Provider>
  );
}
