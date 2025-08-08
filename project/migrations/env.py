import asyncio
from alembic import context
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.models import Base
from app.core.config import settings

# Configuração do Alembic
config = context.config

# Para migrações, usamos uma engine síncrona
# Substitua 'asyncpg' por 'psycopg2' na URL do banco
sync_database_url = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")
connectable = create_engine(sync_database_url, echo=True)

def run_migrations_online():
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=Base.metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    raise Exception("Offline mode not supported")
else:
    run_migrations_online()