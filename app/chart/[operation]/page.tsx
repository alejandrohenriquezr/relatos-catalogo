import ChartPageClient from "./ChartPageClient";

export default function ChartPage({ params }: { params: { operation: string } }) {
  // Next/Vinext resuelve el segmento dinámico en el servidor, antes de que
  // el iframe cargue, por lo que nunca cae al Home por un primer render.
  return <ChartPageClient operation={params.operation} />;
}
