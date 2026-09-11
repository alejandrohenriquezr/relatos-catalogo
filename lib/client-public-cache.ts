const PREFIX = "relatos-public-cache:";

// Recupera de forma síncrona la última copia compartida que este navegador
// recibió desde D1. Así la recarga no vuelve al JSON antiguo del despliegue.
export function readPublicCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(PREFIX + key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

// Conserva localmente la respuesta de la caché pública. Si el navegador no
// dispone de espacio, la aplicación continúa usando la copia incorporada.
export function writePublicCache(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    // Las series regionales de la ENE pueden superar la cuota habitual de
    // localStorage. El primer período y los gráficos nacionales caben sin ese
    // bloque; la serie regional completa se recupera inmediatamente desde D1.
    // Antes se intentaba guardar el objeto completo, fallaba silenciosamente y
    // cada recarga volvía a la copia antigua incluida en el despliegue.
    const persistedValue =
      key === "ene" && value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value as Record<string, unknown>).filter(
              ([property]) => property !== "regionalSeries",
            ),
          )
        : value;
    window.localStorage.setItem(PREFIX + key, JSON.stringify(persistedValue));
  } catch {
    /* La caché pública del servidor sigue siendo la fuente principal. */
  }
}
