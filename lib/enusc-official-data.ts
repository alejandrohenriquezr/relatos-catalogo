import * as XLSX from "xlsx";

export const ENUSC_OFFICIAL_SOURCE = "https://www.ine.gob.cl/docs/default-source/seguridad-ciudadana/cuadros-estadisticos/2024/tabulados---enusc-2024.xlsx";

const theme = (variable:string) => {
  if (/^(PAD|P_FUENTE|PCOS|P_INSEG|PED|P_EXPOS)/.test(variable)) return "Percepción y temor";
  if (/^(P_DESORDENES|P_INCIVILIDADES|PRESENCIA_TRAFICO|PRESENCIA_ARMAS)/.test(variable)) return "Entorno barrial";
  if (variable.startsWith("P_MOD_ACTIVIDADES")) return "Cambios de comportamiento";
  if (/^(EV_|EVAL_|PRESENCIA_CARABINEROS)/.test(variable)) return "Instituciones y policías";
  if (/^(MEDIDAS_|VECINOS_MEDIDAS_)/.test(variable)) return "Protección y organización";
  if (/^(DEN_|COSC_)/.test(variable)) return "Denuncia y cifra oculta";
  return "Victimización";
};
const number = (value:unknown) => typeof value === "number" && Number.isFinite(value) ? Math.round(value * 1e8) / 1e8 : null;
const rows = (sheet:XLSX.WorkSheet) => XLSX.utils.sheet_to_json<unknown[]>(sheet,{header:1,raw:true,defval:null});

/** Genera el código estable usado por la interfaz para cada desagregación. */
const variableCode = (indicator: string, disaggregation: unknown, order: number) => {
  const suffixes: Record<string, string> = {
    sexo: "SEX",
    "tramo etario": "AGE",
    nse: "NSE",
  };
  const key = String(disaggregation ?? "").trim().toLowerCase();
  return key ? `${indicator}_${suffixes[key] ?? `C${order}`}` : indicator;
};

export function parseEnuscWorkbook(buffer:ArrayBuffer){
  const workbook=XLSX.read(buffer,{type:"array"});
  const indexRows=rows(workbook.Sheets["Índice"]);
  const metadata=indexRows.slice(2).filter(row=>Number.isInteger(row[0]) && row[4]).map(row=>{
    const order=Number(row[0]), indicator=String(row[4]).trim();
    const variable=variableCode(indicator,row[2],order);
    return {order,variable,title:String(row[1]).trim(),type:null,level:row[3],disaggregation:row[2],weight:null,filter:null,sample:null,quality:{national:null,nationalDisaggregated:null,regional:null,regionalDisaggregated:null},theme:theme(variable)};
  });
  const tabulations:Record<string,unknown[]>={};
  for(const item of metadata){
    const sheet=workbook.Sheets[`Cuadro ${item.order}`];
    if(!sheet) continue;
    const sheetRows=rows(sheet);
    const headerIndex=sheetRows.findIndex(row=>String(row?.[0] ?? "").trim().toUpperCase()==="REGIÓN");
    if(headerIndex<0) continue;
    const headers=sheetRows[headerIndex] || [];
    const categoryColumn=String(headers[1] ?? "").trim().toUpperCase()==="CATEGORÍA";
    const groups:{label:string;column:number}[]=[];
    for(let column=categoryColumn?2:1;column<headers.length;column+=4){
      const label=String(headers[column] ?? "").trim();
      if(label) groups.push({label:label[0]+label.slice(1).toLowerCase(),column});
    }
    const records=[];
    for(const row of sheetRows.slice(headerIndex+1)){
      const region=String(row?.[0] ?? "").trim();
      if(!region || region.toUpperCase()==="NOTAS") continue;
      const estimates=[];
      for(const group of groups){
        const estimate=number(row[group.column]); if(estimate===null) continue;
        const rawNote=row[group.column+3];
        estimates.push({group:group.label,estimate,lower:number(row[group.column+1]),upper:number(row[group.column+2]),note:rawNote==null||rawNote===""?null:String(rawNote).trim()});
      }
      if(estimates.length) records.push({region,category:categoryColumn&&row[1]!=null?String(row[1]).trim():null,estimates});
    }
    tabulations[item.variable]=records;
  }
  const themes:Record<string,number>={}; for(const item of metadata) themes[item.theme]=(themes[item.theme]||0)+1;
  return {year:2024,source:ENUSC_OFFICIAL_SOURCE,metadata,themes,tabulations,qualityNotes:{
    "1":"Estimación poco fiable (coeficiente de variación mayor a 15% y menor o igual a 30%. En el caso de estimaciones de razón, si no cumple con el umbral de aceptación asociado a su error estándar). Se recomienda utilizar con precaución esta estimación, ya que podría llevar a conclusiones poco acertadas.",
    "2":"Estimación no fiable (número de casos muestrales menor a 60, grados de libertad menores a 9 o coeficiente de variación mayor a 30%). No se recomienda el uso de esta estimación."
  }};
}
