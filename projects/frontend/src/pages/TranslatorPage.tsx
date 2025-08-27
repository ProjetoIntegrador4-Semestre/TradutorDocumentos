import {
  Box, Card, CardContent, CardHeader, Button, Stack, Typography,
  MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import React from "react";
import { uploadAndTranslate } from "../services/api";
import { saveAs } from "file-saver";

const LANGS = [
  { v: "en", l: "Inglês" }, { v: "es", l: "Espanhol" }, { v: "de", l: "Alemão" }, { v: "pt", l: "Português" }
];

export default function TranslatorPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [lang, setLang] = React.useState("en");
  const [result, setResult] = React.useState<Blob | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleTranslate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const blob = await uploadAndTranslate(file, lang);
      setResult(blob);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader title="Tradutor" />
        <CardContent>
          <Stack spacing={2}>
            <FormControl sx={{ maxWidth: 320 }}>
              <InputLabel>Selecione o idioma</InputLabel>
              <Select value={lang} label="Selecione o idioma" onChange={e => setLang(String(e.target.value))}>
                {LANGS.map(o => <MenuItem key={o.v} value={o.v}>{o.l}</MenuItem>)}
              </Select>
            </FormControl>

            <Box sx={{ border: "1px dashed", borderColor: "divider", p: 4, textAlign: "center", borderRadius: 2 }}>
              <input
                id="file-input"
                type="file"
                style={{ display: "none" }}
                accept=".pdf,.docx,.pptx"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-input">
                <Button variant="outlined" component="span">Clique aqui</Button>
              </label>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {file ? file.name : "para fazer upload do arquivo."}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button disabled={!file || loading} variant="contained" onClick={handleTranslate}>
                {loading ? "Traduzindo..." : "Traduzir"}
              </Button>
              <Button
                disabled={!result}
                variant="outlined"
                onClick={() => result && saveAs(result, `traduzido_${file?.name || "arquivo"}`)}
              >
                Baixar Arquivo
              </Button>
              <Button
                disabled={!result}
                variant="outlined"
                onClick={async () => {
                  if (!result) return;
                  const url = URL.createObjectURL(result);
                  window.open(url, "_blank");
                }}
              >
                Visualizar Arquivo
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
