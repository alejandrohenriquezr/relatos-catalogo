# Guía de contribución

## Rama de trabajo

La rama `version_postgresql` contiene la entrega institucional con Docker, FastAPI y PostgreSQL. Antes de modificarla:

```bash
git switch version_postgresql
git pull --ff-only origin version_postgresql
```

Crear una rama breve para cada cambio y abrir un pull request hacia `version_postgresql`. Las modificaciones de tablas requieren migración Alembic, actualización del diccionario y prueba de actualización sobre una base existente.

## Flujo recomendado

1. Mantener cambios pequeños y trazables.
2. Actualizar pruebas y documentación junto con el código.
3. Ejecutar compilación y pruebas.
4. Revisar que no existan secretos o datos personales.
5. Abrir un pull request con objetivo, alcance y evidencia.
6. Solicitar revisión técnica y, cuando corresponda, metodológica.
7. Fusionar solo después de aprobar los controles.

## Controles

Frontend:

```bash
npm ci
npm run build
npm test
npm run lint
```

Entorno Docker:

```bash
docker compose build
docker compose up -d
docker compose ps
```

Verificar `http://localhost:3000`, `http://localhost:8000/health` y `http://localhost:8000/docs`.

## Convenciones

- TypeScript para la aplicación y Python para el backend y extractores.
- Comentarios que expliquen cada bloque cuya intención no sea evidente.
- Variables que indiquen concepto, unidad y nivel de desagregación.
- Fórmulas estadísticas centralizadas en módulos de dominio.
- URLs oficiales junto al transformador responsable.
- Migraciones versionadas para cada cambio de esquema.
- Documentación y mensajes dirigidos a usuarios en español.

## Criterios de aceptación

- La aplicación responde desde caché antes de verificar fuentes externas.
- Períodos, unidades, notas y desagregaciones coinciden con la publicación oficial.
- Las visualizaciones funcionan en escritorio y dispositivos móviles.
- La construcción y las pruebas terminan correctamente.
- Las migraciones son reproducibles y la carga inicial es idempotente.
- No se incorporan credenciales, microdatos ni información personal.
