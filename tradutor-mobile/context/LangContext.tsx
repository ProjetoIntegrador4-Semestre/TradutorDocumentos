import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "../i18n";
import { LANGUAGES, LanguageCode } from "../constants/languages";

type LangCtx = { lang: LanguageCode; setLang: (code: string | LanguageCode) => void };
const KEY = "@default_lang";
const Ctx = createContext<LangCtx | null>(null);

const SUPPORTED_CODES = LANGUAGES.map(l => l.code) as readonly LanguageCode[];

function isLanguageCode(x: string): x is LanguageCode {
  return (SUPPORTED_CODES as readonly string[]).includes(x);
}

function clamp(code: string | null | undefined): LanguageCode {
  const base = String(code || "pt").split("-")[0].toLowerCase();
  return isLanguageCode(base) ? base : "pt";
}

function getDeviceLang(): LanguageCode {
  try {
    const locales = (Localization as any).getLocales?.() ?? [];
    const first = locales[0];
    const fromDevice =
      first?.languageCode ??
      first?.languageTag?.split?.("-")?.[0] ??
      "pt";
    return clamp(fromDevice);
  } catch {
    return "pt";
  }
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(getDeviceLang());

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved) setLangState(clamp(saved));
      } catch {}
    })();
  }, []);


  useEffect(() => {
    i18n.changeLanguage(lang)
    AsyncStorage.setItem(KEY, lang).catch(() => {});
  }, [lang]);

  const setLang = useCallback((code: string | LanguageCode) => {
    setLangState(clamp(code));
  }, []);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used within LangProvider");
  return v;
}
