"""Modelos ORM persistidos en PostgreSQL."""

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class StatisticalOperation(Base):
    """Catálogo estable de operaciones estadísticas."""

    __tablename__ = "statistical_operations"

    operation: Mapped[str] = mapped_column(String(80), primary_key=True)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    topic: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    config: Mapped["OperationConfig | None"] = relationship(back_populates="operation_ref")


class OperationConfig(Base):
    """Configuración editorial de las pestañas de cada operación."""

    __tablename__ = "operation_configs"

    operation: Mapped[str] = mapped_column(
        String(80), ForeignKey("statistical_operations.operation", ondelete="CASCADE"), primary_key=True
    )
    analysis: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    publications: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    documentation: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    databases: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    resources: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    updated_by: Mapped[str] = mapped_column(String(200), nullable=False, default="seed")

    operation_ref: Mapped[StatisticalOperation] = relationship(back_populates="config")


class SourceCache(Base):
    """Última revisión de una fuente estadística, separada del catálogo editorial."""

    __tablename__ = "source_cache"

    operation: Mapped[str] = mapped_column(String(80), primary_key=True)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    source_last_modified: Mapped[str | None] = mapped_column(String(200))
    source_etag: Mapped[str | None] = mapped_column(String(500))
    source_size: Mapped[int | None] = mapped_column(Integer)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class EconomicSourceCache(Base):
    """Caché principal usada por las rutas estadísticas de Vinext."""

    __tablename__ = "economic_source_cache"

    kind: Mapped[str] = mapped_column(Text, primary_key=True)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    source_last_modified: Mapped[str | None] = mapped_column(Text)
    source_etag: Mapped[str | None] = mapped_column(Text)
    source_size: Mapped[str | None] = mapped_column(Text)
    source_hash: Mapped[str | None] = mapped_column(Text)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    checked_at: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    updated_at: Mapped[str] = mapped_column(Text, nullable=False)


class SourcePayloadChunk(Base):
    """Fragmentos versionados de cargas estadísticas grandes."""

    __tablename__ = "source_payload_chunks"

    kind: Mapped[str] = mapped_column(Text, primary_key=True)
    revision: Mapped[str] = mapped_column(Text, primary_key=True)
    chunk_index: Mapped[int] = mapped_column(Integer, primary_key=True)
    payload_text: Mapped[str] = mapped_column(Text, nullable=False)


class TourismSourceMeta(Base):
    """Metadata y revisión activa de turismo."""

    __tablename__ = "tourism_source_meta_v2"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    source_last_modified: Mapped[str | None] = mapped_column(Text)
    source_etag: Mapped[str | None] = mapped_column(Text)
    source_size: Mapped[str | None] = mapped_column(Text)
    checked_at: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[str] = mapped_column(Text, nullable=False)
    cache_key: Mapped[str] = mapped_column(Text, nullable=False, unique=True)


class TourismPayloadChunk(Base):
    """Hojas transformadas de la revisión activa de turismo."""

    __tablename__ = "tourism_payload_chunk_v2"
    __table_args__ = (Index("ix_tourism_payload_cache_key", "cache_key"),)

    cache_key: Mapped[str] = mapped_column(Text, primary_key=True)
    sheet: Mapped[str] = mapped_column(Text, primary_key=True)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)


class SupermarketsMeta(Base):
    """Metadata y revisión activa de supermercados."""

    __tablename__ = "supermarkets_meta_v1"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    etag: Mapped[str | None] = mapped_column(Text)
    last_modified: Mapped[str | None] = mapped_column(Text)
    size: Mapped[str | None] = mapped_column(Text)
    cache_key: Mapped[str | None] = mapped_column(Text, unique=True)
    checked_at: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[str | None] = mapped_column(Text)


class SupermarketsPayload(Base):
    """Partes transformadas de la revisión activa de supermercados."""

    __tablename__ = "supermarkets_payload_v1"
    __table_args__ = (Index("ix_supermarkets_payload_cache_key", "cache_key"),)

    cache_key: Mapped[str] = mapped_column(Text, primary_key=True)
    part: Mapped[str] = mapped_column(Text, primary_key=True)
    payload: Mapped[str] = mapped_column(Text, nullable=False)


class OperationCacheUpdate(Base):
    """Resumen de fechas usado para ordenar la portada."""

    __tablename__ = "operation_cache_updates"

    operation: Mapped[str] = mapped_column(Text, primary_key=True)
    cache_updated_at: Mapped[str | None] = mapped_column(Text)
    source_last_modified: Mapped[str | None] = mapped_column(Text)
    checked_at: Mapped[str] = mapped_column(Text, nullable=False, index=True)


class CatalogPublication(Base):
    """Caché del catálogo de publicaciones oficiales."""

    __tablename__ = "catalog_publications_v1"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    checked_at: Mapped[str] = mapped_column(Text, nullable=False)


class StatisticalOperationConfig(Base):
    """Configuración editorial compatible con el CMS Vinext."""

    __tablename__ = "statistical_operation_config"

    operation: Mapped[str] = mapped_column(
        String(80),
        ForeignKey("statistical_operations.operation", ondelete="CASCADE"),
        primary_key=True,
    )
    label: Mapped[str] = mapped_column(Text, nullable=False)
    analysis: Mapped[str] = mapped_column(Text, nullable=False, default="on")
    publications: Mapped[str] = mapped_column(Text, nullable=False, default="off")
    documentation: Mapped[str] = mapped_column(Text, nullable=False, default="off")
    databases: Mapped[str] = mapped_column(Text, nullable=False, default="off")
    resources: Mapped[str] = mapped_column(Text, nullable=False, default="off")
    updated_at: Mapped[str] = mapped_column(Text, nullable=False)
    updated_by: Mapped[str] = mapped_column(Text, nullable=False)
