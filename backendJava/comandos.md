Comandos

### Comando se der erro da coluna USERS
- docker exec -it translator-db psql -U app -d translator -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;"

### Limpar o cache da aplicação
- docker builder prune -af
- docker image prune -af
- docker compose up --build