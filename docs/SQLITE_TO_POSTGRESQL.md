# Importación única desde SQLite

Este procedimiento solo se necesita cuando se desea conservar una caché
producida anteriormente por `version_python`. Una instalación nueva puede
omitirlo: el actualizador volverá a obtener las fuentes oficiales.

## Requisitos

- Los servicios PostgreSQL y backend deben estar saludables.
- Alembic debe encontrarse en `head`.
- Se debe conservar una copia del `cache.sqlite` original.
- La importación debe ejecutarse antes de abrir el sitio a usuarios.

## Procedimiento

Desde PowerShell, en la raíz del repositorio:

```powershell
docker compose ps
docker compose exec backend alembic current
docker compose cp "C:\ruta\cache.sqlite" backend:/tmp/cache.sqlite
docker compose exec backend python -m scripts.import_sqlite --sqlite /tmp/cache.sqlite
```

El importador procesa las nueve tablas conocidas y realiza `upsert` por sus
claves primarias. Puede ejecutarse nuevamente sobre la misma base: actualiza las
filas existentes sin duplicarlas.

## Verificación

```powershell
docker compose exec db psql -U relatos -d relatos -c "SELECT kind, checked_at, updated_at FROM economic_source_cache ORDER BY kind;"
docker compose exec db psql -U relatos -d relatos -c "SELECT COUNT(*) FROM source_payload_chunks;"
docker compose exec db psql -U relatos -d relatos -c "SELECT COUNT(*) FROM tourism_payload_chunk_v2;"
docker compose exec db psql -U relatos -d relatos -c "SELECT COUNT(*) FROM supermarkets_payload_v1;"
```

Después de verificar los conteos, elimine la copia temporal:

```powershell
docker compose exec backend rm /tmp/cache.sqlite
```

El archivo original debe conservarse según las reglas de respaldo definidas
por T.I. hasta aceptar formalmente la migración.
