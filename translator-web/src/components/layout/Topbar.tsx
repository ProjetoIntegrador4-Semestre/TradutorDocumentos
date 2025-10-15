// src/components/Layout/Topbar.tsx
import React from "react";
import { Avatar, Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { getMe, type MeDTO } from "../../services/api";

type MeLite = {
  username?: string;
  name?: string;
  email?: string;
  picture?: string;
};

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [me, setMe] = React.useState<MeLite>({});

  React.useEffect(() => {
    let mounted = true;
    getMe()
      .then((raw: MeDTO | any) => {
        if (!mounted) return;
        setMe({
          username: raw?.username,
          name: raw?.name,
          email: raw?.email,
          picture: raw?.picture,
        });
      })
      .catch(() => {
        if (mounted) setMe({});
      });
    return () => { mounted = false; };
  }, []);

  // Se o username vier como e-mail, usa apenas a parte antes do @
  const normalizedUsername = React.useMemo(() => {
    const u = me.username?.trim();
    if (!u) return "";
    return u.includes("@") ? u.split("@")[0] : u;
  }, [me.username]);

  // Não usamos mais o e-mail como fallback para exibição
  const displayName =
    me.name?.trim() ||
    normalizedUsername ||
    "Usuário";

  const avatarLetter = (displayName || "U").charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      {!mdUp && (
        <IconButton aria-label="menu" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
      )}

      <Avatar src={me.picture} alt={displayName}>
        {avatarLetter}
      </Avatar>

      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap>
          Bem-vindo(a), <strong>{displayName}</strong>
        </Typography>
      </Box>
    </Box>
  );
}
