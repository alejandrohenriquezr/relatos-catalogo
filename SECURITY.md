# Seguridad

## Comunicación de vulnerabilidades

Las vulnerabilidades no deben publicarse en incidencias abiertas. Deben informarse directamente al responsable institucional del proyecto, con pasos de reproducción y alcance conocido.

## Reglas

- No versionar tokens, contraseñas, cookies, claves privadas ni archivos `.env`.
- No subir exportaciones de D1, volúmenes PostgreSQL ni bases SQLite locales.
- No incorporar microdatos o identificadores personales.
- Cambiar la contraseña de ejemplo antes de usar el entorno fuera del equipo local.
- Limitar CORS a los orígenes necesarios.
- Mantener dependencias fijadas mediante archivos de bloqueo.
- Revisar resultados de CI y alertas de dependencias.
- Rotar inmediatamente cualquier credencial expuesta.

## Secretos de automatización

`SITES_BYPASS_TOKEN` debe almacenarse como secreto de GitHub Actions. Solo se envía en el encabezado de autorización y no debe aparecer en registros, archivos o documentación con su valor real.

## Bases de datos

D1 y PostgreSQL deben recibir privilegios mínimos. Las copias de respaldo y archivos de diagnóstico deben tratarse como información interna aunque contengan datos agregados.

## Cambios de alcance

Incorporar autenticación, cargas de archivos, conectores externos o datos no públicos requiere una evaluación de amenazas, autorización y controles adicionales antes del desarrollo.
