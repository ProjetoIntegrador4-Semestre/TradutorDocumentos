# Backend - Tradutor Automático de Documentos

Backend Java para o sistema de tradução automática de documentos. Responsável por autenticação, processamento de arquivos, tradução de conteúdo e gerenciamento de registros de usuários.

## 📋 Visão Geral

Este backend foi desenvolvido com **Spring Boot 3.5.5** e **Java 21**, oferecendo:

- ✅ Autenticação JWT com suporte a OAuth2 (Google)
- ✅ Tradução de documentos (PDF, DOCX, PPT)
- ✅ Suporte a múltiplos idiomas
- ✅ Armazenamento local de arquivos
- ✅ API RESTful com Swagger/OpenAPI
- ✅ Banco de dados PostgreSQL com Flyway
- ✅ Integração com LibreTranslate e Google Cloud Translation

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
backendJava/
├── src/
│   ├── main/
│   │   ├── java/com/example/backend/
│   │   │   ├── AuthserverApplication.java       # Ponto de entrada Spring Boot
│   │   │   ├── BootLog.java                     # Logs de inicialização
│   │   │   ├── config/                          # Configurações
│   │   │   │   ├── HttpClientConfig.java
│   │   │   │   └── StaticResourceConfig.java
│   │   │   ├── controllers/                     # Endpoints REST
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── GoogleAuthController.java
│   │   │   │   ├── OAuth2ErrorController.java
│   │   │   │   ├── PasswordResetController.java
│   │   │   │   ├── RecordController.java
│   │   │   │   └── TranslationController.java
│   │   │   ├── dto/                             # Data Transfer Objects
│   │   │   │   ├── auth/
│   │   │   │   └── translation/
│   │   │   ├── entities/                        # Modelos do banco
│   │   │   │   ├── User.java
│   │   │   │   ├── TranslationRecord.java
│   │   │   │   └── PasswordResetToken.java
│   │   │   ├── repositories/                    # Acesso ao banco
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── TranslationRecordRepository.java
│   │   │   │   └── PasswordResetTokenRepository.java
│   │   │   ├── security/                        # Autenticação e autorização
│   │   │   │   ├── JwtUtils.java
│   │   │   │   ├── AuthTokenFilter.java
│   │   │   │   ├── UserDetailsImpl.java
│   │   │   │   ├── UserDetailsServiceImpl.java
│   │   │   │   ├── OAuth2LoginSuccessHandler.java
│   │   │   │   ├── WebSecurityConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   ├── services/
│   │   │   │   ├── auth/                       # Serviços de autenticação
│   │   │   │   ├── translation/                # Serviços de tradução
│   │   │   │   │   ├── TranslationService.java
│   │   │   │   │   ├── TranslationServiceImpl.java
│   │   │   │   │   ├── LibreTranslateService.java
│   │   │   │   │   ├── GoogleCloudTranslationService.java
│   │   │   │   │   └── LanguageServiceImpl.java
│   │   │   │   ├── generation/                 # Geradores de documentos
│   │   │   │   │   ├── DocxGenerator.java
│   │   │   │   │   ├── PdfGenerator.java
│   │   │   │   │   └── PptxGenerator.java
│   │   │   │   ├── storage/                    # Armazenamento de arquivos
│   │   │   │   └── email/                      # Envio de e-mails
│   │   │   └── util/
│   │   │       └── Tokens.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── db/migration/                   # Migrações Flyway
│   │       │   ├── V1__create_users.sql
│   │       │   └── ...
│   │       └── fonts/                          # Fontes para geração de PDFs
│   └── test/                                   # Testes
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Propósito |
|---|---|---|
| **Java** | 21 | Linguagem principal |
| **Spring Boot** | 3.5.5 | Framework web |
| **Spring Security** | 3.5.5 | Autenticação e autorização |
| **Spring Data JPA** | 3.5.5 | ORM e persistência |
| **JWT (JJWT)** | 0.12.3 | Tokens de autenticação |
| **PostgreSQL** | 16 | Banco de dados principal |
| **H2** | 2.x | Banco em memória (testes) |
| **Flyway** | 11.9.1 | Versionamento de banco |
| **Apache POI** | 5.3.0 | Processamento DOCX/PPTX |
| **PDFBox** | 2.0.32 | Processamento de PDF |
| **Google Cloud Translation** | 2.48.0 | API de tradução |
| **Springdoc OpenAPI** | 2.6.0 | Documentação Swagger |
| **Lombok** | 1.18.x | Redução de boilerplate |

---

## 🚀 Início Rápido

### Pré-requisitos

- Java 21+
- Maven 3.9+
- Docker e Docker Compose (recomendado)
- PostgreSQL 16 (se rodar sem Docker)

