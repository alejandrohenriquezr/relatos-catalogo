#!/bin/sh
set -eu

# Las migraciones son idempotentes y preparan el esquema antes de exponer la API.
alembic upgrade head

# La carga inicial es opcional. RUN_SEED=false permite iniciar una base vacía.
if [ "${RUN_SEED:-true}" = "true" ]; then
  python -m app.seed
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
