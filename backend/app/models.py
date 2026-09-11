"""Modelos ORM persistidos en PostgreSQL."""

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
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
