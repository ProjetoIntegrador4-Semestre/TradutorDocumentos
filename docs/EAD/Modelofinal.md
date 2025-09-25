```mermaid
graph TD
  A[TraduDoc - EAP]

  A --> B1[Entrega 01 - Produto]
  A --> B2[Entrega 02 - Plataforma e Operacao]
  A --> B3[Entrega 03 - Gestao e Documentacao]

  B1 --> C11[Backend API]
  B1 --> C12[Frontend Web]
  B1 --> C13[Aplicativo Mobile]

  C11 --> D111[Auth JWT OAuth]
  C11 --> D112[Traducao OCR]
  C11 --> D113[Historico e Armazenamento]

  C12 --> D121[Login Cadastro]
  C12 --> D122[UI de Traducao]
  C12 --> D123[Historico Download]

  C13 --> D131[Login JWT]
  C13 --> D132[Seletor de Arquivos]
  C13 --> D133[Historico Notificacoes]

  B2 --> C21[Infra AWS]
  B2 --> C22[Observabilidade e Seguranca]
  B2 --> C23[CI CD]

  C21 --> D211[VPC IAM]
  C21 --> D212[ECS ALB]
  C21 --> D213[RDS S3]

  C22 --> D221[Logs Metricas]
  C22 --> D222[Backups Retencao]
  C22 --> D223[Criptografia]

  C23 --> D231[Build Test]
  C23 --> D232[Artefatos Imagens]
  C23 --> D233[Deploy Automatizado]

  B3 --> C31[Gestao Agil]
  B3 --> C32[Qualidade Testes]
  B3 --> C33[Documentacao Academica]

  C31 --> D311[Board Sprints]
  C31 --> D312[Riscos Comunicacao]
  C31 --> D313[Status Reports]

  C32 --> D321[Testes Backend]
  C32 --> D322[Testes Web Mobile]
  C32 --> D323[Contratos API Smoke]

  C33 --> D331[Termo Escopo Visao]
  C33 --> D332[Artigo Cientifico]
  C33 --> D333[Diagramas C4 Classes]