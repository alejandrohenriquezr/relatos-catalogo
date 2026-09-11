import ChartPageClient from "./ChartPageClient";

export default async function ChartPage({ params }: { params: Promise<{ operation: string }> }) {
  // Next 16 entrega params de forma asíncrona; await también funciona con
  // adaptadores que aún proporcionan un objeto plano.
  const { operation } = await params;
  return <ChartPageClient operation={operation} />;
}
