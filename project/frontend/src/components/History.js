import React, { useEffect, useState } from "react";
import "./Layout/Layout.css";
import { fetchRecords, downloadRecord } from "../api/files";

export default function History() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await fetchRecords();
      setRows(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setErr(e.message || "Falha ao carregar histórico");
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDownload(id) {
    try {
      const { blob, filename } = await downloadRecord(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || "Falha no download");
    }
  }

  return (
    <div className="content">
      <div className="card" style={{marginBottom: 12}}>
        <h3 style={{margin: 0}}>Histórico de Requisição</h3>
      </div>

      {err && <div className="card" style={{color:"#b91c1c"}}>{err}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Tipo</th><th>Nome</th><th>Data</th><th>Hora</th><th>Download</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan="5" style={{color:"var(--muted)"}}>Sem registros ainda.</td></tr>
          )}
          {rows.map((r) => {
            const date = new Date(r.created_at || r.createdAt || r.timestamp || Date.now());
            const tipo = r.type || r.mimetype?.split("/")?.[1] || "arquivo";
            return (
              <tr key={r.id || r.uuid}>
                <td>{tipo}</td>
                <td>{r.name || r.filename || r.original_name}</td>
                <td>{date.toLocaleDateString()}</td>
                <td>{date.toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</td>
                <td>
                  <button onClick={() => handleDownload(r.id || r.uuid)} style={{cursor:"pointer"}} title="Baixar">⬇️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
