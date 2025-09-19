# alembic/env.py
from logging.config import fileConfig
from alembic import context
import os
from sqlalchemy import create_engine

# IMPORTANTE: Base dos seus modelos
from app.models.entities import Base   # garanta que app/ e app/models/ têm __init__.py
from dotenv import load_dotenv

# carrega .env
load_dotenv()



config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

# pega a URL do .env e injeta no alembic.ini em tempo de execução
db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise RuntimeError("DATABASE_URL não definido. Configure no .env ou no ambiente.")
config.set_main_option("sqlalchemy.url", db_url)

target_metadata = Base.metadata  # <- coração do autogenerate

def run_migrations_offline():
    url = os.getenv("DATABASE_URL")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True,
                      dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    engine = create_engine(os.getenv("DATABASE_URL"))
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
