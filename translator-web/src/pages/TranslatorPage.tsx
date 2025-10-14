// src/pages/TranslatorPage.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { getLanguages, uploadAndTranslate, downloadFile } from "../services/api";

type Lang = { code: string; name: string };

export default function TranslatorPage() {
  const { isAuthenticated } = useAuth();

  const [langs, setLangs] = React.useState<Lang[]>([]);
  const [langsLoading, setLangsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [targetLang, setTargetLang] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  // Carrega idiomas SOMENTE quando autenticado
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      setLangsLoading(true);
      try {
        if (!isAuthenticated) {
          setLangs([]);
          setTargetLang("");
          return;
        }
        const data = await getLanguages();
        if (!mounted) return;
        setLangs(data);
        const def =
          data.find((d) => d.code === "pt")?.code ||
          data.find((d) => d.code === "en")?.code ||
          data[0]?.code ||
          "";
        setTargetLang(def);
      } catch (e: any) {
        if (!mounted) return;
        setError("Não foi possível carregar os idiomas.");
      } finally {
        if (mounted) setLangsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  async function handleTranslate() {
    if (!file) {
      setError("Selecione um arquivo.");
      return;
    }
    if (!targetLang) {
      setError("Selecione o idioma de destino.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { blob, filename } = await uploadAndTranslate(file, { targetLang });
      // Faz download do Blob gerado
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename || `translated_${file.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setError("Falha ao traduzir o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1>Traduzir Documento</h1>

      {!isAuthenticated && (
        <div style={{ margin: "12px 0", padding: 12, border: "1px solid #eee" }}>
          <strong>Faça login</strong> para carregar a lista de idiomas e enviar arquivos.
        </div>
      )}

      {error && (
        <div style={{ margin: "12px 0", padding: 12, background: "#ffecec", border: "1px solid #ffb3b3" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gap: 12, opacity: langsLoading ? 0.6 : 1 }}>
        <label>
          Idioma de destino
          <select
            disabled={!isAuthenticated || langsLoading || langs.length === 0}
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{ display: "block", marginTop: 6, padding: 8, width: "100%" }}
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          Arquivo
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: "block", marginTop: 6 }}
          />
        </label>

        <button
          onClick={handleTranslate}
          disabled={!isAuthenticated || uploading || !file || !targetLang}
          style={{
            padding: "10px 14px",
            border: 0,
            borderRadius: 8,
            background: "#3b82f6",
            color: "#fff",
            fontWeight: 600,
            cursor: (!isAuthenticated || uploading || !file || !targetLang) ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Traduzindo..." : "Traduzir"}
        </button>
      </div>
    </div>
  );
}
