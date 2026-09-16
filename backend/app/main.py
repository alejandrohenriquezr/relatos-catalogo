"""Aplicación FastAPI y acceso único a PostgreSQL."""

import hmac

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session, joinedload

from .config import get_settings
from .database_gateway import (
    DatabaseRequest,
    DatabaseResponse,
    execute_database_request,
)
from .database import get_db
from .models import SourceCache, StatisticalOperation
from .schemas import CacheResponse, OperationResponse

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="API REST migrada desde las rutas de datos de Relatos Estadísticos.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["sistema"])
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    """Comprueba el proceso de la API y su conexión a PostgreSQL."""

    db.execute(text("SELECT 1"))
    return {"status": "ok", "service": "relatos-estadisticos-backend", "database": "postgresql"}


@app.post(
    f"{settings.api_prefix}/internal/database",
    response_model=DatabaseResponse,
    include_in_schema=False,
)
def internal_database(
    request: DatabaseRequest,
    x_internal_token: str = Header(default=""),
    db: Session = Depends(get_db),
) -> DatabaseResponse:
    """Ejecuta consultas estáticas de Vinext sin exponer PostgreSQL al navegador."""

    if not hmac.compare_digest(x_internal_token, settings.internal_api_token):
        raise HTTPException(status_code=401, detail="Credencial interna inválida.")
    return execute_database_request(request, db)


@app.get(f"{settings.api_prefix}/catalog", response_model=list[OperationResponse], tags=["catálogo"])
def catalog(
    topic: str | None = Query(default=None, description="Filtra por materia estadística"),
    db: Session = Depends(get_db),
) -> list[StatisticalOperation]:
    """Devuelve el catálogo de operaciones y su configuración editorial."""

    statement = (
        select(StatisticalOperation)
        .options(joinedload(StatisticalOperation.config))
        .where(StatisticalOperation.is_active.is_(True))
        .order_by(StatisticalOperation.topic, StatisticalOperation.label)
    )
    if topic:
        statement = statement.where(StatisticalOperation.topic == topic)
    return list(db.scalars(statement).unique().all())


@app.get(f"{settings.api_prefix}/operations/{{operation}}", response_model=OperationResponse, tags=["catálogo"])
def operation(operation: str, db: Session = Depends(get_db)) -> StatisticalOperation:
    """Obtiene una operación por su identificador estable."""

    statement = (
        select(StatisticalOperation)
        .options(joinedload(StatisticalOperation.config))
        .where(StatisticalOperation.operation == operation)
    )
    result = db.scalars(statement).unique().first()
    if result is None:
        raise HTTPException(status_code=404, detail="Operación no encontrada")
    return result


@app.get(f"{settings.api_prefix}/cache/{{operation}}", response_model=CacheResponse, tags=["caché"])
def cache_metadata(operation: str, db: Session = Depends(get_db)) -> SourceCache:
    """Devuelve metadatos de caché persistidos para una operación."""

    result = db.get(SourceCache, operation)
    if result is None:
        raise HTTPException(status_code=404, detail="No existe caché para la operación")
    return result
