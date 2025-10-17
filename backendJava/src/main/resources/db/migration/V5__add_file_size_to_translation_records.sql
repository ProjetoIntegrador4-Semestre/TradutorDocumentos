ALTER TABLE translation_records
ADD COLUMN file_size_bytes BIGINT;

-- (opcional) se já quiser popular registros antigos com 0
UPDATE translation_records SET file_size_bytes = 0 WHERE file_size_bytes IS NULL;
