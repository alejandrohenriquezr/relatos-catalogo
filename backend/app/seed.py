"""Carga inicial idempotente para el catálogo de operaciones."""

from sqlalchemy import select

from .catalog import CATALOG
from .database import SessionLocal
from .models import OperationConfig, StatisticalOperation


def seed_catalog() -> int:
    """Inserta las operaciones ausentes y devuelve cuántas agregó."""

    inserted = 0
    with SessionLocal.begin() as db:
        for item in CATALOG:
            operation = db.scalar(
                select(StatisticalOperation).where(
                    StatisticalOperation.operation == item["operation"]
                )
            )
            if operation is None:
                operation = StatisticalOperation(**item)
                db.add(operation)
                db.flush()
                db.add(OperationConfig(operation=operation.operation))
                inserted += 1
    return inserted


if __name__ == "__main__":
    print(f"Operaciones insertadas: {seed_catalog()}")
