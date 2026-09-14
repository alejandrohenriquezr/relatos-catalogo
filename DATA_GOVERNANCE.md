# Gobierno de datos

## Responsabilidades

| Rol | Responsabilidad |
| --- | --- |
| Dueño del producto | Priorizar alcance y aprobar versiones |
| Dueño del dato | Aprobar fuente, definición, unidad y calidad |
| Equipo metodológico | Validar cálculos, notas e interpretación |
| Equipo editorial | Revisar texto, jerarquía y lenguaje claro |
| Equipo técnico | Mantener transformadores, pruebas, caché y despliegue |
| DMIE | Definir y revisar metadatos |
| TI y seguridad | Homologar infraestructura, acceso y continuidad |

## Trazabilidad mínima

Cada serie debe conservar:

- operación y producto estadístico;
- URL y archivo oficial;
- hoja, rango o variables utilizadas;
- unidad de medida y cobertura;
- fórmula o regla de transformación;
- fecha y firma de verificación;
- versión del transformador;
- período de la revisión publicada.

## Controles por operación

1. Validar estructura, tipos, rangos y completitud.
2. Comparar el último período con la publicación oficial.
3. Comprobar coherencia temporal y unidades.
4. Registrar advertencias sin reemplazar una caché válida.
5. Mantener pruebas de regresión para transformaciones críticas.
6. Documentar correcciones y mecanismo de reversión.

## Persistencia

D1 almacena la caché y configuración del sitio Sites. PostgreSQL almacena el catálogo y metadatos del backend local. La caché SQLite del contenedor frontend acelera la carga local. Ninguna de estas bases sustituye a las fuentes estadísticas oficiales.

## Gestión de cambios

- Las modificaciones ingresan mediante ramas y revisión.
- Los cambios de fuente, fórmula o esquema deben actualizar pruebas y documentación.
- Una ruptura de estructura debe impedir la sustitución de la última revisión válida.
- Cada publicación debe quedar asociada a un commit identificable.

## Confidencialidad

El alcance actual usa información agregada y pública. Incorporar microdatos o tablas con riesgo de identificación requiere una evaluación previa de confidencialidad y control de divulgación estadística.
