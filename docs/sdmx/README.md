# Documentación SDMX de Relatos Estadísticos

Este directorio contiene las propuestas de estructura SDMX para las operaciones estadísticas del sitio. Las fuentes son los archivos Excel oficiales utilizados por cada relato estadístico y publicados por el INE.

## Convención común

Las estructuras usan como base `REF_AREA`, `INDICATOR`, `TIME_PERIOD` y `OBS_VALUE`. Cada operación puede agregar dimensiones específicas según sus desagregaciones oficiales. Las dimensiones y códigos definitivos deben validarse contra los metadatos metodológicos antes de declarar una versión productiva.

## Operaciones documentadas en el API

El catálogo completo está disponible en:

```text
GET /api/sdmx/catalog
```

La documentación específica de cada operación está disponible mediante:

```text
GET /api/sdmx/documentation?dataset=CODIGO_OPERACION
```

La propuesta detallada de Demografía de empresas está en `DEMOGRAFIA_EMPRESAS.md`.

## Criterio de sincronización

Cada transformación debe registrar archivo fuente, URL, fecha de descarga, hash, versión del dataflow, número de observaciones y resultado de las validaciones. La caché pública debe actualizarse solo cuando cambie el hash y la validación termine correctamente.
