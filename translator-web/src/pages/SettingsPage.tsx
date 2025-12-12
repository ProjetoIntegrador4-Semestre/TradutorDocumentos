import React from "react";
import {
  Stack,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  TextField,
  Button,
  Alert,
  Avatar,
  Box,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  Typography,
} from "@mui/material";
import { getMe, type MeDTO,} from "../services/api";

type ThemeMode = "system" | "light" | "dark";

type Prefs = {
  theme: ThemeMode;
  defaultTargetLang?: string;
  pdfPreview: boolean; // abrir PDF na pré-visualização por padrão
};

const PREFS_KEY = "app_prefs_v1";

// Helpers de prefs (localStorage)
function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { theme: "system", pdfPreview: true };
    const p = JSON.parse(raw);
    return {
      theme: p.theme ?? "system",
      defaultTargetLang: p.defaultTargetLang ?? undefined,
      pdfPreview: typeof p.pdfPreview === "boolean" ? p.pdfPreview : true,
    };
  } catch {
    return { theme: "system", pdfPreview: true };
  }
}
function savePrefs(p: Prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("prefs:change"));
  // se seu ThemeProvider escuta 'theme:change', dispare também:
  window.dispatchEvent(new CustomEvent("theme:change", { detail: { theme: p.theme } }));
}

export default function SettingsPage() {
  // --------- USUÁRIO ---------
  const [me, setMe] = React.useState<MeDTO | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<string | null>(null);
  const [profileErr, setProfileErr] = React.useState<string | null>(null);

  // --------- PREFS ----------
  const [prefs, setPrefs] = React.useState<Prefs>(loadPrefs());
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [prefsMsg, setPrefsMsg] = React.useState<string | null>(null);

 
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await getMe();
        if (!mounted) return;
        setMe(user);
        // name: tente "name" se existir, senão username
        const displayName = (user as any).name || user.username || "";
        setName(String(displayName));
        setEmail(String(user.email || ""));
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ------- AÇÕES: PERFIL --------
  async function handleSaveProfile() {
    setProfileMsg(null);
    setProfileErr(null);
    setSavingProfile(true);

    try {
      // Tenta salvar no backend (se existir)
      // Convenção sugerida: PUT /api/users/me { username: name }
      const resp = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({ username: name }),
      });

      if (!resp.ok) {
        // Se o endpoint não existir / não implementado, persiste localmente
        if (resp.status === 404 || resp.status === 405 || resp.status === 501) {
          localStorage.setItem("profile_name_override", name);
          setProfileMsg("Nome atualizado localmente.");
        } else {
          const txt = await resp.text().catch(() => "");
          throw new Error(txt || "Falha ao salvar o perfil.");
        }
      } else {
        // sucesso no backend
        localStorage.removeItem("profile_name_override"); // já que agora vem do back
        setProfileMsg("Perfil atualizado com sucesso.");
      }
    } catch (e: any) {
      setProfileErr(e?.message || "Erro ao atualizar o perfil.");
    } finally {
      setSavingProfile(false);
    }
  }

  // ------- AÇÕES: PREFS --------
  function handleSavePrefs() {
    setPrefsMsg(null);
    setSavingPrefs(true);
    try {
      savePrefs(prefs);
      setPrefsMsg("Preferências salvas.");
    } finally {
      setSavingPrefs(false);
    }
  }

  function handleResetPrefs() {
    const def: Prefs = { theme: "system", pdfPreview: true, defaultTargetLang: undefined };
    setPrefs(def);
    savePrefs(def);
    setPrefsMsg("Preferências redefinidas.");
  }

  const userInitial = (name || email || "U").charAt(0).toUpperCase();

  return (
    <Stack spacing={3} sx={{ p: 2, maxWidth: 960, mx: "auto" }}>
      {/* CARD: Perfil */}
      <Card>
        <CardHeader title="Perfil do usuário" />
        <CardContent>
          {profileMsg && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProfileMsg(null)}>
              {profileMsg}
            </Alert>
          )}
          {profileErr && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProfileErr(null)}>
              {profileErr}
            </Alert>
          )}

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56 }}>
              {userInitial}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" color="text.secondary">ID</Typography>
              <Typography variant="body2" noWrap>{me?.id ?? "—"}</Typography>
              <Chip
                label={String(me?.role || "user")}
                size="small"
                sx={{ mt: 0.5 }}
                variant="outlined"
              />
            </Box>
          </Stack>

          <Stack spacing={2}>
            <TextField
              label="Nome exibido"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              helperText="Como seu nome aparecerá na aplicação."
            />
            <TextField
              label="E-mail"
              value={email}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={savingProfile || !name.trim()}
          >
            {savingProfile ? "Salvando..." : "Salvar perfil"}
          </Button>
        </CardActions>
      </Card>

      {/* CARD: Preferências */}
      <Card>
        <CardHeader title="Preferências" />
        <CardContent>
          {prefsMsg && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPrefsMsg(null)}>
              {prefsMsg}
            </Alert>
          )}

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.pdfPreview}
                  onChange={(_, checked) =>
                    setPrefs((p) => ({ ...p, pdfPreview: checked }))
                  }
                />
              }
              label="Abrir PDFs na pré-visualização (em vez de baixar automaticamente)"
            />

            <Divider sx={{ my: 1 }} />

            <Typography variant="body2" color="text.secondary">
              Dica: sua página de tradução pode ler essas preferências para definir o idioma
              de destino padrão e o comportamento de visualização/baixar.
            </Typography>
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" onClick={handleSavePrefs} disabled={savingPrefs}>
            {savingPrefs ? "Salvando..." : "Salvar preferências"}
          </Button>
          <Button variant="outlined" color="inherit" onClick={handleResetPrefs}>
            Redefinir
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
}
