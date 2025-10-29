// src/pages/admin/AdminUsersPage.tsx
import React from "react";
import {
  Stack,
  Card,
  CardHeader,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Box,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import FolderIcon from "@mui/icons-material/Folder";
import RefreshIcon from "@mui/icons-material/Refresh";
import Button from "@mui/material/Button";
import type { Paged, RoleString } from "../../services/api";
import {
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminListUserRecords,
  adminDeleteUserRecord,
  type AdminUserDTO,
  type AdminRecordDTO,
} from "../../services/admin";

// Helpers
function bytesToHuman(n?: number) {
  const num = Number(n || 0);
  if (!num) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(num) / Math.log(1024));
  return `${(num / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${u[i]}`;
}

type RowEdit = {
  username?: string;
  role?: Extract<RoleString, "user" | "admin">;
  enabled?: boolean;
};

export default function AdminUsersPage() {
  // filtros
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState<"" | "user" | "admin">("");
  const [enabled, setEnabled] = React.useState<"" | "true" | "false">("");

  // dados
  const [paged, setPaged] = React.useState<Paged<AdminUserDTO> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // paginação
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);

  // edição por linha
  const [dirty, setDirty] = React.useState<Record<string | number, RowEdit>>({});

  // feedback
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; severity?: "info" | "success" | "warning" | "error" }>({ open: false, msg: "" });
  const closeSnack = () => setSnack(s => ({ ...s, open: false }));

  // excluir user
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | number | null>(null);

  // Drawer de documentos
  const [drawerUser, setDrawerUser] = React.useState<AdminUserDTO | null>(null);
  const [recPaged, setRecPaged] = React.useState<Paged<AdminRecordDTO> | null>(null);
  const [recLoading, setRecLoading] = React.useState(false);
  const [recPage, setRecPage] = React.useState(0);
  const [recRpp, setRecRpp] = React.useState(20);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await adminListUsers({
        q: q || undefined,
        role: role || undefined,
        enabled: enabled === "" ? undefined : enabled === "true",
        page,
        size: rowsPerPage,
      });
      setPaged(p);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, [q, role, enabled, page, rowsPerPage]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function resetFilters() {
    setQ("");
    setRole("");
    setEnabled("");
    setPage(0);
  }

  // ---- edição ----
  function setRowDirty(id: string | number, patch: RowEdit) {
    setDirty((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function saveRow(id: string | number) {
    const patch = dirty[id];
    if (!patch) return;
    try {
      const updated = await adminUpdateUser(id, patch);
      // aplica na lista
      setPaged((p) =>
        p
          ? {
            ...p,
            content: p.content.map((u) => (u.id === id ? { ...u, ...updated } : u)),
          }
          : p
      );
      setDirty((d) => {
        const { [id]: _omit, ...rest } = d;
        return rest;
      });
      setSnack({ open: true, msg: "Alterações salvas.", severity: "success" });
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || "Erro ao salvar.", severity: "error" });
    }
  }

  async function deleteRow(id: string | number) {
    try {
      await adminDeleteUser(id);
      setPaged((p) =>
        p
          ? {
            ...p,
            content: p.content.filter((u) => u.id !== id),
            totalElements: Math.max(0, p.totalElements - 1),
          }
          : p
      );
      setSnack({ open: true, msg: "Usuário excluído.", severity: "success" });
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || "Erro ao excluir.", severity: "error" });
    } finally {
      setConfirmDeleteId(null);
    }
  }

  // ---- documentos (drawer) ----
  const fetchRecords = React.useCallback(async () => {
    if (!drawerUser) return;
    setRecLoading(true);
    try {
      const p = await adminListUserRecords(drawerUser.id, recPage, recRpp);
      setRecPaged(p);
    } catch {
      setRecPaged({ content: [], totalElements: 0, totalPages: 0, number: 0, size: recRpp });
    } finally {
      setRecLoading(false);
    }
  }, [drawerUser, recPage, recRpp]);

  React.useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  async function deleteRecord(recId: string | number) {
    if (!drawerUser) return;
    try {
      await adminDeleteUserRecord(drawerUser.id, recId);
      setRecPaged((p) =>
        p
          ? {
            ...p,
            content: p.content.filter((r) => r.id !== recId),
            totalElements: Math.max(0, p.totalElements - 1),
          }
          : p
      );
      setSnack({ open: true, msg: "Documento excluído.", severity: "success" });
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || "Erro ao excluir documento.", severity: "error" });
    }
  }

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      <Card>
        <CardHeader title="Administração — Usuários" />
        <CardContent>
          {/* Filtros */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
            <TextField
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Pesquisar por nome ou e-mail..."
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
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e: SelectChangeEvent) => { setRole(e.target.value as any); setPage(0); }}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="user">user</MenuItem>
                <MenuItem value="admin">admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Ativo</InputLabel>
              <Select
                value={enabled}
                label="Ativo"
                onChange={(e: SelectChangeEvent) => { setEnabled(e.target.value as any); setPage(0); }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Ativos</MenuItem>
                <MenuItem value="false">Desativados</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              size="medium"
              sx={{
                minWidth: 110,          
                px: 2,                  
                py: 0.75,               
                lineHeight: 1.25,       
                borderRadius: 2,        
                whiteSpace: "nowrap",   
                ".MuiButton-startIcon": { mr: 0.75 }
              }}
            >
              Atualizar
            </Button>
            <Button variant="outlined" onClick={resetFilters}>Limpar</Button>
          </Stack>

          {/* Chips dos filtros */}
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
            {q && <Chip label={`Busca: "${q}"`} onDelete={() => setQ("")} />}
            {role && <Chip label={`Role: ${role}`} onDelete={() => setRole("")} />}
            {enabled && <Chip label={`Ativo: ${enabled}`} onDelete={() => setEnabled("")} />}
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Ativo</TableCell>
                  <TableCell align="right">Ações</TableCell>
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

                {!loading && (!paged || paged.content.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Nenhum usuário encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {!loading && paged?.content.map((u) => {
                  const edit = dirty[u.id] || {};
                  const pending = Boolean(dirty[u.id]);
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={edit.username ?? u.username}
                          onChange={(e) => setRowDirty(u.id, { username: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <Select
                          size="small"
                          value={(edit.role ?? u.role) as any}
                          onChange={(e: SelectChangeEvent) =>
                            setRowDirty(u.id, { role: e.target.value as "user" | "admin" })
                          }
                        >
                          <MenuItem value="user">user</MenuItem>
                          <MenuItem value="admin">admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Switch
                            checked={edit.enabled ?? u.enabled}
                            onChange={(_, checked) => setRowDirty(u.id, { enabled: checked })}
                          />
                          {(edit.enabled ?? u.enabled) ? (
                            <Chip size="small" color="success" label="Ativo" />
                          ) : (
                            <Chip size="small" color="warning" label="Desativado" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Documentos">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDrawerUser(u);
                                  setRecPage(0);
                                }}
                              >
                                <FolderIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title={pending ? "Salvar" : "Nada a salvar"}>
                            <span>
                              <IconButton
                                size="small"
                                disabled={!pending}
                                onClick={() => saveRow(u.id)}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Excluir usuário">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setConfirmDeleteId(u.id)}
                              >
                                <DeleteIcon fontSize="small" />
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
            count={paged?.totalElements || 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50, 100]}
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

      {/* Confirmar exclusão */}
      <Dialog open={confirmDeleteId != null} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Excluir usuário?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Esta ação é irreversível. Os dados associados podem ser afetados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button color="error" onClick={() => confirmDeleteId != null && deleteRow(confirmDeleteId!)}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer de Documentos do usuário */}
      <Drawer
        anchor="right"
        open={!!drawerUser}
        onClose={() => setDrawerUser(null)}
        PaperProps={{ sx: { width: { xs: "100%", md: 640 } } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Documentos de {drawerUser?.username} ({drawerUser?.email})
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {recLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={22} /> <Typography>Carregando…</Typography>
            </Box>
          )}

          {!recLoading && (!recPaged || recPaged.content.length === 0) && (
            <Alert severity="info">Nenhum documento encontrado para este usuário.</Alert>
          )}

          {!recLoading && recPaged && recPaged.content.length > 0 && (
            <>
              <TableContainer sx={{ mb: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Arquivo</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Tamanho</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recPaged.content.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap title={r.originalName}>
                            {r.originalName || r.translatedName || r.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{(r.fileType || "-").toUpperCase()}</TableCell>
                        <TableCell>{bytesToHuman(r.sizeBytes)}</TableCell>
                        <TableCell>
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {/* apenas excluir por agora; você pode adicionar Visualizar/Baixar se quiser */}
                            <Tooltip title="Excluir documento">
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => deleteRecord(r.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={recPaged.totalElements}
                page={recPage}
                onPageChange={(_, p) => setRecPage(p)}
                rowsPerPage={recRpp}
                onRowsPerPageChange={(e) => { setRecRpp(parseInt(e.target.value, 10)); setRecPage(0); }}
                rowsPerPageOptions={[10, 20, 50]}
                labelRowsPerPage="Linhas por página"
              />
            </>
          )}
        </Box>
      </Drawer>
    </Stack>
  );
}
