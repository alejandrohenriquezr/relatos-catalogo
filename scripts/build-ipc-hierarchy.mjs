/**
 * Construye el índice jerárquico del IPC y las series históricas detalladas.
 *
 * Uso:
 * node scripts/build-ipc-hierarchy.mjs <glosas_ipc.xlsx> <ipc-xls.xlsx>
 */
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const [glossaryPath, seriesPath] = process.argv.slice(2);
if (!glossaryPath || !seriesPath) {
  throw new Error("Debe indicar los archivos de glosas y series del IPC.");
}

const root = path.resolve(import.meta.dirname, "..");
const levelNames = ["División", "Grupo", "Clase", "Subclase", "Producto"];
const glossaryBook = XLSX.read(fs.readFileSync(glossaryPath), { type: "buffer" });

const codeId = (codes) =>
  codes.length === 0
    ? "general"
    : [String(codes[0]).padStart(2, "0"), ...codes.slice(1).map(String)].join(".");

// Primero se crea un mapa por código para resolver los caminos completos.
const rawNodes = [];
for (let depth = 1; depth <= levelNames.length; depth += 1) {
  const sheet = glossaryBook.Sheets[levelNames[depth - 1]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });
  for (const row of rows.slice(1)) {
    const codes = row.slice(0, depth).map(Number);
    const glosa = String(row[depth] ?? "").trim();
    if (!glosa || codes.some((value) => !Number.isInteger(value))) continue;
    rawNodes.push({ id: codeId(codes), codes, glosa, nivel: levelNames[depth - 1] });
  }
}

const nodeById = new Map(rawNodes.map((node) => [node.id, node]));
const general = {
  id: "general",
  glosa: "IPC General",
  nivel: "General",
  parentId: null,
  path: ["IPC General"],
  pathIds: ["general"],
};
const hierarchy = [
  general,
  ...rawNodes.map((node) => {
    const pathIds = ["general"];
    for (let depth = 1; depth <= node.codes.length; depth += 1) {
      pathIds.push(codeId(node.codes.slice(0, depth)));
    }
    return {
      id: node.id,
      glosa: node.glosa,
      nivel: node.nivel,
      parentId: pathIds.at(-2) ?? "general",
      path: pathIds.map((id) => (id === "general" ? general.glosa : nodeById.get(id)?.glosa ?? id)),
      pathIds,
    };
  }),
];

// El libro oficial contiene una fila por período y nivel de la canasta.
const seriesBook = XLSX.read(fs.readFileSync(seriesPath), { type: "buffer" });
const seriesRows = XLSX.utils.sheet_to_json(seriesBook.Sheets[seriesBook.SheetNames[0]], {
  header: 1,
  raw: true,
  defval: null,
});
const detailSeries = {};
for (const row of seriesRows.slice(4)) {
  if (!Number.isInteger(row[0]) || !Number.isInteger(row[1])) continue;
  const codes = row.slice(2, 7).filter((value) => Number.isInteger(value)).map(Number);
  if (codes.length < 2) continue; // General y división ya viven en ipc-data.json.
  const id = codeId(codes);
  if (!nodeById.has(id)) continue;
  (detailSeries[id] ??= []).push({
    year: Number(row[0]),
    month: Number(row[1]),
    index: Number(row[9]),
    monthly: Number(row[10]),
    accumulated: Number(row[11]),
    annual: Number(row[12]),
    monthlyIncidence: typeof row[13] === "number" ? row[13] : null,
  });
}

fs.writeFileSync(path.join(root, "public/ipc-hierarchy.json"), JSON.stringify(hierarchy));
fs.writeFileSync(path.join(root, "public/ipc-detail-series.json"), JSON.stringify(detailSeries));
console.log(`Jerarquía IPC: ${hierarchy.length} nodos; ${Object.keys(detailSeries).length} series detalladas.`);
