import {
  Box, Card, CardHeader, CardContent, Table, TableHead, TableRow, TableCell, TableBody,
  Checkbox, IconButton, Stack, TextField, MenuItem, Select, InputLabel, FormControl, Button, Chip
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import SortIcon from "@mui/icons-material/Sort";
import React from "react";
import { fetchHistory, deleteRecords, type HistoryItem } from "../services/api";
import { format } from "date-fns";

export default function HistoryPage() {
  const [rows, setRows] = React.useState<HistoryItem[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<"" | "pdf" | "docx" | "pptx">("");
  const [size, setSize] = React.useState<"" | "small" | "medium" | "large">("");
  const [sort, setSort] = React.useState<"newest" | "oldest">("newest");

  React.useEffect(() => { fetchHistory().then(setRows); }, []);

  const filtered = rows
    .filter(r => (!type || r.type === type))
    .filter(r => {
      if (!size) return true;
      if (size === "small") return r.sizeKB < 200;
      if (size === "medium") return r.sizeKB >= 200 && r.sizeKB < 1024;
      return r.sizeKB >= 1024;
    })
    .filter(r => r.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "newest"
      ? +new Date(b.createdAt) - +new Date(a.createdAt)
      : +new Date(a.createdAt) - +new Date(b.createdAt));

  const toggle = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  return (
    <Card>
      <CardHeader title="Histórico de Requisição" />
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Tipo</InputLabel>
            <Select value={type} label="Tipo" onChange={e => setType(e.target.value as any)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="docx">DOCX</MenuItem>
              <MenuItem value="pptx">PPTX</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Tamanho</InputLabel>
            <Select value={size} label="Tamanho" onChange={e => setSize(e.target.value as any)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="small">Pequenos (&lt;200 KB)</MenuItem>
              <MenuItem value="medium">Médios (200 KB–1 MB)</MenuItem>
              <MenuItem value="large">Grandes (&ge;1 MB)</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Pesquisar por palavras..." value={q} onChange={e => setQ(e.target.value)} />

          <Chip
            icon={<SortIcon />}
            label={sort === "newest" ? "Mais recentes" : "Mais antigos"}
            onClick={() => setSort(s => (s === "newest" ? "oldest" : "newest"))}
            variant="outlined"
          />

          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            disabled={!selected.length}
            onClick={async () => {
              await deleteRecords(selected);
              setRows(r => r.filter(x => !selected.includes(x.id)));
              setSelected([]);
            }}
          >
            Excluir Arquivos Selecionados
          </Button>
        </Stack>

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Tipo</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                  </TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{format(new Date(r.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>
                    <IconButton title="Baixar">
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}
