# Migración Python + PostgreSQL y Docker

Esta rama (`version_python`) agrega una implementación paralela del backend.
El despliegue actual de Sites permanece en `main`, con su Worker, D1 y flujo de
caché sin cambios.

## Arquitectura local

```text
navegador :3000 → frontend (Node/Vinext) ─┐
                                          ├─ relatos_net
API REST  :8000 ← backend (FastAPI) ──────┘
                                          │
                         db (PostgreSQL 16)
                         volumen postgres_data
```

El frontend conserva el runtime Node porque el proyecto actual utiliza
renderizado del servidor y rutas propias. El nuevo backend es independiente y
usa PostgreSQL como persistencia. En el entorno local, el backend se conecta a
PostgreSQL mediante el nombre de servicio `db`, nunca mediante `localhost`.

## Requisitos en Windows

1. Instalar Docker Desktop para Windows con el backend WSL 2 habilitado.
2. Instalar Git.
3. Clonar el repositorio y cambiar a `version_python`.
4. Copiar `.env.example` a `.env` y cambiar `POSTGRES_PASSWORD` por una clave
   local segura. No subir `.env` al repositorio.

Desde PowerShell, ubicado en la raíz del proyecto:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

La primera ejecución descarga las imágenes, crea el volumen de PostgreSQL,
aplica las migraciones de Alembic y ejecuta la carga inicial del catálogo. Las
siguientes ejecuciones reutilizan el volumen y la carga es idempotente.

Abrir:

- Frontend: <http://localhost:3000>
- Documentación interactiva de FastAPI: <http://localhost:8000/docs>
- Esquema OpenAPI: <http://localhost:8000/openapi.json>
- Estado del backend: <http://localhost:8000/health>

Para detener los contenedores sin borrar los datos:

```powershell
docker compose down
```

Para detenerlos y eliminar también la base local, acción destructiva que no es
necesaria para el uso habitual:

```powershell
docker compose down -v
```

## Variables de entorno

`.env.example` contiene valores de desarrollo y documenta todas las variables:

| Variable | Uso | Valor de ejemplo |
| --- | --- | --- |
| `POSTGRES_DB` | Base creada por la imagen PostgreSQL | `relatos` |
| `POSTGRES_USER` | Usuario de PostgreSQL | `relatos` |
| `POSTGRES_PASSWORD` | Clave de PostgreSQL | cambiar localmente |
| `POSTGRES_PORT` | Puerto publicado en Windows | `5432` |
| `BACKEND_PORT` | Puerto publicado para FastAPI | `8000` |
| `FRONTEND_PORT` | Puerto publicado para Vinext | `3000` |
| `DATABASE_URL` | URL SQLAlchemy/psycopg | `...@db:5432/relatos` |
| `CORS_ORIGINS` | Orígenes permitidos por FastAPI | `http://localhost:3000` |
| `RUN_SEED` | Activa la carga inicial al arrancar | `true` |

Si los puertos están ocupados, cambiar `POSTGRES_PORT`, `BACKEND_PORT` o
`FRONTEND_PORT` en `.env`. La URL interna de `DATABASE_URL` debe conservar el
host `db` aunque el puerto publicado cambie.

## Backend y persistencia

- `backend/app/main.py`: aplicación FastAPI y endpoints REST.
- `backend/app/models.py`: modelos ORM SQLAlchemy.
- `backend/app/database.py`: motor y sesiones PostgreSQL.
- `backend/migrations/versions/0001_initial_schema.py`: migración inicial
  versionada.
- `backend/app/seed.py`: carga opcional e idempotente del catálogo.
- `backend/entrypoint.sh`: ejecuta `alembic upgrade head`, el seed opcional y
  Uvicorn.

Después de cambiar modelos ORM dentro del contenedor:

```powershell
docker compose run --rm backend alembic revision --autogenerate -m "describe el cambio"
docker compose up --build
```

## Endpoints principales

| Método | Endpoint | Función |
| --- | --- | --- |
| `GET` | `/health` | Comprueba disponibilidad del proceso |
| `GET` | `/api/v1/catalog` | Catálogo activo con configuración editorial |
| `GET` | `/api/v1/catalog?topic=Precios` | Filtra operaciones por materia |
| `GET` | `/api/v1/operations/{operation}` | Consulta una operación por identificador |
| `GET` | `/api/v1/cache/{operation}` | Consulta metadatos de caché persistidos |
| `GET` | `/docs` | Swagger UI generado por FastAPI |

Los endpoints nuevos no reemplazan todavía las rutas Next/Vinext existentes.
La integración progresiva del frontend puede usar
`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1` sin alterar el sitio
publicado.

## Separación respecto de Sites

No se modifica `.openai/hosting.json`, la rama `main`, el Worker ni las
migraciones D1. Esta rama contiene exclusivamente el backend Python, la
configuración Docker, la migración PostgreSQL y su documentación. Para volver
al código publicado en Sites:

```powershell
git switch main
```
