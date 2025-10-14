import React from "react";
import {
  Card, CardHeader, CardContent, Stack, Box, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, Button, Chip, Typography,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination,
  IconButton, Tooltip, Divider, CircularProgress, Alert, Snackbar
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import { getHistory, type HistoryItem, type HistoryFilters } from "../services/api";
import { saveAs } from "file-saver";

function bytesToHuman(n?: number) {
  const num = Number(n || 0);
  if (!num) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  return `${(num / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
}

function iconForType(item: HistoryItem) {
  const fileType = String(item?._raw?.file_type || "").toLowerCase();
  const m = (item.mime || "").toLowerCase();
  if (fileType.includes("pdf") || m.includes("pdf")) return <PictureAsPdfIcon fontSize="small" />;
  if (fileType.includes("docx") || m.includes("word") || m.includes("docx")) return <DescriptionIcon fontSize="small" />;
  if (fileType.includes("pptx") || m.includes("powerpoint") || m.includes("pptx")) return <SlideshowIcon fontSize="small" />;
  return <DescriptionIcon fontSize="small" />;
}

// ---- helpers de disponibilidade do arquivo ----
async function isDownloadReady(url: string): Promise<boolean> {
  // 1) tenta HEAD (melhor caso)
  try {
    const r = await fetch(url, {
      method: "HEAD",
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` },
    });
    if (r.ok) return true;
    // alguns backends não implementam HEAD -> cai no GET light
  } catch {}
  // 2) fallback GET mínimo (range 0-0) para não baixar tudo
  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        Range: "bytes=0-0",
      },
    });
    // 206 (partial) ou 200 indicam que já existe conteúdo para baixar
    if (r.status === 200 || r.status === 206) return true;
  } catch {}
  return false;
}

function canPreview(item: HistoryItem) {
  const fileType = String(item?._raw?.file_type || "").toLowerCase();
  const m = (item.mime || "").toLowerCase();
  return fileType.includes("pdf") || m.includes("pdf");
}

