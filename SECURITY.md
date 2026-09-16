# Seguridad

## Comunicación de vulnerabilidades

Las vulnerabilidades no deben publicarse en incidencias abiertas. Deben informarse directamente al responsable institucional del proyecto, con pasos de reproducción y alcance conocido.

## Reglas

- No versionar tokens, contraseñas, cookies, claves privadas ni archivos `.env`.
- No subir exportaciones ni volúmenes PostgreSQL.
- No incorporar microdatos o identificadores personales.
- Cambiar la contraseña de ejemplo antes de usar el entorno fuera del equipo local.
- Limitar CORS a los orígenes necesarios.
- Mantener dependencias fijadas mediante archivos de bloqueo.
- Revisar resultados de CI y alertas de dependencias.
- Rotar inmediatamente cualquier credencial expuesta.

## Secretos de automatización

`INTERNAL_API_TOKEN` debe almacenarse en el gestor de secretos institucional. Solo se envía entre Vinext y FastAPI y no debe aparecer en registros, archivos o documentación con su valor real. El endpoint `/api/v1/internal/database` no debe exponerse en el proxy público.

## Bases de datos

PostgreSQL debe recibir privilegios mínimos. Las copias de respaldo y archivos de diagnóstico deben tratarse como información interna aunque contengan datos agregados.

## Cambios de alcance

Incorporar autenticación, cargas de archivos, conectores externos o datos no públicos requiere una evaluación de amenazas, autorización y controles adicionales antes del desarrollo.
