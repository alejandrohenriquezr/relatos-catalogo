# Versión institucional Python, PostgreSQL y Docker

La rama `version_postgresql` conserva React/Vinext y usa FastAPI como único acceso a PostgreSQL. SQLite y D1 no forman parte de esta versión.

## Servicios

| Servicio | Puerto | Función | Persistencia |
| --- | --- | --- | --- |
| `frontend` | 3000 | Interfaz Vinext y transformadores | Sin estado |
| `backend` | 8000 | API REST FastAPI | PostgreSQL |
| `db` | 5432 | PostgreSQL 16 | Volumen `postgres_data` |
| `cache-refresh` | interno | Revisión programada | Sin estado |

## Inicio en Windows

Requisitos: Git, Docker Desktop y WSL 2.

```powershell
git clone --branch version_postgresql --single-branch https://github.com/alejandrohenriquezr/relatos-catalogo.git
Set-Location relatos-catalogo
Copy-Item .env.example .env
docker compose up --build -d
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
| `ENVIRONMENT` | Perfil y validación de secretos | `development` local; `production` en INE |
| `INTERNAL_API_TOKEN` | Autentica Vinext ante FastAPI | Debe reemplazarse |

Aunque cambie el puerto publicado, `DATABASE_URL` debe conservar el host `db` y el puerto interno 5432.

## Ciclo de vida

```powershell
docker compose up --build
docker compose ps
docker compose logs -f backend
docker compose down
```

`docker compose down` conserva PostgreSQL. `docker compose down -v` elimina la base completa.

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

Las rutas Vinext conservan sus contratos, pero toda persistencia pasa por el gateway interno autenticado de FastAPI. El gateway solo admite consultas preparadas sobre una lista cerrada de tablas.

## Sincronización con GitHub

```powershell
git switch version_postgresql
git pull --ff-only origin version_postgresql
docker compose up --build
```

Este flujo actualiza el repositorio institucional y reconstruye los contenedores.
