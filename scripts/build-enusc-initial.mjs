#!/usr/bin/env node
/** Construye la copia mínima que permite mostrar la historia ENUSC sin esperar D1. */
import { readFile, writeFile } from "node:fs/promises";

const source = JSON.parse(await readFile(process.argv[2] ?? "public/enusc-data.json", "utf8"));
const output = process.argv[3] ?? "public/enusc-initial.json";
const exact = new Set([
  "VH_DC_NSE", "PAD_SEX", "PADB_SEX", "PCOS_SEX", "PED_SEX", "VP_DC_SEX", "VP_DV_SEX",
  "VH_DV_NSE", "VH_ROBOS_NSE", "VH_CIBER_NSE", "VH_ECON_NSE", "VH_EMERG_NSE", "VH_VAN_NSE",
  "DEN_VHDC_NSE", "DEN_ROBOS_NSE", "DEN_ECON_NSE", "DEN_CIBER", "DEN_VHDV_ULT",
  "EV_CONFIA_CCH_SEX", "EV_CONFIA_PDI_SEX", "EV_CONFIA_FMP_SEX", "EV_CONOCE_CCH_SEX", "EV_CONOCE_PDI_SEX",
]);
const included = (variable) =>
  exact.has(variable) ||
  (variable.startsWith("P_MOD_ACTIVIDADES_") && variable.endsWith("_SEX")) ||
  ((variable.startsWith("P_DESORDENES_") || variable.startsWith("P_INCIVILIDADES_")) && variable.endsWith("_SEX")) ||
  (variable.startsWith("MEDIDAS_") && variable.endsWith("_NSE"));
const metadata = source.metadata.filter((item) => included(item.variable));
const tabulations = Object.fromEntries(metadata.map((item) => [item.variable, source.tabulations[item.variable]]));
const themes = metadata.reduce((result, item) => ({ ...result, [item.theme]: (result[item.theme] ?? 0) + 1 }), {});

await writeFile(output, JSON.stringify({ ...source, metadata, themes, tabulations }));
console.log(JSON.stringify({ variables: metadata.length, bytes: (await readFile(output)).length }));
