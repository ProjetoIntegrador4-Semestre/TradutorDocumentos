from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Translation API"
    DEFAULT_TARGET_LANG: str = "en"  # inglês como padrão

settings = Settings()
