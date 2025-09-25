```mermaid
flowchart TB
  %% Nível 1
  P[TraduDoc — Estrutura Analítica do Projeto]

  P --> E1[Entrega 01 — Produto (Solução)]
  P --> E2[Entrega 02 — Plataforma & Operação]
  P --> E3[Entrega 03 — Gestão, Qualidade & Documentação]

  %% Nível 2
  E1 --> E1_1[Subentrega — Backend (API de Tradução)]
  E1 --> E1_2[Subentrega — Frontend Web]
  E1 --> E1_3[Subentrega — App Mobile]

  E2 --> E2_1[Subentrega — Infra AWS]
  E2 --> E2_2[Subentrega — Observabilidade & Segurança]
  E2 --> E2_3[Subentrega — CI/CD]

  E3 --> E3_1[Subentrega — Gestão Ágil]
  E3 --> E3_2[Subentrega — Qualidade & Testes]
  E3 --> E3_3[Subentrega — Documentação Acadêmica]

  %% Nível 3 (exemplos objetivos e mensuráveis)
  %% Backend
  E1_1 --> E1_1a[Auth JWT/OAuth e RBAC]
  E1_1 --> E1_1b[Tradução & OCR (pipeline)]
  E1_1 --> E1_1c[Histórico + RDS/S3]

  %% Frontend
  E1_2 --> E1_2a[Login/Cadastro + OAuth]
  E1_2 --> E1_2b[UI de Tradução (upload/idiomas/status)]
  E1_2 --> E1_2c[Histórico + Download]

  %% Mobile
  E1_3 --> E1_3a[Login/JWT (sessão segura)]
  E1_3 --> E1_3b[File Picker PDF/DOCX/PPT]
  E1_3 --> E1_3c[Histórico/Push (opcional)]

  %% Infra
  E2_1 --> E2_1a[VPC/IAM (menor privilégio)]
  E2_1 --> E2_1b[ECS + ALB]
  E2_1 --> E2_1c[RDS Postgres + S3]

  %% Observabilidade & Segurança
  E2_2 --> E2_2a[Logs/Métricas/Alarmes]
  E2_2 --> E2_2b[Backups/Retenção (LGPD)]
  E2_2 --> E2_2c[Criptografia em trânsito/repouso]

  %% CI/CD
  E2_3 --> E2_3a[Build/Test (GitHub Actions)]
  E2_3 --> E2_3b[Imagem/Artefatos]
  E2_3 --> E2_3c[Deploy Automatizado]

  %% Gestão Ágil
  E3_1 --> E3_1a[Board/Sprints (GitHub Projects)]
  E3_1 --> E3_1b[Riscos & Comunicação]
  E3_1 --> E3_1c[Status Reports]

  %% Qualidade & Testes
  E3_2 --> E3_2a[Testes Backend]
  E3_2 --> E3_2b[Testes Web/Mobile]
  E3_2 --> E3_2c[Testes de Contrato/Smoke]

  %% Documentação
  E3_3 --> E3_3a[Termo/Visão/Escopo]
  E3_3 --> E3_3b[Artigo Científico]
  E3_3 --> E3_3c[Diagramas C4 & Classes]

  %% Legenda de fases (como no exemplo: Concepção / Execução)
  subgraph Fases
    direction TB
    F1[Concepção]
    F2[Execução]
  end