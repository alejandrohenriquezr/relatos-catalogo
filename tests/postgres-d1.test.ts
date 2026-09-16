import assert from "node:assert/strict";
import test from "node:test";

import { createPostgresDatabase } from "../lib/postgres-d1";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("envía consultas preparadas a FastAPI con la credencial interna", async () => {
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return Response.json({ results: [{ kind: "ene" }], changes: 0 });
  };

  const database = createPostgresDatabase("http://backend:8000/api/v1/", "secret");
  const row = await database
    .prepare("SELECT * FROM economic_source_cache WHERE kind = ?")
    .bind("ene")
    .first<{ kind: string }>();

  assert.equal(row?.kind, "ene");
  assert.equal(request?.url, "http://backend:8000/api/v1/internal/database");
  assert.equal(request?.headers.get("x-internal-token"), "secret");
  assert.deepEqual(await request?.json(), {
    sql: "SELECT * FROM economic_source_cache WHERE kind = ?",
    params: ["ene"],
    mode: "first",
  });
});

test("ignora DDL histórico porque Alembic controla el esquema", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return Response.json({});
  };
  const database = createPostgresDatabase("http://backend:8000/api/v1", "secret");
  const result = await database
    .prepare("CREATE TABLE IF NOT EXISTS ignored (id TEXT PRIMARY KEY)")
    .run();
  assert.equal(result.meta.changes, 0);
  assert.equal(calls, 0);
});

test("falla si faltan las variables internas", () => {
  assert.throws(() => createPostgresDatabase("", ""), /obligatorios/);
});
