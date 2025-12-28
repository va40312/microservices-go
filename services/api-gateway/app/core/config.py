from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import HttpUrl

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    api_v1_prefix: str = "/api/v1"

    api_username: str = "admin"
    api_password: str = "admin"

    analyzer_url: HttpUrl
    internal_api_key: str

    redis_url: str

settings = Settings()