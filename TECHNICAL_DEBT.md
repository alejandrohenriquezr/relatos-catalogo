# Deuda técnica registrada

## Estado conocido

La aplicación cuenta con compilación y pruebas funcionales. El análisis estático mantiene observaciones heredadas:

- actualizaciones sincrónicas de estado dentro de algunos efectos React;
- acceso a referencias durante el renderizado;
- tipos `any` en rutas y transformadores específicos;
- dependencias faltantes en hooks y directivas no utilizadas;
- compatibilidad temporal con la interfaz D1 dentro de las rutas Vinext, resuelta por un adaptador HTTP hacia FastAPI/PostgreSQL;
- rutas Vinext y FastAPI que todavía no tienen equivalencia completa.

Por esta razón, lint puede ser informativo mientras compilación y pruebas siguen siendo obligatorias.

## Prioridades

1. Corregir tipos explícitos de rutas API y transformadores.
2. Refactorizar hooks sin cambiar animaciones ni selectores.
3. Sustituir estados derivados por cálculos declarativos cuando corresponda.
4. Definir contratos compartidos entre Vinext y FastAPI.
5. Agregar pruebas de integración para PostgreSQL y migraciones Alembic.
6. Convertir lint nuevamente en control bloqueante.

## Regla de trabajo

Cada corrección debe incluir una prueba de regresión y realizarse en un cambio separado de nuevas funcionalidades. La actualización de documentación no debe modificar archivos ejecutables ni desplegar contenedores por sí sola.