export default function HistoryPage() {
  // filtros
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<HistoryFilters["type"]>("all");
  const [size, setSize] = React.useState<HistoryFilters["size"]>("all");
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");

  // dados
  const [items, setItems] = React.useState<HistoryItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // paginação
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // feedback
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity?: "info" | "success" | "warning" | "error" }>({ open: false, msg: "" });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  // debounce da busca
  const [qDebounced, setQDebounced] = React.useState(q);
  React.useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items, total } = await getHistory({
        q: qDebounced || undefined,
        type, size,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setItems(items);
      setTotal(total);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Falha ao carregar histórico.");
    } finally {
      setLoading(false);
    }
  }, [qDebounced, type, size, dateFrom, dateTo, page, rowsPerPage]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const resetFilters = () => {
    setQ("");
    setType("all");
    setSize("all");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  };

  // ---- ações ----
  const handlePreview = async (it: HistoryItem) => {
    const url = it.previewUrl || it.downloadUrl;
    if (!url) return;
    const ready = await isDownloadReady(url);
    if (!ready) {
      setSnack({ open: true, msg: "O arquivo ainda está em processamento. Tente novamente em alguns segundos.", severity: "info" });
      return;
    }
    // só faz sentido "visualizar" PDF — os demais vão baixar de qualquer jeito
    if (!canPreview(it)) {
      setSnack({ open: true, msg: "Este tipo de arquivo não possui visualização. O download será iniciado.", severity: "info" });
    }
    window.open(url, "_blank");
  };

  const handleDownload = async (it: HistoryItem) => {
    const url = it.downloadUrl;
    if (!url) return;
    const ready = await isDownloadReady(url);
    if (!ready) {
      setSnack({ open: true, msg: "O arquivo ainda está em processamento. Tente novamente em alguns segundos.", severity: "info" });
      return;
    }
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` }
      });
      // se o back devolver attachment, isso baixa corretamente
      const blob = await res.blob();
      saveAs(blob, it.name);
    } catch {
      // fallback: abrir a URL
      window.open(url, "_blank");
    }
  };

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      <Card>
        <CardHeader title="Histórico de traduções" />
        <CardContent>
          {/* Filtros */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
            <TextField
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Pesquisar por nome..."
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={type}
                label="Tipo"
                onChange={(e) => { setType(e.target.value as any); setPage(0); }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="docx">DOCX</MenuItem>
                <MenuItem value="pptx">PPTX</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Tamanho</InputLabel>
              <Select
                value={size}
                label="Tamanho"
                onChange={(e) => { setSize(e.target.value as any); setPage(0); }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="small">Pequenos (&lt; 1MB)</MenuItem>
                <MenuItem value="medium">Médios (1–10MB)</MenuItem>
                <MenuItem value="large">Grandes (&gt; 10MB)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="De"
              InputLabelProps={{ shrink: true }}
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              type="date"
              label="Até"
              InputLabelProps={{ shrink: true }}
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
              sx={{ minWidth: 160 }}
            />

            <Tooltip title="Limpar filtros">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<FilterAltOffIcon />}
                  onClick={resetFilters}
                >
                  Limpar
                </Button>
              </span>
            </Tooltip>
          </Stack>

          {/* Chips-resumo */}
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            {type !== "all" && <Chip label={`Tipo: ${type.toUpperCase()}`} onDelete={() => setType("all")} />}
            {size !== "all" && <Chip label={`Tamanho: ${size}`} onDelete={() => setSize("all")} />}
            {(dateFrom || dateTo) && (
              <Chip
                label={`Data: ${dateFrom || "…"} → ${dateTo || "…"}`}
                onDelete={() => { setDateFrom(""); setDateTo(""); }}
              />
            )}
            {qDebounced && <Chip label={`Busca: "${qDebounced}"`} onDelete={() => setQ("")} />}
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Tabela */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Documento</TableCell>
                  <TableCell sx={{ width: 120 }}>Tipo</TableCell>
                  <TableCell sx={{ width: 120 }}>Tamanho</TableCell>
                  <TableCell sx={{ width: 160 }}>Idioma</TableCell>
                  <TableCell sx={{ width: 180 }}>Data</TableCell>
                  <TableCell sx={{ width: 140 }} align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={22} sx={{ mr: 1 }} /> Carregando…
                    </TableCell>
                  </TableRow>
                )}

                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Nenhum documento encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && items.map((it) => {
                  const typeLabel =
                    (it._raw?.file_type as string) ||
                    (it.mime ? it.mime.split("/").pop() || "-" : "-");
                  const langFrom = String(it?._raw?.detected_lang || "").toUpperCase() || "?";
                  const langTo = String(it?.lang || "").toUpperCase() || "-";
                  // se o backend já mandar status, podemos usar:
                  const isProcessing = String(it?.status || it?._raw?.status || "").toLowerCase() === "processing";

                  return (
                    <TableRow key={it.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {iconForType(it)}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" noWrap title={it.name}>{it.name}</Typography>
                            {isProcessing && (
                              <Typography variant="caption" color="text.secondary">processando…</Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>{String(typeLabel).toUpperCase()}</TableCell>
                      <TableCell>{bytesToHuman(it.size)}</TableCell>
                      <TableCell>{`${langFrom} → ${langTo}`}</TableCell>
                      <TableCell>{new Date(it.createdAt).toLocaleString()}</TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={canPreview(it) ? "Visualizar" : "Abrir/baixar"}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={(!it.previewUrl && !it.downloadUrl) || isProcessing}
                                onClick={() => handlePreview(it)}
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Baixar">
                            <span>
                              <IconButton
                                size="small"
                                disabled={!it.downloadUrl || isProcessing}
                                onClick={() => handleDownload(it)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Linhas por página"
          />
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnack} severity={snack.severity || "info"} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
