// Catálogo común de operaciones estadísticas expuestas por el API SDMX.
export const operationCatalog = {
  ENE: {label: "Encuesta Nacional de Empleo", dataflow: "DF_ENE_MERCADO_LABORAL", version: "2.0", source: "/api/ene-data"},
  INFORMALIDAD: {label: "Informalidad laboral", dataflow: "DF_INFORMALIDAD", version: "1.0", source: "/api/informality-data"},
  IPC: {label: "Índice de Precios al Consumidor", dataflow: "DF_IPC", version: "1.0", source: "/api/ipc-data"},
  IPP: {label: "Índice de Precios de Productor", dataflow: "DF_IPP", version: "1.0", source: "/api/ipp-data"},
  NACIMIENTOS: {label: "Nacimientos", dataflow: "DF_NACIMIENTOS", version: "1.0", source: "/api/vital-data?operation=births"},
  FECUNDIDAD: {label: "Fecundidad", dataflow: "DF_FECUNDIDAD", version: "1.0", source: "/api/vital-data?operation=fertility"},
  DEFUNCIONES: {label: "Defunciones", dataflow: "DF_DEFUNCIONES", version: "1.0", source: "/api/vital-data?operation=deaths"},
  MORTALIDAD: {label: "Mortalidad", dataflow: "DF_MORTALIDAD", version: "1.0", source: "/api/vital-data?operation=mortality"},
  MATRIMONIOS_AUC: {label: "Matrimonios y AUC", dataflow: "DF_MATRIMONIOS_AUC", version: "1.0", source: "/api/vital-data?operation=unions"},
  ENUSC: {label: "Encuesta Nacional Urbana de Seguridad Ciudadana", dataflow: "DF_ENUSC", version: "1.0", source: "/api/enusc-data"},
  POLICIAS: {label: "Estadísticas policiales", dataflow: "DF_POLICIAS", version: "1.0", source: "/api/police-data"},
  PERMISOS: {label: "Permisos de edificación", dataflow: "DF_PERMISOS_EDIFICACION", version: "1.0", source: "/api/economic-data?kind=permits"},
  ELECTRICIDAD_GAS_AGUA: {label: "Producción de electricidad, gas y agua", dataflow: "DF_IPDEGA", version: "1.0", source: "/api/economic-data?kind=energy"},
  IPI: {label: "Índice de Producción Industrial", dataflow: "DF_IPI", version: "1.0", source: "/api/economic-data?kind=industry"},
  COMERCIO: {label: "Comercio", dataflow: "DF_COMERCIO", version: "1.0", source: "/api/economic-data?kind=commerce"},
  TURISMO: {label: "Turismo", dataflow: "DF_TURISMO", version: "1.0", source: "/api/tourism-data"},
  SUPERMERCADOS: {label: "Supermercados", dataflow: "DF_SUPERMERCADOS", version: "1.0", source: "/api/supermarkets-data"},
  DEMOGRAFIA_EMPRESAS: {
    label: "Demografía de empresas",
    dataflow: "DF_DEMOGRAFIA_EMPRESAS",
    version: "1.0",
    source: "/datos_OE/cuadros_estadisticos",
    dimensions: [
      "REF_AREA",
      "ACTIVITY",
      "SIZE_SALES",
      "SIZE_WORKERS",
      "INDICATOR",
      "TIME_PERIOD",
    ],
  },
} as const;

export type OperationCode = keyof typeof operationCatalog;

// Convierte registros tabulares simples a un SDMX-CSV mínimo y estable.
export function recordsToSdmxCsv(operation: OperationCode, records: Array<Record<string, unknown>>) {
  const csvCell = (value: unknown) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  // Los datasets normalizados pueden llegar con una observación explícita.
  const normalized = records.filter(record => record.obs_value !== undefined).map(record => [
    String(record.ref_area ?? "CL"),
    operation,
    String(record.indicator ?? "OBS_VALUE"),
    String(record.time_period ?? ""),
    String(record.obs_value),
  ]);
  if (normalized.length) {
    return ["REF_AREA,OPERATION,INDICATOR,TIME_PERIOD,OBS_VALUE", ...normalized.map(row => row.map(csvCell).join(","))].join("\n") + "\n";
  }
  const rows = records.flatMap((record, index) => {
    const period = String(record.TIME_PERIOD ?? record.time_period ?? record.year ?? record.anio ?? index + 1);
    return Object.entries(record)
      .filter(([, value]) => typeof value === "number" || (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))))
      .map(([indicator, value]) => ["CL", operation, indicator, period, String(value)]);
  });
  return ["REF_AREA,OPERATION,INDICATOR,TIME_PERIOD,OBS_VALUE", ...rows.map(row => row.map(csvCell).join(","))].join("\n") + "\n";
}
