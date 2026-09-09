import {notFound} from "next/navigation";
import {OPERATION_CONFIG_DEFAULTS} from "../../../lib/operation-config";

const vitalOperations = new Map(
  OPERATION_CONFIG_DEFAULTS.filter(([operation]) =>
    ["births", "fertility", "deaths", "mortality", "unions"].includes(operation),
  ),
);

vitalOperations.set("auc", "Acuerdos de unión civil");

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{operation: string}>;
}) {
  const {operation} = await params;
  const label = vitalOperations.get(operation);
  if (!label) notFound();

  return (
    <main className="analysis-page">
      <a href="/">Volver al catálogo</a>
      <span className="eyebrow">Análisis de resultados</span>
      <h1>{label}</h1>
      <p>
        Esta página reúne el análisis de resultados de {label.toLowerCase()}.
        La información se actualizará desde la caché pública de estadísticas vitales
        cuando el archivo oficial del INE registre cambios.
      </p>
      <section aria-labelledby="fuente-oficial">
        <h2 id="fuente-oficial">Fuente oficial</h2>
        <p>
          Los datos provienen de las series vitales 1992–2025 (provisionales),
          publicadas por el Instituto Nacional de Estadísticas.
        </p>
        <a
          href="https://www.ine.gob.cl/estadisticas-por-tema/demografia-y-poblacion/estadisticas-vitales"
          target="_blank"
          rel="noreferrer"
        >
          Consultar la publicación oficial
        </a>
      </section>
    </main>
  );
}
