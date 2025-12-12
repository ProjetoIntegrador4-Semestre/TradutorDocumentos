ALTER TABLE users ADD COLUMN email VARCHAR(255);

UPDATE users SET email = username || '@example.com' WHERE email IS NULL;

ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);