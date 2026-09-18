"""Application configuration settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    """Configuration settings for HotelWork backend."""
    APP_NAME: str = "HotelWork"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./hotelwork.db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    TAX_RATE: float = 0.19
    DEFAULT_DISCOUNT_RATE: float = 0.0
    CORS_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8')

    @property
    def cors_origins_list(self) -> list[str]:
        """Returns CORS origins as a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

@lru_cache
def get_settings() -> Settings:
    """Gets the application settings."""
    return Settings()
