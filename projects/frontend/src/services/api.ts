// Substitua pelas suas rotas reais depois.
export type HistoryItem = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "pptx";
  sizeKB: number;
  createdAt: string; // ISO
};

export async function uploadAndTranslate(file: File, targetLang: string): Promise<Blob> {
  // POST para /translate … aqui retorna um blob simulado.
  return new Blob([await file.arrayBuffer()], { type: file.type });
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  // GET /records
  return [
    { id: "1", name: "teste_teste.pdf", type: "pdf", sizeKB: 512, createdAt: new Date().toISOString() },
    { id: "2", name: "curriculo.docx", type: "docx", sizeKB: 132, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
}

export async function deleteRecords(ids: string[]) {
  console.log("delete", ids);
}

export async function fetchFolders() {
  return {
    usedGB: 0.5, quotaGB: 5,
    folders: [
      { id: "f1", name: "Pasta 1", owner: "User 1", updatedAt: "2025-08-22" },
      { id: "f2", name: "Pasta 2", owner: "User 1", updatedAt: "2025-08-22" },
    ],
    byId: {
      f1: [{ id: "sf1", name: "teste_pdf", updatedAt: "2025-08-22" }, { id: "sf2", name: "teste_pdf(1)", updatedAt: "2025-08-26" }],
    }
  };
}
