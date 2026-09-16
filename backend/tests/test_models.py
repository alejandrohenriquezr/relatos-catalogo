"""Pruebas de cobertura del esquema ORM institucional."""

from app.database import Base
from app import models  # noqa: F401: registra todos los modelos en Base.metadata
from app.config import Settings
from pydantic import ValidationError
import pytest


def test_metadata_contains_all_persistent_tables() -> None:
    """Evita que Alembic autogenerado interprete tablas vigentes como obsoletas."""

    expected = {
        "statistical_operations",
        "operation_configs",
        "source_cache",
        "economic_source_cache",
        "source_payload_chunks",
        "tourism_source_meta_v2",
        "tourism_payload_chunk_v2",
        "supermarkets_meta_v1",
        "supermarkets_payload_v1",
        "operation_cache_updates",
        "catalog_publications_v1",
        "statistical_operation_config",
    }
    assert expected == set(Base.metadata.tables)


def test_production_rejects_the_example_internal_token() -> None:
    """Evita desplegar la credencial de desarrollo en infraestructura INE."""

    with pytest.raises(ValidationError):
        Settings(environment="production", internal_api_token="change-this-in-production")
