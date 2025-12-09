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
        open: "Abrir",
        refresh: "Atualizar",
        confirm: "Confirmar",
        error: "Erro",
        success: "Sucesso",
        downloading: "Baixando",
        wait: "Aguarde, baixando arquivo...",
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
        title: "Tradutor de Documentos",
        targetLanguage: "Idioma de destino",
        chooseLang: "Escolha para qual idioma deseja traduzir:",
        selectFolder: "Selecione em qual pasta deseja salvar:",
        selectFile: "Selecionar arquivo(s)",
        files: "Arquivos",
        limitPerFile: "limite por arquivo",
        noFiles: "Nenhum arquivo selecionado.",
        remove: "Remover",
        pending: "Pendente",
        sendToTranslation: "Enviar para tradução",
        completed: "Traduções concluídas",
        downloadTranslation: "Baixar / Abrir tradução",
        translationCompleted: "Tradução concluída, mas o link não foi informado. Verifique o histórico.",
        failedToTranslate: "Falha ao traduzir.",
        clearList: "Limpar lista",
        attention: "Atenção",
        selectAtLeastOne: "Selecione pelo menos um arquivo.",
        completedMessage: "arquivo(s) traduzido(s), erro(s).",
        openFile: "Abrir Arquivo",
        fileDownloaded: "Arquivo Baixado",
        fileDownloadedSuccess: "Arquivo baixado com sucesso! Use o menu de compartilhamento para abrir ou salvar.",
        sharingNotAvailable: "O compartilhamento não está disponível neste dispositivo.",
      },
      folders: {
        title: "Pastas",
        storage: "Armazenamento Disponível",
        newFolder: "Criar nova pasta",
        createIn: "Criar nova pasta em '{{name}}'",
        rename: "Renomear",
        empty: "Sem subpastas aqui ainda.",
      },
      history: {
        title: "Histórico",
        filters: "Filtros",
        newest: "Mais recentes",
        oldest: "Mais antigos",
        keyword: "Palavra chave",
        filterByName: "Filtrar por nome ou idioma...",
        all: "Todos",
        type: "Tipo",
        to: "Para",
        noTranslations: "Nenhuma tradução encontrada.",
        confirmDelete: "Confirmar Exclusão",
        deleteMessage: "Deseja realmente excluir",
        deleteSuccess: "Registro excluído com sucesso!",
        deleteError: "Não foi possível excluir o registro.",
        fileNotFound: "Arquivo não encontrado no servidor (404).",
        authError: "Erro de autenticação.",
      },
      admin: {
        title: "Admin",
        addUser: "Adicionar Usuário",
        promoteToAdmin: "Promover para Admin",
        exclude: "Excluir",
      },
      tabs: {
        translator: "Tradutor",
        history: "Histórico",
        settings: "Config.",
        admin: "Admin",
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
        open: "Open",
        refresh: "Refresh",
        confirm: "Confirm",
        error: "Error",
        success: "Success",
        downloading: "Downloading",
        wait: "Please wait, downloading file...",
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
        title: "Document Translator",
        targetLanguage: "Target language",
        chooseLang: "Choose the language to translate to:",
        selectFolder: "Select the folder to save:",
        selectFile: "Select file(s)",
        files: "Files",
        limitPerFile: "limit per file",
        noFiles: "No files selected.",
        remove: "Remove",
        pending: "Pending",
        sendToTranslation: "Send for translation",
        completed: "Completed translations",
        downloadTranslation: "Download / Open translation",
        translationCompleted: "Translation completed, but the link was not provided. Check the history.",
        failedToTranslate: "Failed to translate.",
        clearList: "Clear list",
        attention: "Attention",
        selectAtLeastOne: "Select at least one file.",
        completedMessage: "file(s) translated, error(s).",
        openFile: "Open File",
        fileDownloaded: "File Downloaded",
        fileDownloadedSuccess: "File downloaded successfully! Use the share menu to open or save.",
        sharingNotAvailable: "Sharing is not available on this device.",
      },
      folders: {
        title: "Folders",
        storage: "Available Storage",
        newFolder: "Create new folder",
        createIn: "Create new folder in '{{name}}'",
        rename: "Rename",
        empty: "No subfolders here yet.",
      },
      history: {
        title: "History",
        filters: "Filters",
        newest: "Most recent",
        oldest: "Oldest",
        keyword: "Keyword",
        filterByName: "Filter by name or language...",
        all: "All",
        type: "Type",
        to: "To",
        noTranslations: "No translations found.",
        confirmDelete: "Confirm Deletion",
        deleteMessage: "Do you really want to delete",
        deleteSuccess: "Record deleted successfully!",
        deleteError: "Unable to delete record.",
        fileNotFound: "File not found on server (404).",
        authError: "Authentication error.",
      },
      admin: {
        title: "Admin",
        addUser: "Add User",
        promoteToAdmin: "Promote to Admin",
        exclude: "Exclude",
      },
      tabs: {
        translator: "Translator",
        history: "History",
        settings: "Settings",
        admin: "Admin",
      },
    },
  },
};

// pega idioma do aparelho (expo-localization novo)
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
