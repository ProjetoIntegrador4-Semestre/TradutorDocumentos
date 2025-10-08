-- Pastas (materialized path)
CREATE TABLE folders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  parent_id UUID NULL REFERENCES folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,           -- ex: /<rootId>/<childId>/
  depth INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

-- nome único por usuário + pai (desconsiderando deletados)
CREATE UNIQUE INDEX ux_folders_siblings
  ON folders (user_id, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name))
  WHERE deleted_at IS NULL;

CREATE INDEX idx_folders_user_path   ON folders (user_id, path);
CREATE INDEX idx_folders_user_parent ON folders (user_id, parent_id);

-- Se já existir a tabela documents, adiciona folder_id (ajuste o nome se for diferente!)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_name = 'documents') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'documents' AND column_name = 'folder_id') THEN
      ALTER TABLE documents ADD COLUMN folder_id UUID NULL;
      ALTER TABLE documents
        ADD CONSTRAINT fk_documents_folder
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS idx_documents_user_folder
        ON documents (user_id, folder_id);
    END IF;
  END IF;
END$$;