import React from "react"
import { Avatar, Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { getMe } from "../../services/api";

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [me, setMe] = React.useState<{name?:string; email?:string; picture?:string}>({});

  React.useEffect(() => {
    getMe().then(setMe).catch(() => {});
  }, []);

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}>
      {!mdUp && (
        <IconButton aria-label="menu" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
      )}
      <Avatar src={me.picture}>{(me.name || me.email || "Usuário").charAt(0).toUpperCase()}</Avatar>
      <Typography variant="subtitle1" noWrap>
        {me.name || me.email || "Bem-vindo(a)"}
      </Typography>
    </Box>
  );
}
