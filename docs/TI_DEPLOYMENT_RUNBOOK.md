# Manual de despliegue para T.I.

## Objetivo

Este documento describe la instalación institucional de la rama
`version_postgresql`. El sistema se entrega como cuatro servicios Docker:

| Servicio | Función | Persistencia |
| --- | --- | --- |
| `frontend` | Vinext, interfaz y transformadores estadísticos | Sin estado |
| `backend` | FastAPI, control de acceso y acceso único a PostgreSQL | Sin estado |
| `db` | PostgreSQL 16 | Volumen `postgres_data` |
| `cache-refresh` | Revisión programada de fuentes | Sin estado |

## Requisitos mínimos de plataforma

- Docker Engine 26 o Docker Desktop vigente.
- Docker Compose v2.
- Git.
- Resolución DNS y salida HTTPS hacia `www.ine.gob.cl`.
- Un nombre DNS y proxy inverso TLS para producción.
- Almacenamiento persistente con respaldo para PostgreSQL.

Las necesidades definitivas de CPU, memoria y disco deben medirse con carga
representativa. Como punto de partida de validación: 4 CPU, 8 GB de RAM y 20 GB
de almacenamiento persistente, sin considerarlo dimensionamiento definitivo.

## Variables obligatorias

Copie `.env.example` como `.env` y reemplace al menos:

- `POSTGRES_PASSWORD`: contraseña aleatoria exclusiva del entorno.
- `INTERNAL_API_TOKEN`: secreto aleatorio de al menos 32 bytes.
- `CORS_ORIGINS`: origen HTTPS real del sitio.
- `ENVIRONMENT=production`: activa las validaciones de secretos de producción.
- puertos publicados, si la plataforma lo requiere.

Generación de secretos en PowerShell:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

El archivo `.env` no debe incorporarse a Git, imágenes, tickets ni registros.
En producción se recomienda usar el gestor de secretos institucional.

## Instalación inicial

```powershell
git clone --branch version_postgresql --single-branch https://github.com/alejandrohenriquezr/relatos-catalogo.git
Set-Location relatos-catalogo
Copy-Item .env.example .env
notepad .env
docker compose config
docker compose build --pull
docker compose up -d
docker compose ps
```

La primera inicialización ejecuta las migraciones Alembic y la carga idempotente
del catálogo. No use `docker compose down -v` en un entorno con datos.

## Validación posterior

```powershell
docker compose ps
docker compose logs --since 10m backend
docker compose logs --since 10m frontend
docker compose logs --since 10m cache-refresh
docker compose exec backend alembic current
```

Comprobaciones HTTP:

- `GET http://localhost:3000/`
- `GET http://localhost:3000/api/catalog-latest`
- `GET http://localhost:3000/api/enusc-data`
- `GET http://localhost:8000/health`
- `GET http://localhost:8000/docs`

`/health` debe informar `database: postgresql`. La base debe mostrar la revisión
`0002_unified_postgresql_cache` o una posterior.

## Actualización programada

`cache-refresh` ejecuta una revisión al iniciar. De lunes a viernes vuelve a
ejecutarla a los minutos 01, 06, 11, …, 56 entre las 08:01 y las 09:56, y a las
10:01, usando `America/Santiago`.

Monitoreo en tiempo real:

```powershell
docker compose logs -f --timestamps cache-refresh
```

Ejecución manual controlada:

```powershell
docker compose exec cache-refresh node scripts/refresh-public-cache.mjs
```

Un error de una fuente no elimina la última revisión válida. Deben generarse
alertas cuando se repitan mensajes `ERROR`, `stale`, `Inicio incompleto` o
`Bloque ... incompleto`.

## Actualización de versión

```powershell
git fetch origin
git switch version_postgresql
git pull --ff-only origin version_postgresql
docker compose build --pull
docker compose up -d
docker compose ps
docker compose exec backend alembic current
```

Antes de actualizar producción, T.I. debe respaldar PostgreSQL y validar la
versión en un ambiente de aceptación con una copia anonimizada o controlada.

## Rollback

1. No revertir migraciones automáticamente si contienen datos nuevos.
2. Restaurar las imágenes o el commit anterior.
3. Si el esquema cambió de forma incompatible, restaurar el respaldo tomado
   antes del despliegue.
4. Confirmar el home, las rutas estadísticas y el estado del actualizador.

Ejemplo de retorno de código sin alterar el volumen:

```powershell
git switch --detach <commit-anterior-validado>
docker compose build
docker compose up -d
```

## Respaldo

T.I. debe definir:

- respaldo lógico diario y respaldo físico según RPO/RTO institucional;
- cifrado en tránsito y reposo;
- retención y eliminación segura;
- restauración de prueba periódica;
- monitoreo de crecimiento y espacio libre;
- custodia separada de credenciales y respaldos.

El procedimiento técnico básico está en
[`POSTGRESQL_DATABASE.md`](POSTGRESQL_DATABASE.md).

## Red y seguridad

- Publicar solo el proxy HTTPS hacia el frontend.
- Restringir `db:5432` a la red interna de contenedores.
- Restringir FastAPI a frontend, monitoreo y administración autorizada.
- No exponer el endpoint interno `/api/v1/internal/database` en el proxy.
- Rotar `INTERNAL_API_TOKEN` y credenciales PostgreSQL mediante reinicio
  coordinado.
- Ejecutar imágenes sin privilegios adicionales y aplicar actualizaciones de
  seguridad periódicas.
- Centralizar registros sin incluir payloads estadísticos completos ni secretos.

## Observabilidad

Métricas mínimas recomendadas:

- disponibilidad y latencia del frontend y FastAPI;
- conexiones activas y bloqueadas de PostgreSQL;
- tamaño de base, tablas y volumen;
- duración y resultado de cada actualización;
- fecha `checked_at` máxima por operación;
- antigüedad de `updated_at`;
- reinicios y consumo de recursos de cada contenedor.

## Criterios de aceptación

- Los cuatro servicios aparecen saludables o en ejecución estable.
- Alembic está en `head`.
- No existe `cache.sqlite`, `LOCAL_D1_PATH` ni volumen `frontend_cache`.
- El home y las páginas de las operaciones responden con la última caché válida.
- ENUSC carga su análisis y fragmentos desde PostgreSQL.
- La ejecución manual del actualizador completa las trece fuentes o deja
  errores identificables sin borrar las cachés anteriores.
- Reiniciar o recrear contenedores conserva la información.
- El respaldo se restaura correctamente en un entorno de prueba.
- Las credenciales predeterminadas fueron reemplazadas.

## Responsables sugeridos

| Área | Responsabilidad |
| --- | --- |
| T.I. infraestructura | Docker, red, TLS, secretos, respaldos y monitoreo |
| Administración PostgreSQL | migraciones, rendimiento, recuperación y accesos |
| Equipo estadístico | validación de fuentes, períodos, indicadores y resultados |
| Desarrollo | código, pruebas, corrección de transformadores y versiones |
