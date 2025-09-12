export const LANGUAGES = [
  { code: "pt", label: "Português" },
  { code: "en", label: "Inglês" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
