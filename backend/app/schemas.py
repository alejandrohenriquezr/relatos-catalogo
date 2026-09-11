"""Esquemas Pydantic de la API pública."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class OperationConfigResponse(BaseModel):
    """Configuración editorial serializable."""

    model_config = ConfigDict(from_attributes=True)

    analysis: bool
    publications: bool
    documentation: bool
    databases: bool
    resources: bool


class OperationResponse(BaseModel):
    """Operación del catálogo con su configuración editorial."""

    model_config = ConfigDict(from_attributes=True)

    operation: str
    label: str
    topic: str
    description: str | None
    is_active: bool
    config: OperationConfigResponse | None = None


class CacheResponse(BaseModel):
    """Metadatos de caché sin exponer el payload completo por defecto."""

    model_config = ConfigDict(from_attributes=True)

    operation: str
    source_url: str
    source_last_modified: str | None
    source_etag: str | None
    source_size: int | None
    checked_at: datetime
    updated_at: datetime
    payload: dict[str, Any] | None = None
