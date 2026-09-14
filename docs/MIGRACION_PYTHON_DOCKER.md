# Migración a Python, PostgreSQL y Docker

La rama `version_python` agrega un backend FastAPI y una base PostgreSQL para el desarrollo local. El frontend React/Vinext se conserva. Esta rama no reemplaza ni publica automáticamente el sitio de Sites.

## Servicios

| Servicio | Puerto | Función | Persistencia |
| --- | --- | --- | --- |
| `frontend` | 3000 | Interfaz Vinext y rutas actuales | Volumen `frontend_cache` |
| `backend` | 8000 | API REST FastAPI | PostgreSQL |
| `db` | 5432 | PostgreSQL 16 | Volumen `postgres_data` |

## Inicio en Windows

Requisitos: Git, Docker Desktop y WSL 2.

```powershell
git clone https://github.com/alejandrohenriquezr/relatos-catalogo.git
Set-Location relatos-catalogo
git switch version_python
Copy-Item .env.example .env
docker compose up --build
```

Cambiar `POSTGRES_PASSWORD` en `.env` antes de usar el entorno fuera del desarrollo local. El archivo `.env` no debe subirse.

Abrir:

- <http://localhost:3000>
- <http://localhost:8000/docs>
- <http://localhost:8000/openapi.json>
- <http://localhost:8000/health>

## Variables

| Variable | Uso | Valor de desarrollo |
| --- | --- | --- |
| `POSTGRES_DB` | Nombre de la base | `relatos` |
| `POSTGRES_USER` | Usuario | `relatos` |
| `POSTGRES_PASSWORD` | Contraseña | Cambiar localmente |
| `POSTGRES_PORT` | Puerto publicado de PostgreSQL | `5432` |
| `BACKEND_PORT` | Puerto publicado de FastAPI | `8000` |
| `FRONTEND_PORT` | Puerto publicado del frontend | `3000` |
| `DATABASE_URL` | Conexión SQLAlchemy | Host interno `db` |
| `CORS_ORIGINS` | Orígenes autorizados | `http://localhost:3000` |
| `RUN_SEED` | Ejecuta carga inicial idempotente | `true` |

Aunque cambie el puerto publicado, `DATABASE_URL` debe conservar el host `db` y el puerto interno 5432.

## Ciclo de vida

```powershell
docker compose up --build
docker compose ps
docker compose logs -f backend
docker compose down
```

`docker compose down` conserva los volúmenes. `docker compose down -v` elimina PostgreSQL y la caché local.

## Migraciones

El arranque del backend ejecuta `alembic upgrade head` y luego la carga inicial cuando `RUN_SEED=true`.

Después de modificar modelos:

```powershell
docker compose run --rm backend alembic revision --autogenerate -m "describe el cambio"
docker compose up --build
```

## Endpoints del backend

| Método | Endpoint | Función |
| --- | --- | --- |
| `GET` | `/health` | Estado del proceso |
| `GET` | `/api/v1/catalog` | Catálogo activo |
| `GET` | `/api/v1/catalog?topic=Precios` | Filtro por materia |
| `GET` | `/api/v1/operations/{operation}` | Operación por identificador |
| `GET` | `/api/v1/cache/{operation}` | Metadatos de caché |
| `GET` | `/docs` | Swagger UI |

La integración con FastAPI es progresiva. Las rutas Vinext existentes continúan disponibles mientras no exista equivalencia verificada en el backend.

## Sincronización con GitHub

```powershell
git switch version_python
git pull --ff-only origin version_python
docker compose up --build
```

Este flujo actualiza el repositorio y reconstruye los contenedores. No despliega Sites.