### Execução com Docker Compose

```bash
# Na pasta backendJava/
docker-compose up -d
```

Isto inicia:
- **Backend**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **PgAdmin**: http://localhost:5050
- **LibreTranslate**: http://localhost:5000

### Execução Local (sem Docker)

```bash
# Instalar dependências
mvn clean install

# Executar
mvn spring-boot:run
```

Certifique-se de ter o PostgreSQL rodando em `localhost:5432` com as credenciais:
```
POSTGRES_DB: translator
POSTGRES_USER: app
POSTGRES_PASSWORD: app
```

---

## 📚 Endpoints Principais

### Autenticação

#### Login (Signin)
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Resposta (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "usuario@example.com",
  "role": "user"
}
```

#### Registro (Signup)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "novouser",
  "email": "novo@example.com",
  "password": "senha123",
  "role": ["user"]
}
```

#### Login com Google
```http
GET /oauth2/authorization/google
```

Redireciona para o fluxo de autenticação do Google.

#### Reset de Senha
```http
POST /auth/password/request-reset
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

### Tradução

#### Traduzir Documento
```http
POST /translate-file
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>

file: <seu-arquivo.pdf>
source_lang: pt
target_lang: en
```

**Resposta (200 OK):**
```json
{
  "filename": "documento_traduzido_UUID.pdf",
  "url": "/files/documento_traduzido_UUID.pdf"
}
```

**Idiomas Suportados:**
- `pt` - Português
- `en` - Inglês
- `es` - Espanhol
- `fr` - Francês
- `de` - Alemão
- `it` - Italiano

#### Listar Idiomas
```http
GET /languages
Authorization: Bearer <JWT_TOKEN>
```

### Registros de Tradução

#### Listar Minhas Traduções
```http
GET /records
Authorization: Bearer <JWT_TOKEN>
```

#### Obter Detalhes de uma Tradução
```http
GET /records/{id}
Authorization: Bearer <JWT_TOKEN>
```

#### Deletar Tradução
```http
DELETE /records/{id}
Authorization: Bearer <JWT_TOKEN>
```

### Documentação Interativa

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

---

## 🔐 Autenticação

### JWT (JSON Web Token)

O backend utiliza JWT para autenticação stateless. O token deve ser enviado em toda requisição protegida:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Propriedades do Token:**
- **Algoritmo**: HS256
- **Expiração**: Configurável via `app.jwtSecret` e `app.jwtExpirationMs`
- **Claims**: `sub` (username), `id`, `role`

### Roles

- `user` - Usuário comum (pode fazer tradução)
- `admin` - Administrador (acesso total)

---

## 📝 Arquivos de Suporte

### Formatos de Arquivo

| Formato | Extensão | Suportado |
|---|---|---|
| PDF | .pdf | ✅ |
| Word | .docx | ✅ |
| PowerPoint | .pptx | ✅ |
| Texto | .txt | ✅ (via PDF) |

### Limite de Arquivo

- **Tamanho máximo**: 50 MB (configurável em `application.properties`)
- **Armazenamento**: `/app/data/uploads` (Docker) ou `data/uploads` (local)

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Banco de dados
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/translator
SPRING_DATASOURCE_USERNAME=app
SPRING_DATASOURCE_PASSWORD=app

# JWT
APP_JWT_SECRET=sua-chave-secreta-muito-longa-aqui
APP_JWT_EXPIRATION_MS=86400000  # 24 horas em ms

# Tradução
LIBRE_BASE_URL=http://libretranslate:5000
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json

# Armazenamento
APP_STORAGE_UPLOAD_DIR=/app/data/uploads
APP_STORAGE_OUTPUT_DIR=/app/data/outputs

# Email (se usar)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=seu-email@gmail.com
SPRING_MAIL_PASSWORD=sua-senha-app
```

### application.properties

