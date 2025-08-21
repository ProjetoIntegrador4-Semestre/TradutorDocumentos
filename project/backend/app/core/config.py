from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Auth"
    ENV: str = "dev"

    DATABASE_URL: str = "postgresql+psycopg2://app:app@db:5432/appdb"

    FRONTEND: str = "http://localhost:3000"
    
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    FRONTEND_URL: str = "http://localhost:3000"

    INIT_ADMIN_EMAIL: Optional[str] = None
    INIT_ADMIN_PASSWORD: Optional[str] = None

    CORS_ORIGINS: List[AnyHttpUrl] = []

    OAUTHLIB_INSECURE_TRANSPORT: Optional[int] = 0

    @field_validator("CORS_ORIGINS", mode="before")
    def split_cors(cls, v):
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()