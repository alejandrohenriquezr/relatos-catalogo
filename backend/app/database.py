"""Conexión SQLAlchemy a PostgreSQL."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    """Clase base de los modelos ORM."""


settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    """Entrega una sesión por solicitud y garantiza su cierre."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