```properties
# Server
server.port=8080
server.servlet.context-path=/

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Flyway
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# JWT
app.jwt.secret=${APP_JWT_SECRET:sua-chave-aqui}
app.jwt.expirationMs=${APP_JWT_EXPIRATION_MS:86400000}

# Arquivo
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

---

## 🗄️ Banco de Dados

### Migrações Flyway

As migrações são executadas automaticamente ao iniciar a aplicação:

| Versão | Descrição |
|---|---|
| V1 | Criação tabela `users` |
| V2 | Criação tabela `translation_records` |
| V3 | Adição coluna `email` em `users` |
| V4 | Simplificação de roles |
| V5 | Adição coluna `file_size` em `translation_records` |
| V6 | Criação tabela `password_reset_token` |
| V7 | Correção verificação de role do usuário |

### Schmas Principais

#### Usuários
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Registros de Tradução
```sql
CREATE TABLE translation_records (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  original_filename VARCHAR(255),
  translated_filename VARCHAR(255),
  source_language VARCHAR(10),
  target_language VARCHAR(10),
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Tokens de Reset de Senha
```sql
CREATE TABLE password_reset_token (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testes

### Executar Testes

```bash
mvn test
```

### Testes Disponíveis

- `UserRepositoryTest.java` - Testes do repositório de usuários
- `TranslationServiceTest.java` - Testes do serviço de tradução (quando disponível)

### Perfil de Teste

Use `application-test.properties` para configuração de testes:

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

---

## 🌍 Serviços de Tradução

### LibreTranslate

Serviço de tradução opensource gratuito. Configure em Docker Compose:

```yaml
libretranslate:
  image: libretranslate/libretranslate:latest
  environment:
    LT_LOAD_ONLY: "en,pt,es,fr,de,it"
  ports:
    - "5000:5000"
```

### Google Cloud Translation

Para usar a API do Google:

1. Criar projeto no Google Cloud Console
2. Gerar arquivo de credenciais JSON
3. Configurar variável `GOOGLE_APPLICATION_CREDENTIALS`

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

---

## 🐳 Docker

### Build Local

```bash
docker build -t tradutor-backend:latest .
```

### Variáveis no Docker

```bash
docker run -d \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/translator \
  -e SPRING_DATASOURCE_USERNAME=app \
  -e SPRING_DATASOURCE_PASSWORD=app \
  -e APP_JWT_SECRET=sua-chave-secreta \
  -v /app/data:/app/data \
  tradutor-backend:latest
```

---

## 📊 Fluxos Principais

### 1. Autenticação
```
Usuário → POST /api/auth/signin → JwtUtils gera token → Response com JWT
```

### 2. Tradução de Documento
```
1. Usuário faz upload via POST /translate-file com arquivo + idiomas
2. TranslationController recebe e chama TranslationService
3. TranslationService:
   - Extrai texto do arquivo (DocxGenerator, PdfGenerator, etc.)
   - Envia para LibreTranslate ou Google Cloud
   - Gera novo documento com texto traduzido
   - Armazena arquivo na pasta de outputs
   - Salva registro em translation_records
4. Response com URL para download do arquivo traduzido
```

### 3. OAuth2 Google Login
```
1. Frontend redireciona para /oauth2/authorization/google
2. Google redireciona para /login/oauth2/code/google com authorization code
3. Spring Security valida code e obtém user info do Google
4. OAuth2LoginSuccessHandler cria/atualiza usuário
5. Gera JWT e redireciona para frontend com token
```

---

## 🐛 Troubleshooting

### Erro: "Failed to connect to database"
- Verificar se PostgreSQL está rodando
- Confirmar credenciais em `application.properties`
- Se usar Docker Compose: `docker-compose logs db`

### Erro: "JWT signature does not match"
- JWT secret não coincide entre requisição e configuração
- Verificar `APP_JWT_SECRET` nas variáveis de ambiente

### Erro: "File upload size exceeds maximum"
- Aumentar `spring.servlet.multipart.max-file-size` em `application.properties`

### Erro: "LibreTranslate not reachable"
- Verificar se serviço está rodando: `docker-compose ps`
- Confirmar URL em `LIBRE_BASE_URL`

---

## 📦 Build e Deploy

### Build JAR

```bash
mvn clean package
```

Gera: `target/authserver-0.0.1-SNAPSHOT.jar`

### Deploy em Produção

```bash
# Com Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Ou com JAR
java -jar authserver-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db:5432/translator
```

---

## 🤝 Contribuindo

1. Criar branch para nova feature: `git checkout -b feature/nova-funcionalidade`
2. Fazer commits descritivos: `git commit -m "Adiciona suporte a XLSX"`
3. Push para branch: `git push origin feature/nova-funcionalidade`
4. Abrir Pull Request

### Padrões de Código

- **Naming**: camelCase para variáveis/métodos, PascalCase para classes
- **Formato**: Usar IDE para formatar (Alt+Shift+F no VS Code)
- **Javadoc**: Documentar métodos públicos e classes importantes
- **Testes**: Cobertura mínima de 70% para métodos críticos

---

## 📄 Licença

Projeto desenvolvido para SENAI-SP - Escola SENAI de Informática como parte do Projeto Integrador IV.

---

## 👥 Equipe

- Bruno Sakamoto
- Júlio Figueiredo
- Luiz Medeiros
- Rafael Sinkevicius
- Samuel Silva

**Orientador**: Professores da SENAI-SP

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação: Veja `/docs`
- Issues no GitHub: Abra uma issue descrevendo o problema
- Swagger UI: http://localhost:8080/swagger-ui.html
