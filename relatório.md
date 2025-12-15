# Pendências Finais — Projeto Integrador (TraduDoc)

## 1) CI/CD
- [ ] Backend: Actions (`checkout → JDK → build/test → Jacoco → CodeQL → Docker build → push registry`)
- [ ] Frontend Web: `Node setup → install → lint/test → build → upload artefato`
- [ ] Mobile: build APK/AAB (debug/release) como artefato
- [ ] Deploy: **staging** automático no merge; **prod** via tag `vX.Y.Z`
- [ ] Infra: Terraform/CloudFormation para app, DB, S3, CloudFront/ECS
- [ ] Secrets: GitHub Secrets + AWS SM/SSM
- [ ] Qualidade: gate de cobertura (≥70%) e lint quebrando o build
- [ ] Observabilidade: healthcheck, logs e alertas

## 2) Testes Unitários
**Backend (Java)**
- [ ] Jacoco configurado (gera `jacoco.xml`)
- [ ] Services: `TranslationService`, `StorageService(S3)`, `OCRService`, `AuthService` (com mocks)
- [ ] Web: `MockMvc`/`WebTestClient` (status, payload, validação)
- [ ] Repos: H2/Testcontainers
- [ ] Segurança: rotas privadas/públicas, roles, expiração de JWT

**Web**
- [ ] Jest/Vitest + Testing Library (componentes, hooks, erros)
- [ ] E2E leve (Playwright/Cypress) do fluxo upload→tradução→download

**Mobile**
- [ ] Unit tests de services (auth, upload) e navegação
- [ ] Mocks de API para fluxos principais

## 3) Relatório de Segurança (Testes)
- [ ] Escopo + ameaças (OWASP/STRIDE)
- [ ] Hardening: HTTPS, CORS, HSTS, CSP, headers seguros
- [ ] AuthN/Z: JWT + refresh, papéis, mínimo privilégio
- [ ] Secrets: em Secrets Manager/SSM; proibir em Git
- [ ] Criptografia: RDS/S3 com KMS; TLS em trânsito
- [ ] SAST: CodeQL/Semgrep (evidências)
- [ ] DAST: OWASP ZAP em staging (achados e tratativas)
- [ ] Dependências: Dependabot/Snyk
- [ ] Upload seguro: MIME/tamanho, antivírus opcional, presigned URL curto
- [ ] Logs/auditoria + plano de incidentes
- [ ] Entregar `SEGURANCA.md` com prints/IDs dos scanners

## 4) Diretório de Pastas (Opcional)
- [ ] Estrutura: `/docs /infra /backend /web /mobile /.github/workflows`
- [ ] Commits convencionais e branches (`feat/*`, `hotfix/*`, `release/*`)
- [ ] Templates: ISSUE/PR
- [ ] `.env.example`/`application-example.yml`
- [ ] Makefile/scripts: `build`, `test`, `deploy`
- [ ] READMEs por módulo

## 5) Diagrama de Classes (Backend)
- [ ] Entidades: `User`, `Role`, `Document`, `TranslationJob`, `Language`, `AuditLog`
- [ ] Serviços: `TranslationService`, `StorageService`, `OCRService`, `AuthService`
- [ ] Web: `AuthController`, `DocumentController`, DTOs/Validators
- [ ] Repositórios JPA de `User`, `Document`, `TranslationJob`, `AuditLog`
- [ ] Estados do job: `PENDING|RUNNING|DONE|FAILED`
- [ ] Versão em `/docs/arquitetura/diagrama-classes.mmd` (Mermaid/PlantUML)

### Exemplo
```mermaid
classDiagram
  class User {
    UUID id
    String email
    String passwordHash
    Set<Role> roles
  }

  class Document {
    UUID id
    String name
    String s3Key
    String mime
    User owner
  }

  class TranslationJob {
    UUID id
    Lang source
    Lang target
    Status status
    String outputS3Key
  }

  class TranslationService {
    +startJob(doc, src, tgt)
    +getStatus(id)
  }

  class StorageService {
    +upload()
    +presignedGet()
  }

  class AuthService {
    +login()
    +refresh()
    +validate()
  }

  User "1" --> "*" Document : owns
  Document "1" --> "*" TranslationJob : has
  TranslationService --> Document
  TranslationService --> StorageService
  AuthService --> User