# TraduDoc - Estrutura Analitica do Projeto (EAP)

```mermaid
flowchart TB
  P["TraduDoc - Estrutura Analitica do Projeto (EAP)"]

  %% Nivel 1
  P --> D1["Entrega 01 - Produto"]
  P --> D2["Entrega 02 - Plataforma e Operacao"]
  P --> D3["Entrega 03 - Gestao, Qualidade e Documentacao"]

  %% Nivel 2
  D1 --> B1["Backend (API de Traducao)"]
  D1 --> F1["Frontend Web"]
  D1 --> M1["Aplicativo Mobile"]

  D2 --> I1["Infra em Nuvem (AWS)"]
  D2 --> O1["Observabilidade e Seguranca"]
  D2 --> C1["CI/CD"]

  D3 --> G1["Gestao Agil"]
  D3 --> Q1["Qualidade e Testes"]
  D3 --> D1B["Documentacao Academica"]

  %% Nivel 3 (exemplos)
  B1 --> B1a["Autenticacao (JWT/OAuth) e RBAC"]
  B1 --> B1b["Traducao e OCR (pipeline)"]
  B1 --> B1c["Historico + RDS/S3"]

  F1 --> F1a["Login/Cadastro + OAuth"]
  F1 --> F1b["UI de Traducao (upload/idiomas/status)"]
  F1 --> F1c["Historico + Download"]

  M1 --> M1a["Login/JWT (sessao segura)"]
  M1 --> M1b["Seletor de Arquivos (PDF/DOCX/PPT)"]
  M1 --> M1c["Historico/Push (opcional)"]

  I1 --> I1a["VPC / IAM (menor privilegio)"]
  I1 --> I1b["ECS + ALB"]
  I1 --> I1c["RDS Postgres + S3"]

  O1 --> O1a["Logs e Metricas"]
  O1 --> O1b["Backups e Retencao (LGPD)"]
  O1 --> O1c["Criptografia (transito/repouso)"]

  C1 --> C1a["Build e Test (GitHub Actions)"]
  C1 --> C1b["Artefatos / Imagens"]
  C1 --> C1c["Deploy Automatizado"]

  G1 --> G1a["Board e Sprints (GitHub Projects)"]
  G1 --> G1b["Riscos e Comunicacao"]
  G1 --> G1c["Relatorios de Status"]

  Q1 --> Q1a["Testes Backend"]
  Q1 --> Q1b["Testes Web/Mobile"]
  Q1 --> Q1c["Contratos de API / Smoke"]

  D1B --> D1Ba["Termo]()