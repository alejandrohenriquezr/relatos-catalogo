"use client";

import { AnalysisPage } from "../../page";
import { PrincipalChartMode } from "../../PrincipalChartMode";
import type { SiteDestination } from "../../SectionHeader";

const supportedOperations: SiteDestination[] = [
  "ene", "informality", "ipc", "ipp", "births", "fertility", "deaths",
  "mortality", "unions", "enusc", "police", "energy", "industry", "permits",
  "commerce", "tourism", "supermarkets",
];

export default function ChartPageClient({ operation }: { operation: string }) {
  // La ruta dedicada evita renderizar el Home dentro de los iframes de
  // historias: el servidor entrega directamente el modo gráfico solicitado.
  const view = supportedOperations.includes(operation as SiteDestination)
    ? operation as SiteDestination
    : "industry";

  return (
    <PrincipalChartMode.Provider value={true}>
      <div className="principal-chart-document">
        <style>{`
          html,body{margin:0;background:#fff;min-height:0;max-width:100%;overflow-x:hidden!important}
          .principal-chart-document{padding:8px;width:100%;max-width:100%;overflow-x:hidden;box-sizing:border-box}
          .principal-chart-document>.chart-shell,.principal-chart-document>.birth-chart{margin:0;width:100%;box-sizing:border-box}
          .principal-chart-document svg{max-width:100%;width:100%;height:auto;min-width:0!important}
          .principal-chart-document .birth-chart{overflow-x:hidden!important}
          .principal-chart-document .birth-window-controls{min-width:0!important}
          .principal-chart-document svg text{font-size:14px!important}
          .principal-chart-document .axis-title,
          .principal-chart-document .x-label,
          .principal-chart-document .econ-x-label,
          .principal-chart-document .ipc-x-label,
          .principal-chart-document .ipp-division-label{font-size:14px!important}
          .principal-chart-document .chart-head{flex-wrap:wrap;gap:10px}
          .principal-chart-document .data-loading{min-height:180px}
          .principal-chart-document .ipp-time-reading{display:none}
        `}</style>
        <AnalysisPage initialView={view} />
      </div>
    </PrincipalChartMode.Provider>
  );
}
