"""Configuración centralizada leída desde variables de entorno."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Valores de ejecución compartidos por la API y los scripts de mantenimiento."""

    database_url: str = (
        "postgresql+psycopg://relatos:relatos_dev_change_me@db:5432/relatos"
    )
    cors_origins: str = "http://localhost:3000"
    api_prefix: str = "/api/v1"
    app_name: str = "Relatos Estadísticos API"
    run_seed: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def cors_origin_list(self) -> list[str]:
        """Convierte CORS_ORIGINS separado por comas en una lista utilizable."""

        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Mantiene una única instancia de configuración por proceso."""

    return Settings()
