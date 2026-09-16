# Migraciones

Las migraciones se ejecutan con Alembic y describen el esquema PostgreSQL del
backend. El contenedor las aplica automáticamente antes de iniciar Uvicorn.
Alembic es el único mecanismo autorizado para crear o modificar tablas en
`version_postgresql`; las rutas Vinext no ejecutan DDL.

Para generar una nueva migración después de modificar `app/models.py`:

```bash
alembic revision --autogenerate -m "describe el cambio"
alembic upgrade head
```
