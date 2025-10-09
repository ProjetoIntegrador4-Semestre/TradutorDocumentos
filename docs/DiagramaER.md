erDiagram
  USERS {
    bigint id PK
    varchar username UK
    varchar email UK
    varchar password
    enum role        // USER | ADMIN
  }

  TRANSLATION_RECORDS {
    bigint id PK
    bigint user_id FK   // opcional (nullable)
    varchar original_filename
    varchar file_type
    varchar detected_lang
    varchar target_lang
    bigint  file_size_bytes
    varchar output_path
    timestamptz created_at
  }

  PASSWORD_RESET_TOKENS {
    bigint id PK
    bigint user_id FK        // obrigatório (NOT NULL)
    char(64) token_hash UK   // SHA-256 em hex
    timestamptz expires_at
    boolean used
    timestamptz created_at
  }

  %% Relacionamentos
  %% Um usuário pode ter 0..N traduções (user_id é opcional em TRANSLATION_RECORDS)
  USERS ||--o{ TRANSLATION_RECORDS : "owns (optional)"

  %% Um usuário pode ter 0..N tokens de reset (user_id é obrigatório em PASSWORD_RESET_TOKENS)
  USERS ||--o{ PASSWORD_RESET_TOKENS : "password reset"
