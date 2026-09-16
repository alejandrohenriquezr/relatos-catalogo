"""Importa una caché SQLite histórica a PostgreSQL una sola vez.

Uso dentro del contenedor backend:
    python -m scripts.import_sqlite --sqlite /tmp/cache.sqlite
"""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert

from app.config import get_settings


TABLES = (
    "economic_source_cache",
    "source_payload_chunks",
    "tourism_source_meta_v2",
    "tourism_payload_chunk_v2",
    "supermarkets_meta_v1",
    "supermarkets_payload_v1",
    "operation_cache_updates",
    "catalog_publications_v1",
    "statistical_operation_config",
)


def import_table(source: sqlite3.Connection, target: sa.Connection, table_name: str) -> int:
    """Inserta o actualiza las filas comunes entre ambos esquemas."""

    exists = source.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table_name,)
    ).fetchone()
    if not exists:
        return 0

    metadata = sa.MetaData()
    table = sa.Table(table_name, metadata, autoload_with=target)
    source_columns = {
        row[1] for row in source.execute(f'PRAGMA table_info("{table_name}")').fetchall()
    }
    columns = [column.name for column in table.columns if column.name in source_columns]
    if not columns:
        return 0

    select_columns = ", ".join(f'"{column}"' for column in columns)
    rows = [dict(row) for row in source.execute(f'SELECT {select_columns} FROM "{table_name}"')]
    if not rows:
        return 0

    primary_keys = [column.name for column in table.primary_key.columns]
    update_columns = {
        column: getattr(insert(table).excluded, column)
        for column in columns
        if column not in primary_keys
    }
    statement = insert(table).values(rows)
    if primary_keys and update_columns:
        statement = statement.on_conflict_do_update(
            index_elements=primary_keys,
            set_=update_columns,
        )
    elif primary_keys:
        statement = statement.on_conflict_do_nothing(index_elements=primary_keys)
    target.execute(statement)
    return len(rows)


def main() -> None:
    """Valida el archivo, ejecuta la importación y publica conteos auditables."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sqlite", required=True, type=Path, help="Ruta del cache.sqlite histórico")
    args = parser.parse_args()
    if not args.sqlite.is_file():
        raise SystemExit(f"No existe el archivo: {args.sqlite}")

    source = sqlite3.connect(f"file:{args.sqlite}?mode=ro", uri=True)
    source.row_factory = sqlite3.Row
    engine = sa.create_engine(get_settings().database_url, pool_pre_ping=True)
    try:
        with engine.begin() as target:
            counts = {table: import_table(source, target, table) for table in TABLES}
    finally:
        source.close()
        engine.dispose()

    for table, count in counts.items():
        print(f"{table}: {count} fila(s)")
    print(f"Total importado: {sum(counts.values())} fila(s)")


if __name__ == "__main__":
    main()
