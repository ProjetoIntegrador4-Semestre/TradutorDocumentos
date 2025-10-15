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
import {
  getHistory,
  type HistoryItem,
  type HistoryFilters,
  absoluteUrl,
} from "../services/api";
import { saveAs } from "file-saver";

/* ========================
   Helpers seguras e utils
   ======================== */
const safeArray = <T,>(v: T[] | undefined | null): T[] => (Array.isArray(v) ? v : []);
const arrLen = (v: any[] | undefined | null) => (Array.isArray(v) ? v.length : 0);

function bytesToHuman(n?: number) {
  const num = Number(n || 0);
  if (!num) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  return `${(num / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
}

function extOrType(item: HistoryItem): string {
  const t = (item.fileType || "").toLowerCase();
  if (t) return t; // se o backend já manda "pdf", "docx" etc.
  const name = (item.translatedName || item.originalName || "").toLowerCase();
  const m = name.match(/\.(pdf|docx|pptx)$/i);
  return m ? m[1].toLowerCase() : "";
}

function iconForType(item: HistoryItem) {
  const t = extOrType(item);
  if (t.includes("pdf")) return <PictureAsPdfIcon fontSize="small" />;
  if (t.includes("pptx") || t.includes("powerpoint")) return <SlideshowIcon fontSize="small" />;
  return <DescriptionIcon fontSize="small" />;
}

function canPreview(item: HistoryItem) {
  return extOrType(item).includes("pdf");
}

async function isDownloadReady(url: string): Promise<boolean> {
  // 1) HEAD quando disponível
  try {
    const r = await fetch(url, {
      method: "HEAD",
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` },
    });
    if (r.ok) return true;
  } catch {}
  // 2) GET parcial como fallback
  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        Range: "bytes=0-0",
      },
    });
    if (r.status === 200 || r.status === 206) return true;
  } catch {}
  return false;
}

// Converte "YYYY-MM-DD" em limites do dia local (inclusivo)
function startOfDayLocal(s?: string) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}
function endOfDayLocal(s?: string) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
}
// Normaliza createdAt (string ISO ou epoch) → Date
function toDateSafe(v?: string | number | null): Date | null {
  if (v == null) return null;
  if (typeof v === "number") return new Date(v);
  const dt = new Date(v);
  return isNaN(dt.getTime()) ? null : dt;
}

/* ========================
   Página
   ======================== */
export default function HistoryPage() {
  // filtros locais (type/size são client-side por enquanto)
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<"all" | "pdf" | "docx" | "pptx">("all");
  const [sizeBucket, setSizeBucket] = React.useState<"all" | "small" | "medium" | "large">("all");
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");

  // dados
  const [items, setItems] = React.useState<HistoryItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // paginação (0-based)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // feedback
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity?: "info" | "success" | "warning" | "error" }>({ open: false, msg: "" });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

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
      // getHistory -> Paged<HistoryItem>
      const paged = await getHistory({
        page,                 // 0-based
        size: rowsPerPage,    // IMPORTANTE: use "size", não "pageSize"
        q: qDebounced || undefined,
        from: dateFrom || undefined, // será ignorado no servidor? filtramos localmente também
        to: dateTo || undefined,
      } as HistoryFilters);

      // conteúdo com tipagem explícita
      const baseContent: HistoryItem[] = Array.isArray((paged as any)?.content)
        ? ((paged as any).content as HistoryItem[])
        : [];

      // --- filtro por data (client-side, inclusivo) ---
      const fromDate = startOfDayLocal(dateFrom);
      const toDate = endOfDayLocal(dateTo);

      let data: HistoryItem[] = baseContent;
      if (fromDate || toDate) {
        data = data.filter((it) => {
          const dt = toDateSafe(it.createdAt);
          if (!dt) return false;
          if (fromDate && dt < fromDate) return false;
          if (toDate && dt > toDate) return false;
          return true;
        });
      }

      // --- filtros por tipo e tamanho (client-side) ---
      if (type !== "all") {
        data = data.filter((it) => extOrType(it) === type);
      }
      if (sizeBucket !== "all") {
        data = data.filter((it) => {
          const sz = it.sizeBytes ?? 0;
          if (sizeBucket === "small") return sz > 0 && sz < 1 * 1024 * 1024;
          if (sizeBucket === "medium") return sz >= 1 * 1024 * 1024 && sz <= 10 * 1024 * 1024;
          if (sizeBucket === "large") return sz > 10 * 1024 * 1024;
          return true;
        });
      }

      setItems(data);
      // se filtramos client-side, total exibido vira o do array filtrado
      const serverTotal = (paged as any)?.totalElements ?? 0;
      setTotal((fromDate || toDate || type !== "all" || sizeBucket !== "all") ? data.length : serverTotal);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Falha ao carregar histórico.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [qDebounced, type, sizeBucket, dateFrom, dateTo, page, rowsPerPage]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const resetFilters = () => {
    setQ("");
    setType("all");
    setSizeBucket("all");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  };

  // ações
  const handlePreview = async (it: HistoryItem) => {
    const rawUrl = it.downloadUrl;
    if (!rawUrl) return;
    const url = absoluteUrl(rawUrl);
    const ready = await isDownloadReady(url);
    if (!ready) {
      setSnack({ open: true, msg: "O arquivo ainda está em processamento. Tente novamente em alguns segundos.", severity: "info" });
      return;
    }
    if (!canPreview(it)) {
      setSnack({ open: true, msg: "Este tipo de arquivo não possui visualização. O download será iniciado.", severity: "info" });
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (it: HistoryItem) => {
    const rawUrl = it.downloadUrl;
    if (!rawUrl) return;
    const url = absoluteUrl(rawUrl);
    const ready = await isDownloadReady(url);
    if (!ready) {
      setSnack({ open: true, msg: "O arquivo ainda está em processamento. Tente novamente em alguns segundos.", severity: "info" });
      return;
    }
    const filename = it.translatedName || it.originalName || "download";
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` }
      });
      const blob = await res.blob();
      saveAs(blob, filename);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
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
                value={sizeBucket}
                label="Tamanho"
                onChange={(e) => { setSizeBucket(e.target.value as any); setPage(0); }}
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
            {sizeBucket !== "all" && <Chip label={`Tamanho: ${sizeBucket}`} onDelete={() => setSizeBucket("all")} />}
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

                {!loading && arrLen(items) === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Nenhum documento encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && safeArray(items).map((it) => {
                  const displayName = it.translatedName || it.originalName || "-";
                  const typeLabel = (extOrType(it) || "-").toUpperCase();
                  const sz = bytesToHuman(it.sizeBytes);
                  const langFrom = (it.sourceLang || "?").toUpperCase();
                  const langTo = (it.targetLang || "-").toUpperCase();
                  const created = it.createdAt ? new Date(it.createdAt) : null;

                  return (
                    <TableRow key={String(it.id)} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {iconForType(it)}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" noWrap title={displayName}>{displayName}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>{typeLabel}</TableCell>
                      <TableCell>{sz}</TableCell>
                      <TableCell>{`${langFrom} → ${langTo}`}</TableCell>
                      <TableCell>{created ? created.toLocaleString() : "—"}</TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={canPreview(it) ? "Visualizar" : "Abrir/baixar"}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={!it.downloadUrl}
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
                                disabled={!it.downloadUrl}
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
            count={total || 0}
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
