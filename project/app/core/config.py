from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "sua-chave-secreta-aqui"  # Gere uma chave segura (ex.: openssl rand -hex 32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "postgresql+asyncpg://postgres:senha123@localhost:5432/auth_login_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()