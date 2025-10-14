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
} from "@mui/material";

type Lang = { code: string; name: string };

export default function TranslatorPage() {
  const { isAuthenticated } = useAuth();

  const [langs, setLangs] = React.useState<Lang[]>([]);
  const [langsLoading, setLangsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [targetLang, setTargetLang] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  // Pré-visualização
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
    setError(null);
    setUploading(true);

    // limpa preview anterior
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setTranslatedBlob(null);
      setTranslatedFilename("");
    }

    try {
      const { blob, filename } = await uploadAndTranslate(file, { targetLang });

      const isPdf =
        (blob.type && blob.type.includes("application/pdf")) ||
        (filename && filename.toLowerCase().endsWith(".pdf"));

      if (isPdf) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setTranslatedBlob(blob);
        setTranslatedFilename(
          filename || `translated_${file.name.replace(/\.[^/.]+$/, "")}.pdf`
        );
      } else {
        triggerDownload(blob, filename || `translated_${file.name}`);
      }
    } catch {
      setError("Falha ao traduzir o arquivo.");
    } finally {
      setUploading(false);
    }
  }

  function handleClosePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTranslatedBlob(null);
    setTranslatedFilename("");
  }

  function handleDownloadFromPreview() {
    if (translatedBlob) {
      triggerDownload(translatedBlob, translatedFilename || "translated.pdf");
    }
  }

  function handleOpenInNewTab() {
    if (previewUrl) {
      window.open(previewUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        p: { xs: 2, sm: 3 },
        bgcolor: "background.default", // adapta ao tema
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* QUADRO 1: Formulário de tradução */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderColor: "divider",          // borda segue tema
          borderRadius: 2,                  // cantos arredondados
          backgroundColor: "background.paper",
          boxShadow: (t) => (t.palette.mode === "light" ? 0 : 0), // sem shadow, só moldura
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

          <Button
            component="label"
            variant="outlined"
            sx={{ alignSelf: "flex-start" }}
          >
            Escolher arquivo
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Button>

          <Divider />

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={handleTranslate}
              disabled={!isAuthenticated || uploading || !file || !targetLang}
            >
              {uploading ? "Traduzindo..." : "Traduzir"}
            </Button>
            {file && (
              <Typography variant="body2" sx={{ alignSelf: "center", opacity: 0.8 }}>
                Selecionado: {file.name}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* QUADRO 2: Pré-visualização PDF */}
      {previewUrl && (
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              p: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "action.hover", // barra superior sutil, adaptativa ao tema
            }}
          >
            <Typography fontWeight={600} noWrap>
              Pré-visualização: {translatedFilename || "arquivo.pdf"}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={handleOpenInNewTab}>
                Abrir em nova aba
              </Button>
              <Button variant="contained" color="success" onClick={handleDownloadFromPreview}>
                Baixar PDF
              </Button>
              <Button variant="contained" color="error" onClick={handleClosePreview}>
                Fechar
              </Button>
            </Stack>
          </Box>

          <Box
            component="iframe"
            src={previewUrl}
            title="Pré-visualização do PDF"
            sx={{
              display: "block",
              width: "100%",
              height: { xs: "65vh", md: "75vh" },
              border: 0,
              bgcolor: "background.default",
            }}
          />
        </Paper>
      )}
    </Box>
  );
}
