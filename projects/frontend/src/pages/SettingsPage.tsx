import {
  Card, CardHeader, CardContent, Stack, TextField, Button,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import React from "react";
import { LanguageContext } from "../hooks/useLanguage";

export default function SettingsPage() {
  const [name, setName] = React.useState("Usuário(a)");
  const [email, setEmail] = React.useState("usuario@example.com");

  const { lang, setLang, options } = React.useContext(LanguageContext);

  const save = () => {
    alert("Dados salvos!");
  };

  return (
    <Card>
      <CardHeader title="Configuração" />
      <CardContent>
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} />
          <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />

          <FormControl>
            <InputLabel>Idioma do Site</InputLabel>
            <Select
              label="Idioma do Site"
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
            >
              {options.map(o => (
                <MenuItem key={o.v} value={o.v}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={save}>Salvar</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
