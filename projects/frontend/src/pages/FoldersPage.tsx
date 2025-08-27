import {
  Box, Card, CardHeader, CardContent, LinearProgress, Typography, Button,
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Table, TableBody, TableRow, TableCell
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShareIcon from "@mui/icons-material/Share";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React from "react";
import { fetchFolders } from "../services/api";

type Entry = { id: string; name: string; updatedAt: string };

export default function FoldersPage() {
  const [root, setRoot] = React.useState<{ id: string; name: string } | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuFolder, setMenuFolder] = React.useState<Entry | null>(null);

  const [state, setState] = React.useState<any>(null);

  React.useEffect(() => { fetchFolders().then(setState); }, []);
  const percent = state ? (state.usedGB / state.quotaGB) * 100 : 0;

  const openMenu = Boolean(anchorEl);

  const rows: Entry[] = root
    ? state?.byId[root.id] || []
    : (state?.folders || []).map((f: any) => ({ id: f.id, name: f.name, updatedAt: f.updatedAt }));

  return (
    <Card>
      <CardHeader title="Pastas" />
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FolderIcon />
            <Typography variant="h6">{root ? root.name : "Pastas"}</Typography>
            {root && (
              <Button startIcon={<ArrowBackIcon />} onClick={() => setRoot(null)} size="small">
                Voltar
              </Button>
            )}
          </Box>
          <Box sx={{ minWidth: 260 }}>
            <Typography variant="caption">
              Armazenamento Disponível — {state?.usedGB ?? 0} GB de {state?.quotaGB ?? 0} GB usados
            </Typography>
            <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 6, mt: 0.5 }} />
          </Box>
          <Button variant="contained">Criar Nova Pasta</Button>
        </Box>

        <Table>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell width={56}><FolderIcon /></TableCell>
                <TableCell onClick={() => !root && setRoot({ id: row.id, name: row.name })} sx={{ cursor: !root ? "pointer" : "default" }}>
                  {row.name}
                </TableCell>
                <TableCell>Usuário 1</TableCell>
                <TableCell>{row.updatedAt}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={(e) => { setAnchorEl(e.currentTarget); setMenuFolder(row); }}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
          <MenuItem>
            <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={`Criador: User 1`} />
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); alert("Compartilhar " + menuFolder?.name); }}>
            <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Compartilhar" />
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); alert("Excluir " + menuFolder?.name); }}>
            <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Excluir Pasta" />
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}
