import React from "react";
import {
  List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Button,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import FolderIcon from "@mui/icons-material/Folder";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeModeContext } from "../../hooks/useThemeMode";
import ThemeSwitchNeumorphic from "../common/ThemeSwitchNeumorphic";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { mode, toggle } = React.useContext(ThemeModeContext);
  const { user, isAuthenticated } = useAuth();

  // Normaliza a role e verifica admin
  const isAdmin = React.useMemo(() => {
    const r = String(user?.role || "").toLowerCase().replace(/^role_/, "");
    return isAuthenticated && r === "admin";
  }, [user?.role, isAuthenticated]);

  // Define os itens do menu de acordo com a role
  const items = React.useMemo(
    () =>
      [
        { to: "/tradutor", label: "Tradutor", icon: <TranslateIcon /> },
        { to: "/arquivos", label: "Arquivos", icon: <FolderIcon /> },
        { to: "/historico", label: "Histórico", icon: <HistoryIcon /> },
        // Admin só aparece para quem tem role admin
        ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: <AdminPanelSettingsIcon /> }] : []),
        { to: "/configuracoes", label: "Configurações", icon: <SettingsIcon /> },
      ] as const,
    [isAdmin]
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    nav("/login");
  };

  return (
    <Box sx={{ width: "100%", height: "100%", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
        {/* Coloque um /public/logo.png se quiser mostrar a logo */}
        <img
          src="/logo.png"
          alt="Logo"
          style={{ maxWidth: 160, height: "auto" }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </Box>

      <List component="nav" sx={{ flex: 1 }}>
        {items.map((i) => (
          <ListItemButton
            key={i.to}
            selected={pathname === i.to}
            onClick={() => nav(i.to)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon>{i.icon}</ListItemIcon>
            <ListItemText primary={i.label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <span style={{ fontSize: 14 }}>Tema</span>
        <ThemeSwitchNeumorphic checked={mode === "light"} onChange={toggle} />
      </Box>

      <Divider sx={{ my: 1 }} />

      <Button
        variant="contained"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        fullWidth
        sx={{ borderRadius: 2 }}
      >
        Sair
      </Button>
    </Box>
  );
}
