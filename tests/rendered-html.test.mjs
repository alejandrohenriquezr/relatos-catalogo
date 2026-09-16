import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;
const robotsMeta =
  /<meta(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*noindex[^"']*nofollow[^"']*["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(
    response.headers.get("x-robots-tag") ?? "",
    /\bnoindex\b.*\bnofollow\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, robotsMeta);
});

test("blocks crawler access through robots.txt", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("robots-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/robots.txt"),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(await response.text(), /User-Agent:\s*\*\s*Disallow:\s*\//i);
});

test("catalog home embeds only principal charts and limits stories to four", async () => {
  // Esta prueba evita que el Home vuelva a usar la página completa dentro de
  // los iframes y mantiene sincronizado el contador mediante stories.length.
  const source = await readFile(new URL("../app/CatalogHome.tsx", import.meta.url), "utf8");
  assert.match(source, /`\/chart\/\$\{operation\}\?embed=1&v=20260914-3`/);
  assert.match(source, /latest\.slice\(1, 5\)/);
  assert.match(source, /\{stories\.length\} historias/);
  assert.match(source, /className="catalog-overview"/);
  assert.match(source, /catalog-overview[\s\S]*<aside[\s\S]*catalog-feature/);
  const styles = await readFile(new URL("../app/catalog.css", import.meta.url), "utf8");
  assert.match(styles, /\.catalog-content\{display:block;max-width:1600px/);
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /HOME_MAX_X_LABELS = 7/);
  assert.match(page, /\.principal-chart-document \.ipp-time-levels\{display:none!important\}/);
});

test("business demography document is complete UTF-8 HTML", async () => {
  // El tamaño y los marcadores protegen contra la copia truncada/binaria que
  // anteriormente aparecía como símbolos extraños en el navegador.
  const document = await readFile(
    new URL("../public/demografia-empresas/index.html", import.meta.url),
    "utf8",
  );
  // El documento optimizado actual mide cerca de 480 KB; el umbral sigue
  // detectando copias vacías o truncadas sin exigir relleno artificial.
  assert.ok(Buffer.byteLength(document, "utf8") > 450_000);
  assert.ok(document.startsWith("<!DOCTYPE html>"));
  assert.match(document, /Número de empresas activas por año/);
  assert.match(document, /\/worker\/vendor\/xlsx\.full\.min\.js\?v=20260914-3/);
  assert.match(document, /\/worker\/client\.js\?v=20260914-3/);
  assert.ok(document.trimEnd().endsWith("</html>"));
});

test("all economic home embeds support principal-chart mode", async () => {
  for (const relativePath of [
    "../app/EconomicPage.tsx",
    "../app/TourismPage.tsx",
    "../app/SupermarketsPage.tsx",
  ]) {
    const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
    assert.match(source, /usePrincipalChartMode/);
    assert.match(source, /if \(principalOnly\) return principalChart/);
  }
});

test("Docker restores and validates the local Excel reader", async () => {
  const dockerfile = await readFile(
    new URL("../frontend/Dockerfile", import.meta.url),
    "utf8",
  );
  assert.match(
    dockerfile,
    /cp node_modules\/xlsx\/dist\/xlsx\.full\.min\.js public\/worker\/vendor\/xlsx\.full\.min\.js/,
  );
  assert.match(dockerfile, /evolucion_empresas_activas\.xlsx/);
});

test("frontend release marker matches Docker Compose healthcheck", async () => {
  // La misma versión debe estar en el recurso público y en el healthcheck;
  // una imagen antigua queda marcada como no saludable.
  const version = JSON.parse(
    await readFile(new URL("../public/build-version.json", import.meta.url), "utf8"),
  );
  const compose = await readFile(new URL("../docker-compose.yml", import.meta.url), "utf8");
  assert.equal(version.homeStories, 4);
  assert.match(compose, new RegExp(version.release, "g"));
});

test("Docker schedules weekday PostgreSQL cache refreshes through FastAPI", async () => {
  const compose = await readFile(new URL("../docker-compose.yml", import.meta.url), "utf8");
  const script = await readFile(new URL("../scripts/refresh-public-cache.mjs", import.meta.url), "utf8");
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(compose, /cache-refresh:/);
  assert.match(compose, /refresh-public-cache\.mjs", "--daemon"/);
  assert.match(compose, /CACHE_REFRESH_BASE_URL: http:\/\/frontend:3000/);
  assert.match(compose, /INTERNAL_API_BASE_URL: http:\/\/backend:8000\/api\/v1/);
  assert.doesNotMatch(compose, /LOCAL_D1_PATH|frontend_cache/);
  assert.match(worker, /createPostgresDatabase/);
  assert.doesNotMatch(worker, /createLocalD1|LOCAL_D1_PATH/);
  assert.match(script, /clock\.weekday !== "Sat" && clock\.weekday !== "Sun"/);
  assert.match(script, /hour === 10 && minute === 1/);
  assert.match(script, /minute % 5 === 1/);
});
