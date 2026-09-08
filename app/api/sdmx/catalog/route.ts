import {NextResponse} from "next/server";
import {operationCatalog} from "../../../../lib/operation-sdmx";

// Publica el inventario SDMX para que cada operación tenga un punto de entrada descubrible.
export async function GET() {
  return NextResponse.json({
    agency: "INE.GOB.CL",
    operations: Object.entries(operationCatalog).map(([code, item]) => ({
      code,
      ...item,
      data_endpoint: `/api/sdmx/data/INE.GOB.CL,${item.dataflow},${item.version}/all`,
      metadata_endpoint: `/api/sdmx/metadata?dataset=${code}`,
      documentation: `/api/sdmx/documentation?dataset=${code}`,
    })),
  }, {headers: {"Cache-Control": "public, max-age=3600"}});
}
