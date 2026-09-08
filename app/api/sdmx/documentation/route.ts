import {NextRequest, NextResponse} from "next/server";
import {operationCatalog} from "../../../../lib/operation-sdmx";

// Entrega la guía técnica específica de cada operación en formato JSON legible y reutilizable.
export async function GET(request: NextRequest) {
  const dataset = request.nextUrl.searchParams.get("dataset")?.toUpperCase() as keyof typeof operationCatalog;
  const operation = operationCatalog[dataset];
  if (!operation) return NextResponse.json({error: "Operación no disponible", supported: Object.keys(operationCatalog)}, {status: 404});
  return NextResponse.json({
    title: `Documentación SDMX — ${operation.label}`,
    agency: "INE.GOB.CL",
    dataset,
    dataflow: `${operation.dataflow}(${operation.version})`,
    source: operation.source,
    endpoint: `/api/sdmx/data/INE.GOB.CL,${operation.dataflow},${operation.version}/all`,
    format: "SDMX-CSV",
    dimensions: operation.dimensions ?? ["REF_AREA", "OPERATION", "INDICATOR", "TIME_PERIOD", "OBS_VALUE"],
    update_policy: "Los datos publicados deben actualizarse en la instantánea validada y conservar la versión del dataflow.",
    validation: "Las observaciones deben validarse antes de publicar una nueva versión.",
  }, {headers: {"Cache-Control": "public, max-age=3600"}});
}
