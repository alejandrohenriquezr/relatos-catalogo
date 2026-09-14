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
  assert.match(source, /`\/chart\/\$\{operation\}\?embed=1&v=20260914-2`/);
  assert.match(source, /catalogGroups\.slice\(0, 4\)/);
  assert.match(source, /\{stories\.length\} temas/);
});

test("business demography document is complete UTF-8 HTML", async () => {
  // El tamaño y los marcadores protegen contra la copia truncada/binaria que
  // anteriormente aparecía como símbolos extraños en el navegador.
  const document = await readFile(
    new URL("../public/demografia-empresas/index.html", import.meta.url),
    "utf8",
  );
  assert.ok(Buffer.byteLength(document, "utf8") > 500_000);
  assert.ok(document.startsWith("<!DOCTYPE html>"));
  assert.match(document, /Número de empresas activas por año/);
  assert.ok(document.trimEnd().endsWith("</html>"));
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
