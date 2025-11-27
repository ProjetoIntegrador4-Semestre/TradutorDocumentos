import React from "react";
import { useAuth } from "../context/AuthContext";
import { getLanguages, uploadAndTranslate } from "../services/api";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from "@mui/material";

type Lang = { code: string; name: string };
type Status = "idle" | "ready" | "translating" | "done" | "error";

export default function TranslatorPage() {
  const { isAuthenticated } = useAuth();

  const [langs, setLangs] = React.useState<Lang[]>([]);
  const [langsLoading, setLangsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [targetLang, setTargetLang] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  const [status, setStatus] = React.useState<Status>("idle");

  // Resultado / Preview
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [translatedBlob, setTranslatedBlob] = React.useState<Blob | null>(null);
  const [translatedFilename, setTranslatedFilename] = React.useState<string>("");

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Carrega idiomas quando autenticado
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setError(null);
      setLangsLoading(true);
      try {
        if (!isAuthenticated) {
          setLangs([]);
          setTargetLang("");
          setStatus("idle");
          return;
        }
        const data = await getLanguages();
        if (!mounted) return;
        setLangs(data);
        const def =
          data.find((d) => d.code === "pt")?.code ||
          data.find((d) => d.code === "en")?.code ||
          data[0]?.code ||
          "";
        setTargetLang(def);
      } catch {
        if (!mounted) return;
        setError("Não foi possível carregar os idiomas.");
      } finally {
        if (mounted) setLangsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  function resetAll() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTranslatedBlob(null);
    setTranslatedFilename("");
    setFile(null);
    setError(null);
    setStatus("idle");
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleTranslate() {
    if (!file) {
      setError("Selecione um arquivo.");
      return;
    }
    if (!targetLang) {
      setError("Selecione o idioma de destino.");
      return;
    }

    // Limpa resultado anterior
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTranslatedBlob(null);
    setTranslatedFilename("");

    setError(null);
    setStatus("translating");

    try {
      const { blob, filename } = await uploadAndTranslate(file, { targetLang });

      const name = filename || `translated_${file.name}`;
      setTranslatedFilename(name);
      setTranslatedBlob(blob);

      const isPdf =
        (blob.type && blob.type.includes("application/pdf")) ||
        name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null); // resultado não-preview
      }

      setStatus("done");
    } catch {
      setError("Falha ao traduzir o arquivo.");
      setStatus("error");
    }
  }

  function handleOpenInNewTab() {
    if (previewUrl) window.open(previewUrl, "_blank", "noopener,noreferrer");
  }

  function handleDownloadResult() {
    if (translatedBlob) triggerDownload(translatedBlob, translatedFilename || "translated");
  }

  // Derivados de estado
  const disabledTranslate = !isAuthenticated || langsLoading || !file || !targetLang || status === "translating";
  const hasResult = status === "done" && translatedBlob;
  const isPdfResult = !!previewUrl;

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: { xs: 2, sm: 3 },
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Traduzir Documento
      </Typography>

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Faça login</strong> para carregar a lista de idiomas e enviar arquivos.
        </Alert>
      )}

      {error && (
        <Alert data-testid="error-message" severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* STATUS HEADER */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={1.5}>
          <Typography variant="subtitle2" sx={{ minWidth: 120 }}>
            Status:
          </Typography>
          {status === "translating" && (
            <>
              <Chip color="info" label="Traduzindo…" />
              <Box sx={{ flex: 1 }}>
                <LinearProgress />
              </Box>
            </>
          )}
          {status === "done" && <Chip color="success" label="Tradução concluída" />}
          {status === "idle" && <Chip variant="outlined" label="Aguardando arquivo" />}
          {status === "ready" && <Chip variant="outlined" color="primary" label="Pronto para traduzir" />}
          {status === "error" && <Chip color="error" label="Erro na tradução" />}
        </Stack>
      </Paper>

      {/* QUADRO 1: Formulário */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderColor: "divider",
          borderRadius: 2,
          backgroundColor: "background.paper",
          opacity: langsLoading ? 0.7 : 1,
        }}
      >
        <Stack spacing={2}>
          <FormControl fullWidth disabled={!isAuthenticated || langsLoading || langs.length === 0}>
            <InputLabel id="target-lang-label">Idioma de destino</InputLabel>
            <Select
              labelId="target-lang-label"
              value={targetLang}
              label="Idioma de destino"
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {langs.map((l) => (
                <MenuItem key={l.code} value={l.code}>
                  {l.name} ({l.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              component="label"
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
            >
              Escolher arquivo
              <input type="file" hidden
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  setStatus(f ? "ready" : "idle");
                  // limpamos resultado anterior ao trocar arquivo
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                  setTranslatedBlob(null);
                  setTranslatedFilename("");
                }} />
            </Button>

            {file && (
              <Chip
                data-testid="file-chip"
                variant="outlined"
                label={`Selecionado: ${file.name}`}
                onDelete={() => {
                  setFile(null);
                  setStatus("idle");
                }}
              />
            )}
          </Stack>

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              data-testid="translate-button"
              variant="contained"
              onClick={handleTranslate}
              disabled={disabledTranslate}
            >
              {status === "translating" ? "Traduzindo..." : "Traduzir"}
            </Button>

            {hasResult && (
              <Button variant="text" color="inherit" onClick={resetAll}>
                Nova tradução
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* QUADRO 2: Resultado (PDF com preview OU arquivo comum) */}
      {hasResult && (
        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "background.paper",
          }}
        >
          {/* Barra superior */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              p: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Typography fontWeight={600} noWrap>
              {isPdfResult ? "Pré-visualização" : "Arquivo traduzido"}: {translatedFilename || "arquivo"}
            </Typography>
            <Stack direction="row" spacing={1}>
              {isPdfResult && (
                <Button variant="outlined" onClick={handleOpenInNewTab}>
                  Abrir em nova aba
                </Button>
              )}
              <Button variant="contained" color="success" onClick={handleDownloadResult}>
                Baixar
              </Button>
              <Button variant="contained" color="error" onClick={resetAll}>
                Fechar
              </Button>
            </Stack>
          </Box>

          {/* Corpo: iframe para PDF, ou só uma área com instrução para outros tipos */}
          {isPdfResult ? (
            <Box
              component="iframe"
              src={previewUrl!}
              title="Pré-visualização do PDF"
              sx={{
                display: "block",
                width: "100%",
                height: { xs: "65vh", md: "75vh" },
                border: 0,
                bgcolor: "background.default",
              }}
            />
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                O arquivo foi traduzido com sucesso. Clique em <strong>Baixar</strong> para salvar em seu dispositivo.
              </Typography>
              <Chip label={translatedFilename} />
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="success" onClick={handleDownloadResult}>
                  Baixar arquivo traduzido
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

      )}
    </Box>

  );
}
