// Catálogo estable para que el CMS y la interfaz compartan los mismos identificadores.
export const OPERATION_CONFIG_DEFAULTS = [
  ["ene", "Encuesta Nacional de Empleo"], ["informality", "Informalidad laboral"], ["ipc", "Índice de Precios al Consumidor"], ["ipp", "Índice de Precios al Productor"],
  ["births", "Nacimientos"], ["fertility", "Fecundidad"], ["deaths", "Defunciones"], ["mortality", "Mortalidad"], ["unions", "Matrimonios y AUC"], ["enusc", "ENUSC"], ["police", "Registros de policías"],
  ["permits", "Permisos de edificación"], ["energy", "Producción de electricidad, gas y agua"], ["industry", "Índice de Producción Industrial"], ["commerce", "Comercio"], ["tourism", "Turismo"], ["supermarkets", "Supermercados"], ["businessDemography", "Demografía de empresas"],
] as const;
export type OperationConfig = { operation: string; label: string; analysis: boolean; publications: boolean; documentation: boolean; databases: boolean; resources: boolean };
export const defaults = (): OperationConfig[] => OPERATION_CONFIG_DEFAULTS.map(([operation, label]) => ({ operation, label, analysis: true, publications: false, documentation: false, databases: false, resources: false }));
export function rowToConfig(row: Record<string, unknown>): OperationConfig {
  const enabled = (value: unknown, fallback: boolean) => value === undefined || value === null ? fallback : value === "on" || value === 1 || value === true;
  return { operation: String(row.operation), label: String(row.label), analysis: enabled(row.analysis, true), publications: enabled(row.publications, false), documentation: enabled(row.documentation, false), databases: enabled(row.databases, false), resources: enabled(row.resources, false) };
}
