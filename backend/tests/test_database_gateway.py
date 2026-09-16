"""Pruebas de seguridad y compatibilidad del gateway PostgreSQL."""

import pytest
from fastapi import HTTPException

from app.database_gateway import prepare_statement


def test_converts_d1_placeholders_without_touching_quoted_text() -> None:
    """Convierte parámetros posicionales y conserva signos dentro de literales."""

    sql, bindings = prepare_statement(
        "SELECT * FROM economic_source_cache WHERE kind = ? AND payload_json <> '?'",
        ["ene"],
    )
    assert "kind = :p0" in sql
    assert "payload_json <> '?'" in sql
    assert bindings == {"p0": "ene"}


def test_rejects_unlisted_tables() -> None:
    """Impide usar el endpoint interno para consultar otras tablas."""

    with pytest.raises(HTTPException) as error:
        prepare_statement("SELECT * FROM pg_catalog.pg_user", [])
    assert error.value.status_code == 400


def test_rejects_multiple_statements_and_ddl() -> None:
    """Bloquea DDL, comentarios y concatenación de sentencias."""

    for sql in (
        "DROP TABLE economic_source_cache",
        "SELECT * FROM economic_source_cache; DELETE FROM economic_source_cache",
        "SELECT * FROM economic_source_cache -- comentario",
    ):
        with pytest.raises(HTTPException):
            prepare_statement(sql, [])


def test_accepts_union_across_cache_tables() -> None:
    """Permite la consulta fija usada para construir la portada."""

    sql, bindings = prepare_statement(
        "SELECT kind FROM economic_source_cache UNION ALL "
        "SELECT id FROM tourism_source_meta_v2 UNION ALL "
        "SELECT id FROM supermarkets_meta_v1",
        [],
    )
    assert "UNION ALL" in sql
    assert bindings == {}


def test_accepts_postgresql_upsert_on_an_allowed_cache_table() -> None:
    """No confunde `DO UPDATE SET` con una referencia a otra tabla."""

    sql, bindings = prepare_statement(
        "INSERT INTO economic_source_cache (kind, payload_json) VALUES (?, ?) "
        "ON CONFLICT(kind) DO UPDATE SET payload_json=excluded.payload_json",
        ["ene", "{}"],
    )
    assert "VALUES (:p0, :p1)" in sql
    assert bindings == {"p0": "ene", "p1": "{}"}
