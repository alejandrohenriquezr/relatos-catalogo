# Despliegue, operación y recuperación

## Separación de entornos

| Entorno | Activación | Efecto |
| --- | --- | --- |
| GitHub | Commit o push | Actualiza el código versionado |
| Docker local | `docker compose up --build` | Actualiza `localhost:3000` y servicios locales |
| Docker institucional | Construir y recrear servicios | Actualiza la instalación INE |

Un push a `version_postgresql` no modifica automáticamente una instalación que ya está ejecutándose.

## Operación local

```powershell
git switch version_postgresql
git pull --ff-only origin version_postgresql
Copy-Item .env.example .env
docker compose up --build
```

Comprobaciones:

```powershell
docker compose ps
Invoke-WebRequest http://localhost:3000
Invoke-WebRequest http://localhost:8000/health
```

Para detener sin borrar datos:

```powershell
docker compose down
```

## Validaciones del frontend

```bash
npm ci
npm run build
npm test
npm run lint
```

La compilación debe generar `dist/server/index.js`. Las migraciones PostgreSQL se validan y ejecutan con Alembic desde el contenedor backend.

## Despliegue institucional

El despliegue debe usar Docker Compose o la adaptación equivalente aprobada por T.I. FastAPI es la única capa de acceso a PostgreSQL y el endpoint interno no debe publicarse mediante el proxy inverso. Consulte [docs/TI_DEPLOYMENT_RUNBOOK.md](docs/TI_DEPLOYMENT_RUNBOOK.md).

## Recuperación

1. Identificar el último commit y despliegue válidos.
2. Restaurar el código en una rama de recuperación.
3. Ejecutar compilación y pruebas.
4. Reconstruir y recrear los contenedores con la versión validada.
5. Comprobar páginas principales y rutas API.
6. Registrar causa, alcance y corrección.

El repositorio contiene esquemas, migraciones y datos iniciales, pero no exportaciones ni volúmenes PostgreSQL.
