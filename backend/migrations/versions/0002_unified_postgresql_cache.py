"""Migra toda la caché Vinext a PostgreSQL.

Revision ID: 0002_unified_postgresql_cache
Revises: 0001_initial_schema
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_unified_postgresql_cache"
down_revision: str | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Crea las tablas que antes residían en SQLite/D1."""

    op.create_table(
        "economic_source_cache",
        sa.Column("kind", sa.Text(), primary_key=True),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("source_last_modified", sa.Text()),
        sa.Column("source_etag", sa.Text()),
        sa.Column("source_size", sa.Text()),
        sa.Column("source_hash", sa.Text()),
        sa.Column("payload_json", sa.Text(), nullable=False),
        sa.Column("checked_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
    )
    op.create_index("ix_economic_source_cache_checked_at", "economic_source_cache", ["checked_at"])

    op.create_table(
        "source_payload_chunks",
        sa.Column("kind", sa.Text(), nullable=False),
        sa.Column("revision", sa.Text(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("payload_text", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("kind", "revision", "chunk_index"),
    )

    op.create_table(
        "tourism_source_meta_v2",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("source_last_modified", sa.Text()),
        sa.Column("source_etag", sa.Text()),
        sa.Column("source_size", sa.Text()),
        sa.Column("checked_at", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.Column("cache_key", sa.Text(), nullable=False, unique=True),
    )
    op.create_table(
        "tourism_payload_chunk_v2",
        sa.Column("cache_key", sa.Text(), nullable=False),
        sa.Column("sheet", sa.Text(), nullable=False),
        sa.Column("payload_json", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("cache_key", "sheet"),
    )
    op.create_index("ix_tourism_payload_cache_key", "tourism_payload_chunk_v2", ["cache_key"])

    op.create_table(
        "supermarkets_meta_v1",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("etag", sa.Text()),
        sa.Column("last_modified", sa.Text()),
        sa.Column("size", sa.Text()),
        sa.Column("cache_key", sa.Text(), unique=True),
        sa.Column("checked_at", sa.Text()),
        sa.Column("updated_at", sa.Text()),
    )
    op.create_table(
        "supermarkets_payload_v1",
        sa.Column("cache_key", sa.Text(), nullable=False),
        sa.Column("part", sa.Text(), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("cache_key", "part"),
    )
    op.create_index("ix_supermarkets_payload_cache_key", "supermarkets_payload_v1", ["cache_key"])

    op.create_table(
        "operation_cache_updates",
        sa.Column("operation", sa.Text(), primary_key=True),
        sa.Column("cache_updated_at", sa.Text()),
        sa.Column("source_last_modified", sa.Text()),
        sa.Column("checked_at", sa.Text(), nullable=False),
    )
    op.create_index("ix_operation_cache_updates_checked_at", "operation_cache_updates", ["checked_at"])

    op.create_table(
        "catalog_publications_v1",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("checked_at", sa.Text(), nullable=False),
    )

    op.create_table(
        "statistical_operation_config",
        sa.Column("operation", sa.String(length=80), nullable=False),
        sa.Column("label", sa.Text(), nullable=False),
        sa.Column("analysis", sa.Text(), nullable=False, server_default="on"),
        sa.Column("publications", sa.Text(), nullable=False, server_default="off"),
        sa.Column("documentation", sa.Text(), nullable=False, server_default="off"),
        sa.Column("databases", sa.Text(), nullable=False, server_default="off"),
        sa.Column("resources", sa.Text(), nullable=False, server_default="off"),
        sa.Column("updated_at", sa.Text(), nullable=False),
        sa.Column("updated_by", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["operation"], ["statistical_operations.operation"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("operation"),
    )


def downgrade() -> None:
    """Retira la caché unificada en orden inverso."""

    op.drop_table("statistical_operation_config")
    op.drop_table("catalog_publications_v1")
    op.drop_index("ix_operation_cache_updates_checked_at", table_name="operation_cache_updates")
    op.drop_table("operation_cache_updates")
    op.drop_index("ix_supermarkets_payload_cache_key", table_name="supermarkets_payload_v1")
    op.drop_table("supermarkets_payload_v1")
    op.drop_table("supermarkets_meta_v1")
    op.drop_index("ix_tourism_payload_cache_key", table_name="tourism_payload_chunk_v2")
    op.drop_table("tourism_payload_chunk_v2")
    op.drop_table("tourism_source_meta_v2")
    op.drop_table("source_payload_chunks")
    op.drop_index("ix_economic_source_cache_checked_at", table_name="economic_source_cache")
    op.drop_table("economic_source_cache")
