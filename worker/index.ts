/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { createLocalD1 } from "../lib/local-d1";

interface Env {
  // Cloudflare supplies these bindings in Sites. Vinext's local Node server
  // does not inject them, so they are optional for Docker development.
  ASSETS?: Fetcher;
  DB?: D1Database;
  // Ruta del archivo SQLite que persiste la caché compartida en Docker.
  LOCAL_D1_PATH?: string;
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Vinext's production Node server invokes the Worker handler without a
// Cloudflare environment or execution context. These fallbacks keep public
// pages renderable locally while real Sites deployments continue to provide
// their bindings.
let localDatabasePromise: Promise<D1Database> | null = null;

const localExecutionContext: ExecutionContext = {
  waitUntil: () => undefined,
  passThroughOnException: () => undefined,
};

function withNoIndexHeaders(response: Response): Response {
  // El encabezado protege también recursos no HTML y rutas que no procesan metadatos.
  const protectedResponse = new Response(response.body, response);
  protectedResponse.headers.set(
    "X-Robots-Tag",
    "noindex, nofollow, noarchive, nosnippet, noimageindex",
  );
  return protectedResponse;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(
    request: Request,
    env: Env = {},
    ctx: ExecutionContext = localExecutionContext,
  ): Promise<Response> {
    // Sites usa D1; Docker crea un adaptador SQLite persistente con la misma
    // interfaz para que todas las rutas sigan actualizando la caché local.
    let database = env.DB;
    // Vinext en Node puede invocar el Worker sin pasar un objeto env; en ese
    // caso recupera la misma configuración desde las variables del proceso.
    const localPath = env.LOCAL_D1_PATH ??
      (typeof process !== "undefined" ? process.env.LOCAL_D1_PATH : undefined);
    if (!database && localPath) {
      try {
        // Reutiliza una conexión por isolate para evitar bloqueos y fugas de
        // descriptores cuando el Home dispara varias actualizaciones en paralelo.
        localDatabasePromise ??= createLocalD1(localPath);
        database = await localDatabasePromise;
      } catch {
        // Si el runtime no incluye node:sqlite, las rutas usarán su fallback.
        localDatabasePromise = null;
        database = undefined;
      }
    }
    (globalThis as typeof globalThis & { __SITES_DB?: D1Database }).__SITES_DB = database;
    const url = new URL(request.url);

    // Normaliza barras duplicadas para que enlaces copiados como "//api/..."
    // lleguen a la misma ruta que su versión canónica.
    const normalizedPath = url.pathname.replace(/\/{2,}/g, "/");
    if (normalizedPath !== url.pathname) {
      url.pathname = normalizedPath;
      request = new Request(url, request);
    }

    if (url.pathname === "/_vinext/image") {
      // Image optimization requires Cloudflare-only bindings. Return a clear
      // local response instead of throwing when Vinext runs in Node.
      const assets = env.ASSETS;
      const images = env.IMAGES;
      if (!assets || !images) {
        return new Response("Image optimization is unavailable in local Docker runtime.", {
          status: 503,
        });
      }
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const response = await handleImageOptimization(request, {
        fetchAsset: (path) => assets.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await images.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return withNoIndexHeaders(response);
    }

    const response = await handler.fetch(request, env, ctx);
    return withNoIndexHeaders(response);
  },
};

export default worker;
