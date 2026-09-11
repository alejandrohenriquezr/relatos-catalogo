import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { IPC_AMBIGUITY_RULES, IPC_SEARCH_TAXONOMY } from "../lib/ipc-nlp-taxonomy.js";

const nodes = JSON.parse(fs.readFileSync(new URL("../public/ipc-hierarchy.json", import.meta.url), "utf8"));
const ids = new Set(nodes.map((node) => node.id));
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

test("cada sinónimo conduce a una serie oficial existente", () => {
  assert.ok(IPC_SEARCH_TAXONOMY.length >= 40);
  IPC_SEARCH_TAXONOMY.forEach((entry) => {
    assert.ok(ids.has(entry.id), `${entry.official} apunta a ${entry.id}, que no existe`);
    assert.ok(entry.synonyms.length > 0);
    assert.ok(entry.tags.length > 0);
    assert.ok(entry.division);
  });
});

test("los chilenismos frecuentes tienen un destino inequívoco", () => {
  const destinations = new Map();
  IPC_SEARCH_TAXONOMY.forEach((entry) => entry.synonyms.forEach((term) => destinations.set(normalize(term), entry.id)));
  assert.equal(destinations.get("marraqueta"), "01.1.1.3.1");
  assert.equal(destinations.get("bencina"), "07.2.2.2.1");
  assert.equal(destinations.get("micro"), "07.3.1");
  assert.equal(destinations.get("confort"), "13.1.1.2.1");
});

test("las reglas de ambigüedad sólo priorizan IDs válidos", () => {
  assert.ok(IPC_AMBIGUITY_RULES.length >= 6);
  IPC_AMBIGUITY_RULES.flatMap((rule) => rule.contexts).forEach((context) => assert.ok(ids.has(context.preferId)));
});
