import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Layout.css";
import { clearAuth } from "../../auth";
import { useTheme } from "../../theme/ThemeContext";

export default function Sidebar() {
  const nav = useNavigate();
  const { theme, toggle } = useTheme();

  function logout() {
    clearAuth();
    nav("/login");
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span role="img" aria-label="logo">💬</span> TraduDoc
      </div>
      <nav className="nav">
        <NavLink to="/translator" className={({isActive}) => isActive ? "active" : undefined}>Tradutor</NavLink>
        <NavLink to="/history" className={({isActive}) => isActive ? "active" : undefined}>Histórico</NavLink>
        <NavLink to="/settings" className={({isActive}) => isActive ? "active" : undefined}>Configurações</NavLink>
        <button onClick={logout} style={{color:"#b91c1c", borderColor:"#b91c1c"}}>Sair</button>
      </nav>
    </aside>
  );
}
