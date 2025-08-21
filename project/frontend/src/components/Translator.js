import React, { useState, useRef } from "react";
import "./Layout/Layout.css";
import { uploadAndTranslate } from "../api/files";

const LANGS = [
  { value: "en", label: "Inglês" },
  { value: "es", label: "Espanhol" },
  { value: "fr", label: "Francês" },
  { value: "de", label: "Alemão" },
  { value: "pt", label: "Português" },
];

export default function Translator() {
  const [target, setTarget] = useState("en");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function pickFile() {
    inputRef.current?.click();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!file) { setError("Selecione um arquivo"); return; }
    setStatus("Traduzindo arquivo...");
    try {
      const { blob, filename } = await uploadAndTranslate(file, target);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("Tradução concluída! Download iniciado.");
    } catch (err) {
      setError(err.message || "Falha ao traduzir");
    } finally {
      setTimeout(() => setStatus(""), 1500);
    }
  }

  return (
    <div className="content">
      <div className="card" style={{marginBottom: 16}}>
        <div className="row">
          <div>Selecione um Idioma</div>
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <input
          type="file"
          ref={inputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div className="file-drop" onClick={pickFile}>
          {file ? <strong>{file.name}</strong> : <>
            <div style={{fontSize: 40}}>📤</div>
            <div>Clique aqui para fazer upload do arquivo.</div>
          </>}
        </div>

        <div className="row" style={{marginTop: 16}}>
          <button type="submit" style={{background: "var(--accent)", color: "var(--primary-contrast)", border: "none", padding: "10px 14px", borderRadius: 10, cursor: "pointer"}}>
            Enviar e traduzir
          </button>
          {status && <span style={{color: "var(--muted)"}}>{status}</span>}
          {error && <span style={{color: "#dc2626"}}>{error}</span>}
        </div>
      </form>
    </div>
  );
}
