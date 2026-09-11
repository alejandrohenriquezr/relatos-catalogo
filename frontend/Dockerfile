# El frontend conserva el runtime Node de Vinext porque el proyecto actual
# incluye renderizado del servidor y rutas API; Nginx no puede reemplazarlo.
FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# Normaliza scripts Bash que pueden llegar con CRLF desde un clon Windows.
RUN sed -i 's/\r$//' \
    scripts/build-verified.sh \
    scripts/sites-env.sh \
    scripts/validate-artifact.sh \
    backend/entrypoint.sh \
    && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
