"""Esquema inicial para PostgreSQL.

Revision ID: 0001_initial_schema
Revises:
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Crea el catálogo, la configuración editorial y la caché de fuentes."""

    op.create_table(
        "statistical_operations",
        sa.Column("operation", sa.String(length=80), nullable=False),
        sa.Column("label", sa.String(length=200), nullable=False),
        sa.Column("topic", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("operation"),
    )
    op.create_index("ix_statistical_operations_topic", "statistical_operations", ["topic"])
    op.create_table(
        "operation_configs",
        sa.Column("operation", sa.String(length=80), nullable=False),
        sa.Column("analysis", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("publications", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("documentation", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("databases", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("resources", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_by", sa.String(length=200), nullable=False, server_default="seed"),
        sa.ForeignKeyConstraint(["operation"], ["statistical_operations.operation"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("operation"),
    )
    op.create_table(
        "source_cache",
        sa.Column("operation", sa.String(length=80), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("source_last_modified", sa.String(length=200), nullable=True),
        sa.Column("source_etag", sa.String(length=500), nullable=True),
        sa.Column("source_size", sa.Integer(), nullable=True),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("checked_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("operation"),
    )


def downgrade() -> None:
    """Elimina el esquema inicial en orden inverso."""

    op.drop_table("source_cache")
    op.drop_table("operation_configs")
    op.drop_index("ix_statistical_operations_topic", table_name="statistical_operations")
    op.drop_table("statistical_operations")
