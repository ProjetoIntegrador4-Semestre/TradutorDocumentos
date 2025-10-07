-- 1) Remova a constraint antiga
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_role;

-- 2) Normalize dados já existentes (ex.: ROLE_USER -> user)
UPDATE users
SET role = lower(replace(role, 'ROLE_', ''));

-- 3) Recrie a constraint aceitando apenas user/admin (qualquer caixa)
ALTER TABLE users
  ADD CONSTRAINT chk_role
  CHECK (upper(role) IN ('USER', 'ADMIN'));
