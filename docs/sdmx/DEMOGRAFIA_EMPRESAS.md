# SDMX — Demografía de empresas

## Propósito

Este dataflow publica los resultados de demografía empresarial elaborados a partir del Registro Estadístico de Empresas (RUE). La fuente de actualización son los archivos Excel oficiales utilizados por el relato estadístico y publicados en `datos_OE/cuadros_estadisticos`.

## Identificación

| Campo | Valor |
|---|---|
| Agencia | `INE.GOB.CL` |
| Dataflow | `DF_DEMOGRAFIA_EMPRESAS` |
| Versión | `1.0` |
| Área de referencia | `CL` |
| Formato | SDMX-CSV |
| Periodicidad inicial | Anual |

## Dimensiones propuestas

| Dimensión | Código | Descripción |
|---|---|---|
| Área de referencia | `REF_AREA` | Chile o unidad territorial publicada |
| Actividad económica | `ACTIVITY` | Sección, división, grupo, clase o subclase CIIU, según el cuadro |
| Tamaño según ventas | `SIZE_SALES` | Categoría de tamaño definida por tramo de ventas |
| Tamaño según trabajadores | `SIZE_WORKERS` | Categoría de tamaño definida por cantidad de trabajadores dependientes |
| Indicador | `INDICATOR` | Empresas activas, nacimientos, muertes, supervivencia, tasas u otro indicador publicado |
| Tiempo | `TIME_PERIOD` | Año de referencia |

La dimensión `SIZE_SALES` se usará cuando el Excel desagregue por tamaño según ventas. La dimensión `SIZE_WORKERS` se usará cuando el Excel desagregue por cantidad de trabajadores. No se deben mezclar ambas dimensiones en una misma observación: la dimensión no utilizada debe quedar vacía o identificada como no aplicable según la convención SDMX que se adopte.

## Medida de observación

| Campo | Descripción |
|---|---|
| `OBS_VALUE` | Valor numérico del indicador |
| `UNIT_MEASURE` | Empresas, porcentaje, tasa o trabajadores, según el indicador |
| `OBS_STATUS` | Estado de la observación, si corresponde |

## Archivos fuente iniciales

Los archivos fuente esperados son los publicados en `datos_OE/cuadros_estadisticos`, entre ellos:

- `evolucion_empresas_activas.xlsx`
- `empresas_2025_por_region.xlsx`
- `empresas_2025_por_ciiu_seccion.xlsx`
- `empresas_2025_por_tamano_trabaj.xlsx`
- `empresas_2025_por_tamano_ventas.xlsx`
- `nacimientos_muertes_por_anio.xlsx`
- `tasas_nacimientos_muertes.xlsx`
- `supervivencia_empresas_por_coho.xlsx`

La transformación debe conservar el nombre del archivo fuente, la fecha de sincronización, el hash y la versión del dataflow utilizado para generarla.

## API propuesta

```text
GET /api/sdmx/data/INE.GOB.CL,DF_DEMOGRAFIA_EMPRESAS,1.0/all
GET /api/sdmx/metadata?dataset=DEMOGRAFIA_EMPRESAS
GET /api/sdmx/documentation?dataset=DEMOGRAFIA_EMPRESAS
```

## Reglas de actualización

1. Descargar los Excel oficiales desde `ine.gob.cl`.
2. Calcular el hash de cada archivo.
3. Comparar los hashes con la caché pública.
4. Transformar únicamente los archivos modificados.
5. Validar dimensiones, períodos, valores y duplicados.
6. Publicar una nueva versión del dataflow solo si la validación es exitosa.
