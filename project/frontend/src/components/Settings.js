import React, { useEffect, useState } from "react";
import "./Layout/Layout.css";
import { authFetch } from "../api/client";
import { useTheme } from "../theme/ThemeContext";

export default function Settings() {
  const [me, setMe] = useState(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const { theme, toggle } = useTheme();

  useEffect(() => {
    (async () => {
      const res = await authFetch("/users/me");
      if (res.ok) {
        const j = await res.json();
        setMe(j);
        setFullName(j.full_name || "");
      }
    })();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setSaving(true);
    const res = await authFetch("/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName })
    });
    setSaving(false);
    if (res.ok) setMsg("Perfil atualizado!");
    else setErr((await res.json().catch(()=>({}))).detail || "Falha ao salvar");
  }

  async function changePwd(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    const current = e.target.current_password.value;
    const nw = e.target.new_password.value;
    const res = await authFetch("/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: current, new_password: nw })
    });
    if (res.ok) setMsg("Senha alterada!");
    else setErr((await res.json().catch(()=>({}))).detail || "Falha ao alterar senha");
    e.target.reset();
  }

  return (
    <div className="content">
      <div className="card" style={{marginBottom: 16}}>
        <h3 style={{marginTop:0}}>Preferências</h3>
        <div className="row">
          <span>Tema atual: <strong>{theme === "dark" ? "Escuro" : "Claro"}</strong></span>
          <button onClick={toggle} style={{padding:"8px 12px", borderRadius:8, border:"1px solid var(--border)", cursor:"pointer"}}>
            Alternar tema
          </button>
        </div>
      </div>

      <div className="card" style={{marginBottom: 16}}>
        <h3 style={{marginTop:0}}>Perfil</h3>
        <form onSubmit={saveProfile} className="row" style={{gap:8}}>
          <input
            type="text"
            value={fullName}
            onChange={e=>setFullName(e.target.value)}
            placeholder="Seu nome"
            style={{padding:"10px 12px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text)"}}
          />
          <button disabled={saving} style={{padding:"10px 12px", borderRadius:8, border:"1px solid var(--border)", cursor:"pointer"}}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{marginTop:0}}>Segurança</h3>
        <form onSubmit={changePwd} className="row" style={{gap:8}}>
          <input name="current_password" type="password" placeholder="Senha atual" required
            style={{padding:"10px 12px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text)"}} />
          <input name="new_password" type="password" placeholder="Nova senha" required
            style={{padding:"10px 12px", border:"1px solid var(--border)", borderRadius:8, background:"transparent", color:"var(--text)"}} />
          <button style={{padding:"10px 12px", borderRadius:8, border:"1px solid var(--border)", cursor:"pointer"}}>Alterar senha</button>
        </form>
      </div>

      {(msg || err) && (
        <div className="card" style={{marginTop:16, color: err ? "#b91c1c" : "inherit"}}>
          {msg || err}
        </div>
      )}
    </div>
  );
}
