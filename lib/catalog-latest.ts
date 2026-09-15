import type { SiteDestination } from "../app/SectionHeader";
const groups:{topic:string;items:[SiteDestination,string][]}[]=[{topic:"Mercado laboral",items:[["ene","Ocupación y desocupación"],["informality","Informalidad laboral"]]},{topic:"Precios",items:[["ipc","Índice de Precios al Consumidor"],["ipp","Índice de Precios al Productor"]]},{topic:"Demografía y población",items:[["births","Nacimientos"],["fertility","Fecundidad"],["deaths","Defunciones"],["mortality","Mortalidad"],["unions","Matrimonios y AUC"]]},{topic:"Condiciones de vida",items:[["enusc","ENUSC"],["police","Policías"]]},{topic:"Industria, Energía y Construcción",items:[["permits","Permisos de Edificación"],["energy","Energía"],["industry","Industria"]]},{topic:"Servicios",items:[["commerce","Comercio"],["tourism","Turismo"],["supermarkets","Supermercados"]]},{topic:"Estadísticas Experimentales",items:[["businessDemography","Demografía de empresas"]]}];

type LatestEntry={operation:SiteDestination;label:string;topic:string;updatedAt:string|null;latestPeriod:string|null};

/** Convierte solo fechas reales; las firmas SHA de algunas cachés no son fechas. */
const publicationTime=(value:string|null)=>{
  if(!value)return Number.NEGATIVE_INFINITY;
  const time=Date.parse(value);
  return Number.isFinite(time)?time:Number.NEGATIVE_INFINITY;
};

/** Ordena por la modificación de la fuente oficial, no por la recarga técnica de la caché. */
export function sortByOfficialPublication(entries:LatestEntry[]){
  return [...entries].sort((a,b)=>{
    const aPublication=publicationTime(a.latestPeriod);
    const bPublication=publicationTime(b.latestPeriod);
    if(aPublication!==bPublication)return bPublication-aPublication;
    return (b.updatedAt??"").localeCompare(a.updatedAt??"");
  });
}

export function catalogLatest(rows:{operation:string;cache_updated_at?:string|null;source_last_modified?:string|null}[]){
  const entries=groups.flatMap(g=>g.items.map(([operation,label])=>{
    const cacheOperation=["births","fertility","deaths","mortality","unions"].includes(operation)?"vital-statistics":operation;
    const r=rows.find(x=>x.operation===cacheOperation);
    return {operation,label,topic:g.topic,updatedAt:r?.cache_updated_at??null,latestPeriod:r?.source_last_modified??null};
  }));
  return sortByOfficialPublication(entries);
}
