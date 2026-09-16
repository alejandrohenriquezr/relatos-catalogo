/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { createPostgresDatabase } from "../lib/postgres-d1";

interface Env {
  ASSETS?: Fetcher;
  // FastAPI es el único acceso autorizado a PostgreSQL.
  INTERNAL_API_BASE_URL?: string;
  INTERNAL_API_TOKEN?: string;
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
let postgresDatabase: D1Database | null = null;

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
    // La rama institucional no usa D1 ni SQLite. Vinext conserva la interfaz
    // de las rutas existentes, pero todas las consultas pasan por FastAPI.
    const baseUrl = env.INTERNAL_API_BASE_URL ??
      (typeof process !== "undefined" ? process.env.INTERNAL_API_BASE_URL : undefined);
    const token = env.INTERNAL_API_TOKEN ??
      (typeof process !== "undefined" ? process.env.INTERNAL_API_TOKEN : undefined);
    if (baseUrl && token) postgresDatabase ??= createPostgresDatabase(baseUrl, token);
    (globalThis as typeof globalThis & { __SITES_DB?: D1Database }).__SITES_DB =
      postgresDatabase ?? undefined;
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
