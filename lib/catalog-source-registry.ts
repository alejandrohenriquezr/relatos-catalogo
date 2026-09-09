export type CatalogSource = {
  operation: string;
  label: string;
  dataEndpoint: string;
  publicationUrl: string;
};

const vitalPage = "https://www.ine.gob.cl/estadisticas-por-tema/demografia-y-poblacion/estadisticas-vitales";
const ine = "https://www.ine.gob.cl";

// Las rutas de datos reutilizan las API cache-first ya existentes del sitio.
export const catalogSources: CatalogSource[] = [
  ["ene", "Encuesta Nacional de Empleo", "/api/ene-data", `${ine}/estadisticas-por-tema/mercado-laboral/ocupacion-y-desocupacion`],
  ["informality", "Informalidad laboral", "/api/informality-data", `${ine}/estadisticas-por-tema/mercado-laboral/informalidad-laboral`],
  ["ipc", "Índice de Precios al Consumidor", "/api/ipc-data", `${ine}/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-al-consumidor`],
  ["ipp", "Índice de Precios al Productor", "/api/ipp-data", `${ine}/estadisticas-por-tema/precios-e-inflacion/indice-de-precios-de-productor`],
  ["births", "Nacimientos", "/api/vital-data?operation=births", vitalPage],
  ["fertility", "Fecundidad", "/api/vital-data?operation=fertility", vitalPage],
  ["deaths", "Defunciones", "/api/vital-data?operation=deaths", vitalPage],
  ["mortality", "Mortalidad", "/api/vital-data?operation=mortality", vitalPage],
  ["unions", "Matrimonios y AUC", "/api/vital-data?operation=unions", vitalPage],
  ["enusc", "ENUSC", "/api/enusc-data", `${ine}/estadisticas-por-tema/sociedad-y-condiciones-de-vida/seguridad-ciudadana`],
  ["police", "Estadísticas policiales", "/api/police-data", `${ine}/estadisticas-por-tema/sociedad-y-condiciones-de-vida/estadisticas-policiales-y-judiciales`],
  ["permits", "Permisos de edificación", "/api/economic-data?kind=permits", `${ine}/estadisticas-por-tema/industria-energia-y-construccion/permisos-de-edificacion`],
  ["energy", "Producción de electricidad, gas y agua", "/api/economic-data?kind=energy", `${ine}/estadisticas-por-tema/industria-energia-y-construccion/produccion-de-electricidad-gas-y-agua`],
  ["industry", "Índice de Producción Industrial", "/api/economic-data?kind=industry", `${ine}/estadisticas-por-tema/industria-energia-y-construccion/indice-de-produccion-industrial`],
  ["commerce", "Comercio", "/api/economic-data?kind=commerce", `${ine}/estadisticas-por-tema/comercio-y-servicios/actividad-mensual-del-comercio`],
  ["tourism", "Turismo", "/api/tourism-data", `${ine}/estadisticas-por-tema/comercio-y-servicios/actividad-mensual-del-turismo`],
  ["supermarkets", "Supermercados", "/api/supermarkets-data", `${ine}/estadisticas-por-tema/comercio-y-servicios/ventas-mensuales-de-supermercados`],
  ["businessDemography", "Demografía de empresas", "/datos_OE/cuadros_estadisticos", ""],
];
