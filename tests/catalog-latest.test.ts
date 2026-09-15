import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { sortByOfficialPublication } from "../lib/catalog-latest";

test("la portada prioriza la fecha de la fuente oficial", () => {
  const entries = sortByOfficialPublication([
    { operation: "industry", label: "Industria", topic: "Industria", updatedAt: "2026-09-15T12:00:00Z", latestPeriod: "Mon, 31 Aug 2026 13:00:12 GMT" },
    { operation: "commerce", label: "Comercio", topic: "Servicios", updatedAt: "2026-09-09T12:00:00Z", latestPeriod: "Mon, 31 Aug 2026 13:00:13 GMT" },
    { operation: "ipc", label: "IPC", topic: "Precios", updatedAt: "2026-09-16T12:00:00Z", latestPeriod: "firma-no-fecha" },
  ]);

  assert.deepEqual(entries.map((entry) => entry.operation), ["commerce", "industry", "ipc"]);
});

test("la instantánea oficial produce la portada y sus cuatro historias", async () => {
  const snapshot = JSON.parse(
    await readFile(new URL("../public/catalog-latest.json", import.meta.url), "utf8"),
  );
  const latest = sortByOfficialPublication(snapshot);
  assert.deepEqual(
    latest.slice(0, 5).map((entry) => entry.operation),
    ["ipc", "tourism", "commerce", "supermarkets", "industry"],
  );
});
