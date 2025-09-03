from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str

    # Compatibilidade para quem acessa em MAIÚSCULO:
    @property
    def DATABASE_URL(self): return self.database_url
    @property
    def SECRET_KEY(self): return self.secret_key
    @property
    def ALGORITHM(self): return self.algorithm
    @property
    def ACCESS_TOKEN_EXPIRE_MINUTES(self): return self.access_token_expire_minutes
    @property
    def GOOGLE_CLIENT_ID(self): return self.google_client_id
    @property
    def GOOGLE_CLIENT_SECRET(self): return self.google_client_secret
    @property
    def GOOGLE_REDIRECT_URI(self): return self.google_redirect_uri

    model_config = SettingsConfigDict(case_sensitive=False)

settings = Settings()
