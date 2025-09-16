import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

const resources = {
  pt: {
    translation: {
      welcome: "Bem vindo Usuário(a)",
      common: {
        share: "Compartilhar",
        delete: "Excluir",
        cancel: "Cancelar",
        save: "Salvar",
      },
      settings: {
        name: "Nome",
        email: "Email",
        language: "Idioma",
        theme: "Tema",
        light: "Claro",
        dark: "Escuro",
        logout: "Sair",
      },
      translator: {
        chooseLang: "Escolha para qual idioma deseja traduzir:",
        selectFolder: "Selecione em qual pasta deseja salvar:",
        selectFile: "Clique aqui para selecionar o arquivo que deseja traduzir",
        moreLangs: "+200 idiomas",
        translate: "TRADUZIR",
      },
      folders: {
        title: "Pastas",
        storage: "Armazenamento Disponível",
        newFolder: "Criar nova pasta",
        createIn: "Criar nova pasta em “{{name}}”",
        rename: "Renomear",
        empty: "Sem subpastas aqui ainda.",
      },
      history: {
        title: "Histórico de Requisição",
        filters: "Filtros",
        newest: "Mais recentes",
        oldest: "Mais antigos",
        keyword: "Palavra chave",
        delete: "Excluir",
      },
    },
  },
  en: {
    translation: {
      welcome: "Welcome User",
      common: {
        share: "Share",
        delete: "Delete",
        cancel: "Cancel",
        save: "Save",
      },
      settings: {
        name: "Name",
        email: "Email",
        language: "Language",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        logout: "Sign out",
      },
      translator: {
        chooseLang: "Choose the language to translate to:",
        selectFolder: "Select the folder to save:",
        selectFile: "Tap here to select the file you want to translate",
        moreLangs: "+200 languages",
        translate: "TRANSLATE",
      },
      folders: {
        title: "Folders",
        storage: "Available Storage",
        newFolder: "Create new folder",
        createIn: "Create new folder in “{{name}}”",
        rename: "Rename",
        empty: "No subfolders here yet.",
      },
      history: {
        title: "Request History",
        filters: "Filters",
        newest: "Most recent",
        oldest: "Oldest",
        keyword: "Keyword",
        delete: "Delete",
      },
    },
  },
};

// pega idioma d o aparelho (expo-localization novo)
function getDeviceLang(): string {
  try {
    const locales = (Localization as any).getLocales?.() ?? [];
    const first = locales[0];
    const code: string =
      first?.languageCode ??
      first?.languageTag?.split?.("-")?.[0] ??
      "pt";
    return ["pt", "en"].includes(code) ? code : "pt";
  } catch {
    return "pt";
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLang(),
  fallbackLng: "pt",
  ns: ["translation"],
  defaultNS: "translation",
  interpolation: { escapeValue: false },
});

export default i18n;
