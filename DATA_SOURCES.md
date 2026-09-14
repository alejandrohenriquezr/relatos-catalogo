# Fuentes, transformaciones y actualización

## Principio de trazabilidad

Toda cifra debe poder relacionarse con su operación, URL oficial, archivo, hoja o variables, unidad, fórmula, fecha de verificación y versión del transformador.

## Familias de fuentes

| Materia | Productos | Implementación principal |
| --- | --- | --- |
| Mercado laboral | ENE e informalidad | `app/api/ene-data`, `app/api/informality-data`, `lib/*ene*`, `lib/*informality*` |
| Precios | IPC e IPP | `app/api/ipc-*`, `app/api/ipp-data`, `lib/ipc-*`, `lib/ipp-*` |
| Demografía | Nacimientos, fecundidad, defunciones, mortalidad, matrimonios y AUC | `app/api/vital-data`, `lib/vital-statistics-data.ts` |
| Condiciones de vida | ENUSC y estadísticas policiales | `app/api/enusc-data`, `app/api/police-data` |
| Actividad económica | Industria, energía, permisos y comercio | `app/api/economic-data`, `lib/economic-data.ts` |
| Servicios | Turismo y supermercados | `app/api/tourism-data`, `app/api/supermarkets-data` |
| Estadísticas experimentales | Demografía de empresas | Activos en `public/datos_OE/` y rutas SDMX |

Las URLs se mantienen junto al transformador responsable para reducir divergencias entre documentación y código.

## Proceso de actualización

1. Leer la última revisión válida.
2. Consultar la firma disponible de la fuente.
3. Descargar solo cuando la firma cambie.
4. Transformar y validar.
5. Guardar datos y metadatos como una nueva revisión.
6. Conservar la revisión anterior si falla cualquier control.

Los scripts de `scripts/` reconstruyen datos iniciales y ejecutan verificaciones programadas. El workflow de GitHub Actions y el daemon Docker usan el mismo conjunto de operaciones.

## Indicadores derivados

Según la operación, se calculan variaciones mensuales, en doce meses y acumuladas, incidencias, tasas, proporciones, índices desestacionalizados, tendencia-ciclo y agregaciones territoriales o de productos.

## Archivos iniciales

Los archivos de `public/` permiten una primera respuesta estable. Deben actualizarse con los scripts versionados y revisarse antes del commit. No se deben editar manualmente sin conservar el procedimiento reproducible.
