import { Avatar, Box, Typography } from "@mui/material";

export default function Topbar() {
  return (
    <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar />
      <Typography variant="subtitle1">Bem-vindo usuário(a)</Typography>
    </Box>
  );
}
