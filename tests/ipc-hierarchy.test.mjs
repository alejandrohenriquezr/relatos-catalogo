import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const hierarchy = JSON.parse(fs.readFileSync("public/ipc-hierarchy.json", "utf8"));
const detailSeries = JSON.parse(fs.readFileSync("public/ipc-detail-series.json", "utf8"));
const byId = new Map(hierarchy.map((node) => [node.id, node]));

test("el índice IPC conserva los cinco niveles y sus rutas", () => {
  assert.deepEqual(new Set(hierarchy.map((node) => node.nivel)), new Set(["General", "División", "Grupo", "Clase", "Subclase", "Producto"]));
  for (const node of hierarchy) {
    assert.equal(node.path.length, node.pathIds.length);
    assert.equal(node.pathIds.at(-1), node.id);
    assert.ok(node.parentId === null || byId.has(node.parentId));
  }
});

test("Arroz puede resolverse como subclase y producto con serie histórica", () => {
  for (const id of ["01.1.1.1", "01.1.1.1.1"]) {
    assert.equal(byId.get(id)?.glosa, "Arroz");
    assert.ok(detailSeries[id].length >= 25);
    assert.ok(detailSeries[id].every((point) => Number.isFinite(point.monthly)));
  }
});

test("todas las categorías bajo división tienen una serie asociada", () => {
  const detailedNodes = hierarchy.filter((node) => node.pathIds.length > 2);
  assert.equal(detailedNodes.length, 600);
  assert.ok(detailedNodes.every((node) => detailSeries[node.id]?.length > 0));
});
