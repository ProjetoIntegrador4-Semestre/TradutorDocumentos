-- Remover tabela de junção e roles, pois não vamos mais usar
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;

-- Garantir que a coluna role existe em users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- Definir constraint para aceitar apenas os papéis válidos
ALTER TABLE users
    ADD CONSTRAINT chk_role CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN'));

-- Garantir que role não seja nulo
ALTER TABLE users
    ALTER COLUMN role SET NOT NULL;

-- Atualizar usuários existentes (se tiver algum sem role)
UPDATE users SET role = 'ROLE_USER' WHERE role IS NULL;
