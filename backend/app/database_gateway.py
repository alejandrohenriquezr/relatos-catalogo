"""Puerta interna y acotada para las consultas de caché del frontend."""

from __future__ import annotations

import re
from typing import Any, Literal

from fastapi import HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session


ALLOWED_TABLES = {
    "catalog_publications_v1",
    "economic_source_cache",
    "operation_cache_updates",
    "source_payload_chunks",
    "statistical_operation_config",
    "supermarkets_meta_v1",
    "supermarkets_payload_v1",
    "tourism_payload_chunk_v2",
    "tourism_source_meta_v2",
}
ALLOWED_PREFIXES = ("SELECT", "INSERT", "UPDATE", "DELETE")
READ_TABLE_REFERENCE = re.compile(
    r"\b(?:FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)",
    re.IGNORECASE,
)
WRITE_TABLE_REFERENCE = {
    "INSERT": re.compile(r"^INSERT\s+INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)", re.IGNORECASE),
    "UPDATE": re.compile(r"^UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)", re.IGNORECASE),
    "DELETE": re.compile(r"^DELETE\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)", re.IGNORECASE),
}


class DatabaseRequest(BaseModel):
    """Consulta preparada emitida por una ruta interna de Vinext."""

    sql: str = Field(min_length=1, max_length=20_000)
    params: list[Any] = Field(default_factory=list, max_length=100)
    mode: Literal["run", "first", "all"]


class DatabaseResponse(BaseModel):
    """Resultado mínimo compatible con la interfaz D1 usada por Vinext."""

    results: list[dict[str, Any]] = Field(default_factory=list)
    changes: int = 0


def _replace_placeholders(sql: str, count: int) -> tuple[str, dict[str, Any]]:
    """Convierte los signos `?` de D1 en parámetros nombrados de SQLAlchemy."""

    output: list[str] = []
    index = 0
    quote: str | None = None
    position = 0
    while position < len(sql):
        character = sql[position]
        if quote:
            output.append(character)
            if character == quote:
                # SQL escapa comillas duplicándolas.
                if position + 1 < len(sql) and sql[position + 1] == quote:
                    output.append(sql[position + 1])
                    position += 1
                else:
                    quote = None
        elif character in {"'", '"'}:
            quote = character
            output.append(character)
        elif character == "?":
            output.append(f":p{index}")
            index += 1
        else:
            output.append(character)
        position += 1

    if index != count:
        raise HTTPException(
            status_code=400,
            detail=f"La consulta declara {index} parámetros y recibió {count}.",
        )
    return "".join(output), {f"p{i}": None for i in range(count)}


def prepare_statement(sql: str, params: list[Any]) -> tuple[str, dict[str, Any]]:
    """Valida una sentencia estática y prepara sus parámetros."""

    normalized = sql.strip()
    if ";" in normalized or "--" in normalized or "/*" in normalized:
        raise HTTPException(status_code=400, detail="La consulta contiene sintaxis no permitida.")
    prefix = normalized.split(maxsplit=1)[0].upper()
    if prefix not in ALLOWED_PREFIXES:
        raise HTTPException(status_code=400, detail="Solo se permiten SELECT, INSERT, UPDATE y DELETE.")

    # Las lecturas pueden incluir UNION o JOIN y, por tanto, varias tablas. En
    # las escrituras se valida exclusivamente el destino inicial. Esto evita
    # interpretar el `DO UPDATE SET` de un UPSERT como una tabla llamada `set`.
    if prefix == "SELECT":
        referenced = {match.lower() for match in READ_TABLE_REFERENCE.findall(normalized)}
    else:
        match = WRITE_TABLE_REFERENCE[prefix].match(normalized)
        referenced = {match.group(1).lower()} if match else set()
    if not referenced or not referenced.issubset(ALLOWED_TABLES):
        raise HTTPException(status_code=400, detail="La consulta referencia una tabla no autorizada.")

    converted, bindings = _replace_placeholders(normalized, len(params))
    bindings.update({f"p{i}": value for i, value in enumerate(params)})
    return converted, bindings


def execute_database_request(request: DatabaseRequest, db: Session) -> DatabaseResponse:
    """Ejecuta una consulta validada dentro de una transacción PostgreSQL."""

    sql, bindings = prepare_statement(request.sql, request.params)
    result = db.execute(text(sql), bindings)
    if request.mode == "run":
        db.commit()
        return DatabaseResponse(changes=max(result.rowcount or 0, 0))

    if request.mode == "first":
        row = result.mappings().first()
        return DatabaseResponse(results=[dict(row)] if row else [])

    return DatabaseResponse(results=[dict(row) for row in result.mappings().all()])
