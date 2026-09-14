# Despliegue, operación y recuperación

## Separación de entornos

| Entorno | Activación | Efecto |
| --- | --- | --- |
| GitHub | Commit o push | Actualiza el código versionado |
| Docker local | `docker compose up --build` | Actualiza `localhost:3000` y servicios locales |
| Sites | Guardar y publicar una versión | Actualiza el sitio productivo |

Un push a `version_python` no despliega automáticamente Sites ni modifica un contenedor local que ya está ejecutándose.

## Operación local

```powershell
git switch version_python
git pull --ff-only origin version_python
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

La compilación debe generar `dist/server/index.js` y `dist/.openai/hosting.json`. Cuando existan migraciones D1, deben incluirse en `dist/.openai/drizzle/`.

## Publicación en Sites

El proyecto se identifica mediante `.openai/hosting.json` y usa la vinculación D1 `DB`. La publicación debe partir de un commit verificado y una versión guardada. La configuración, los datos D1 y el acceso existente deben conservarse salvo instrucción expresa.

## Recuperación

1. Identificar el último commit y despliegue válidos.
2. Restaurar el código en una rama de recuperación.
3. Ejecutar compilación y pruebas.
4. Guardar y publicar una nueva versión.
5. Comprobar páginas principales y rutas API.
6. Registrar causa, alcance y corrección.

El repositorio contiene esquemas, migraciones y datos iniciales, pero no una exportación de D1 productiva ni del volumen PostgreSQL local.
