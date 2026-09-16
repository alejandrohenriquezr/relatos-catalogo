# Relatos Estadísticos

Sitio del Instituto Nacional de Estadísticas de Chile para consultar resultados estadísticos, navegar por materias y operaciones, revisar análisis, descargar datos y consumir servicios SDMX.

La rama `version_python` conserva el frontend React/Vinext y agrega un entorno local reproducible con FastAPI, PostgreSQL y Docker Compose. El sitio publicado en Sites utiliza Cloudflare Workers y D1; el entorno Docker es independiente y no modifica automáticamente el despliegue productivo.

## Funcionalidades

- Catálogo temático de operaciones estadísticas.
- Visualizaciones de mercado laboral, precios, demografía, condiciones de vida, actividad económica y servicios.
- Caché pública con respuesta inmediata y verificación posterior de fuentes oficiales.
- CMS por operación en `/admin`.
- API SDMX y endpoint MCP para consulta estructurada.
- Módulo de Demografía de empresas basado en resultados experimentales del RUE 2025.
- Entorno local Docker con frontend, API FastAPI y PostgreSQL.

## Arquitectura resumida

| Superficie | Tecnología | Persistencia |
| --- | --- | --- |
| Sitio en Sites | React 19, TypeScript, Vinext, Cloudflare Worker | D1 |
| Entorno local | Vinext en `:3000`, FastAPI en `:8000` | PostgreSQL 16 |
| Datos iniciales | JSON, XLSX y activos versionados en `public/` | Repositorio |
| Actualización | Rutas API y scripts de verificación | Caché vigente |

La descripción detallada está en [ARCHITECTURE.md](ARCHITECTURE.md).

## Requisitos

### Docker, recomendado para `version_python`

- Git.
- Docker Desktop con Docker Compose.
- En Windows, WSL 2 habilitado.

### Ejecución directa del frontend

- Node.js 22.13.0 o posterior.
- npm compatible con el archivo `package-lock.json`.

## Instalación local con Docker

Desde PowerShell:

```powershell
git clone https://github.com/alejandrohenriquezr/relatos-catalogo.git
Set-Location relatos-catalogo
git switch version_python
Copy-Item .env.example .env
docker compose up --build
```

Servicios disponibles:

- Frontend: <http://localhost:3000>
- API FastAPI: <http://localhost:8000>
- Swagger UI: <http://localhost:8000/docs>
- Estado del backend: <http://localhost:8000/health>

Para detener sin borrar datos:

```powershell
docker compose down
```

El comando `docker compose down -v` elimina la base PostgreSQL y la caché local; debe usarse solo cuando se quiera reiniciar los datos.

## Ejecución directa del frontend

```bash
npm ci
npm run dev
```

Comandos de control:

```bash
npm run build
npm test
npm run lint
npm run validate:artifact
```

El análisis estático conserva observaciones heredadas registradas en [TECHNICAL_DEBT.md](TECHNICAL_DEBT.md). La compilación y las pruebas son los controles obligatorios.

## Organización del repositorio

| Ruta | Contenido |
| --- | --- |
| `app/` | Páginas React, componentes y rutas API de Vinext |
| `lib/` | Transformadores, modelos y lógica de dominio |
| `public/` | Activos, datos iniciales y archivos descargables |
| `worker/` | Entrada del Cloudflare Worker |
| `db/`, `drizzle/` | Esquema y migraciones D1 |
| `backend/` | API FastAPI, SQLAlchemy, Alembic y carga inicial |
| `scripts/` | Extracción, actualización de caché y validaciones |
| `tests/` | Pruebas de caché, SDMX, MCP y HTML |
| `docs/` | Migración Docker y contratos SDMX |

## Caché y actualización de fuentes

Las rutas consultan primero la última revisión válida. Después verifican la fuente oficial mediante hash y, cuando están disponibles, ETag, `Last-Modified` o tamaño. Una revisión nueva se publica solo después de transformar y validar los datos. Si la fuente no responde o cambia de estructura, se conserva la revisión anterior.

El workflow de GitHub Actions usa el secreto `SITES_BYPASS_TOKEN` para actualizar el sitio restringido. El contenedor frontend ejecuta el mismo proceso contra `http://127.0.0.1:3000` y guarda la caché local en un volumen.

## API SDMX

Rutas principales:

```text
GET /api/sdmx/catalog
GET /api/sdmx/metadata?dataset=DEMOGRAFIA_EMPRESAS
GET /api/sdmx/data/DEMOGRAFIA_EMPRESAS/CL....?format=sdmx-json
GET /api/sdmx/documentation
```

Ejemplos locales:

```bash
curl http://localhost:3000/api/sdmx/catalog
curl "http://localhost:3000/api/sdmx/metadata?dataset=DEMOGRAFIA_EMPRESAS"
curl "http://localhost:3000/api/sdmx/data/DEMOGRAFIA_EMPRESAS/CL....?format=sdmx-json"
```

Los contratos están documentados en [docs/sdmx/README.md](docs/sdmx/README.md) y [docs/sdmx/DEMOGRAFIA_EMPRESAS.md](docs/sdmx/DEMOGRAFIA_EMPRESAS.md).

## Configuración y secretos

Copiar `.env.example` como `.env` y cambiar la contraseña de PostgreSQL. No se deben versionar `.env`, tokens, cookies, credenciales ni exportaciones de las bases productivas.

El archivo `.openai/hosting.json` identifica el proyecto Sites y la vinculación lógica D1 `DB`. Modificar el repositorio no publica el sitio por sí mismo.

## Documentación

- [Arquitectura](ARCHITECTURE.md)
- [Base SQLite de caché local](docs/SQLITE_CACHE.md)
- [Migración Python, PostgreSQL y Docker](docs/MIGRACION_PYTHON_DOCKER.md)
- [Fuentes y transformaciones](DATA_SOURCES.md)
- [Gobierno de datos](DATA_GOVERNANCE.md)
- [Despliegue y recuperación](DEPLOYMENT.md)
- [Contribución](CONTRIBUTING.md)
- [Seguridad](SECURITY.md)
- [Deuda técnica](TECHNICAL_DEBT.md)
