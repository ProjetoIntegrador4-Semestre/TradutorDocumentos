import {
  List, ListItemButton, ListItemIcon, ListItemText, Box, Divider, Button,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import HistoryIcon from "@mui/icons-material/History";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import { ThemeModeContext } from "../../hooks/useThemeMode";
import ThemeSwitchNeumorphic from "../common/ThemeSwitchNeumorphic";

const items = [
  { to: "/tradutor", label: "Tradutor", icon: <TranslateIcon /> },
  { to: "/historico", label: "Histórico", icon: <HistoryIcon /> },
  { to: "/pastas", label: "Pastas", icon: <FolderIcon /> },
  { to: "/configuracoes", label: "Configurações", icon: <SettingsIcon /> },
];

export default function Sidebar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { mode, toggle } = React.useContext(ThemeModeContext);

  const handleLogout = () => {
    // limpe tokens se usar auth: localStorage.removeItem("token")
    nav("/login"); // sua rota de Login/Cadastro
  };

  return (
    <Box sx={{ width: 240, height: "100%", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 1 }}>
        <img src="/logo.png" alt="Logo" style={{ maxWidth: 160, height: "auto" }} />
      </Box>

      <List component="nav" sx={{ flex: 1 }}>
        {items.map(i => (
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


      <Box sx={{ display: "flex", alignItems: "center", gap: 14, mb: 2 }}>
        <span style={{ fontSize: 14 }}>{mode === "light" ? "Tema" : "Tema"}</span>
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
