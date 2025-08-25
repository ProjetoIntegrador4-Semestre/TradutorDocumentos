from pydantic_settings import BaseSettings

DATABASE_URL = "sqlite:///./data.db"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Translation API"
    DEFAULT_TARGET_LANG: str = "en"  # inglês como padrão

settings = Settings()
