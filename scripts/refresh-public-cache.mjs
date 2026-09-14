/**
 * Actualiza las cachés compartidas de todas las operaciones con fuente remota.
 * El mismo programa se ejecuta una vez desde GitHub Actions y como daemon
 * dentro del frontend Docker para mantener sincronizado localhost.
 */

const OPERATIONS = [
  { name: "ENE", path: "/api/ene-data?refresh=1" },
  { name: "Informalidad", path: "/api/informality-data?refresh=1" },
  { name: "IPC", path: "/api/ipc-data?refresh=1" },
  { name: "IPP", path: "/api/ipp-data?refresh=1" },
  { name: "Estadísticas vitales", path: "/api/vital-data?refresh=1" },
  { name: "ENUSC", path: "/api/enusc-data?refresh=1" },
  { name: "Estadísticas policiales", path: "/api/police-data?refresh=1" },
  { name: "Energía", path: "/api/economic-data?kind=energy&refresh=1" },
  { name: "Industria", path: "/api/economic-data?kind=industry&refresh=1" },
  { name: "Permisos de edificación", path: "/api/economic-data?kind=permits&refresh=1" },
  { name: "Comercio", path: "/api/economic-data?kind=commerce&refresh=1" },
  { name: "Turismo", path: "/api/tourism-data?refresh=1" },
  { name: "Supermercados", path: "/api/supermarkets-data?refresh=1" },
];

const args = new Set(process.argv.slice(2));
const baseUrl = (process.env.CACHE_REFRESH_BASE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");
const bypassToken = process.env.SITES_BYPASS_TOKEN?.trim();
const timeZone = process.env.CACHE_REFRESH_TIMEZONE || "America/Santiago";
const batchSize = Math.max(1, Number(process.env.CACHE_REFRESH_BATCH_SIZE || 3));
const timeoutMs = Math.max(10_000, Number(process.env.CACHE_REFRESH_TIMEOUT_MS || 90_000));
const retryCount = Math.max(1, Number(process.env.CACHE_REFRESH_RETRIES || 2));

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** Construye encabezados sin registrar nunca el token de acceso. */
function requestHeaders() {
  const headers = {
    accept: "application/json",
    "user-agent": "INE-Relatos-Cache-Warmer/1.0",
  };
  if (bypassToken) headers["OAI-Sites-Authorization"] = `Bearer ${bypassToken}`;
  return headers;
}

/** Extrae el estado de caché pese a las pequeñas diferencias entre APIs. */
function cacheStatus(payload) {
  return payload?.cache?.status || payload?.source?.cache || "ok";
}

/** Actualiza una operación con reintentos acotados y respuesta JSON validada. */
async function refreshOperation(operation) {
  const url = new URL(operation.path, `${baseUrl}/`);
  let lastError;

  for (let attempt = 1; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: requestHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error("la respuesta no es JSON");
      }
      if (payload?.error) throw new Error(String(payload.error));

      const status = cacheStatus(payload);
      if (status === "stale") throw new Error("la fuente oficial no pudo verificarse; se conservó la caché anterior");

      return { name: operation.name, status };
    } catch (error) {
      lastError = error;
      if (attempt < retryCount) await sleep(3_000 * attempt);
    }
  }

  throw new Error(`${operation.name}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

/** Procesa lotes pequeños para no saturar ine.gob.cl ni el runtime del sitio. */
async function refreshAll() {
  const startedAt = new Date().toISOString();
  const failures = [];
  console.log(`[cache] Inicio ${startedAt}; destino ${baseUrl}; ${OPERATIONS.length} fuentes.`);

  for (let offset = 0; offset < OPERATIONS.length; offset += batchSize) {
    const batch = OPERATIONS.slice(offset, offset + batchSize);
    const results = await Promise.allSettled(batch.map(refreshOperation));

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`[cache] OK ${result.value.name}: ${result.value.status}`);
      } else {
        const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
        failures.push(message);
        console.error(`[cache] ERROR ${message}`);
      }
    });
  }

  if (failures.length) throw new Error(`${failures.length} operación(es) no pudieron actualizarse.`);
  console.log(`[cache] Fin ${new Date().toISOString()}.`);
}

/** Devuelve hora y minuto de Chile sin depender de la zona horaria del host. */
function chileClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

/** Limita el daemon local a 08:00–09:10 y una ejecución por bloque de 5 minutos. */
function scheduledSlot(date = new Date()) {
  const clock = chileClock(date);
  const hour = Number(clock.hour);
  const minute = Number(clock.minute);
  const insideWindow = hour === 8 || (hour === 9 && minute <= 10);
  if (!insideWindow || minute % 5 !== 0) return null;
  return `${clock.year}-${clock.month}-${clock.day}T${clock.hour}:${clock.minute}`;
}

/** Espera a que Vinext responda antes de la primera actualización local. */
async function waitForFrontend() {
  const healthUrl = new URL("/build-version.json", `${baseUrl}/`);
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(5_000) });
      if (response.ok) return;
    } catch {
      // El servidor todavía está iniciando; el siguiente intento es suficiente.
    }
    await sleep(5_000);
  }
  throw new Error(`El frontend no respondió en ${healthUrl.origin}.`);
}

/** Mantiene la caché local: una carga al iniciar y luego el horario solicitado. */
async function runDaemon() {
  await waitForFrontend();
  if (process.env.CACHE_REFRESH_ON_START !== "false") {
    await refreshAll().catch((error) => console.error(`[cache] Inicio incompleto: ${error.message}`));
  }

  let lastSlot = "";
  for (;;) {
    const slot = scheduledSlot();
    if (slot && slot !== lastSlot) {
      lastSlot = slot;
      await refreshAll().catch((error) => console.error(`[cache] Bloque ${slot} incompleto: ${error.message}`));
    }
    await sleep(30_000);
  }
}

if (args.has("--daemon")) {
  await runDaemon();
} else {
  await refreshAll();
}
