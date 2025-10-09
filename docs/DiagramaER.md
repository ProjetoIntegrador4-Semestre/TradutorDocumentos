``` mermaid
erDiagram
  USERS {
    bigint id PK
    varchar username UK
    varchar email UK
    varchar password
    enum role       
  }

  TRANSLATION_RECORDS {
    bigint id PK
    bigint user_id FK   
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
    bigint user_id FK           
    char(64) token_hash UK     
    timestamptz expires_at
    boolean used
    timestamptz created_at
  }

  USERS ||--o{ TRANSLATION_RECORDS : ""
  USERS ||--o{ PASSWORD_RESET_TOKENS : ""
```