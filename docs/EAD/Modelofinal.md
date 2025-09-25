flowchart TB
  P["TraduDoc - Estrutura Analitica do Projeto (EAP)"]

  P --> D1["Entrega 01 - Produto"]
  P --> D2["Entrega 02 - Plataforma e Operacao"]
  P --> D3["Entrega 03 - Gestao Qualidade e Documentacao"]

  D1 --> B1["Backend API de Traducao"]
  D1 --> F1["Frontend Web"]
  D1 --> M1["Aplicativo Mobile"]

  D2 --> I1["Infra em Nuvem AWS"]
  D2 --> O1["Observabilidade e Seguranca"]
  D2 --> C1["CI CD"]

  D3 --> G1["Gestao Agil"]
  D3 --> Q1["Qualidade e Testes"]
  D3 --> DD1["Documentacao Academica"]

  B1 --> B1a["Autenticacao JWT e OAuth e RBAC"]
  B1 --> B1b["Traducao e OCR Pipeline"]
  B1 --> B1c["Historico e Armazenamento RDS e S3"]

  F1 --> F1a["Login e Cadastro OAuth"]
  F1 --> F1b["Tela de Traducao Upload Idiomas Status"]
  F1 --> F1c["Historico e Download"]

  M1 --> M1a["Login JWT Sessao Segura"]
  M1 --> M1b["Seletor de Arquivos PDF DOCX PPT"]
  M1 --> M1c["Historico e Notificacoes"]

  I1 --> I1a["VPC e IAM Menor Privilegio"]
  I1 --> I1b["ECS e Load Balancer"]
  I1 --> I1c["RDS Postgres e S3"]

  O1 --> O1a["Logs e Metricas"]
  O1 --> O1b["Backups e Retencao LGPD"]
  O1 --> O1c["Criptografia em Transito e em Repouso"]

  C1 --> C1a["Build e Teste GitHub Actions"]
  C1 --> C1b["Artefatos e Imagens"]
  C1 --> C1c["Deploy Automatizado"]

  G1 --> G1a["Board e Sprints GitHub Projects"]
  G1 --> G1b["Riscos e Comunicacao"]
  G1 --> G1c["Relatorios de Status"]

  Q1 --> Q1a["Testes Backend"]
  Q1 --> Q1b["Testes Web e Mobile"]
  Q1 --> Q1c["Contratos de API e Smoke"]

  DD1 --> DD1a["Termo Escopo Visao"]
  DD1 --> DD1b["Artigo Cientifico Even3"]
  DD1 --> DD1c["Diagramas C4 e Classes"]