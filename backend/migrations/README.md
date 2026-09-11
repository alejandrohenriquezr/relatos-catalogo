# Migraciones

Las migraciones se ejecutan con Alembic y describen el esquema PostgreSQL del
backend. El contenedor las aplica automáticamente antes de iniciar Uvicorn.

Para generar una nueva migración después de modificar `app/models.py`:

```bash
alembic revision --autogenerate -m "describe el cambio"
alembic upgrade head
```
