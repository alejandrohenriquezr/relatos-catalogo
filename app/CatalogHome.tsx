"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteDestination } from "./SectionHeader";
import catalogLatestSnapshot from "../public/catalog-latest.json";
import "./catalog.css";

type Entry = [SiteDestination, string];
type Group = { title: string; question: string; items: Entry[] };

export const catalogGroups: Group[] = [
  { title: "Mercado laboral", question: "¿Cómo cambia el trabajo en Chile?", items: [["ene", "Ocupación y desocupación"], ["informality", "Informalidad laboral"]] },
  { title: "Precios", question: "¿Cómo evolucionan los precios?", items: [["ipc", "Índice de Precios al Consumidor"], ["ipp", "Índice de Precios al Productor"]] },
  { title: "Demografía y población", question: "¿Cómo está cambiando nuestra población?", items: [["births", "Nacimientos"], ["fertility", "Fecundidad"], ["deaths", "Defunciones"], ["mortality", "Mortalidad"], ["unions", "Matrimonios y AUC"]] },
  { title: "Condiciones de vida", question: "¿Qué sabemos sobre seguridad?", items: [["enusc", "ENUSC"], ["police", "Policías"]] },
  { title: "Industria, Energía y Construcción", question: "¿Cómo se mueve la actividad productiva?", items: [["permits", "Permisos de Edificación"], ["energy", "Energía"], ["industry", "Industria"]] },
  { title: "Servicios", question: "¿Qué ocurre con el comercio y el turismo?", items: [["commerce", "Comercio"], ["tourism", "Turismo"], ["supermarkets", "Supermercados"]] },
  { title: "Estadísticas Experimentales", question: "¿Cómo cambia el tejido empresarial?", items: [["businessDemography", "Demografía de empresas"]] },
];

type Latest = { operation: SiteDestination; label: string; topic: string; updatedAt: string | null; latestPeriod: string | null };

const principalAnalysis: Record<SiteDestination, string> = {
  home: "",
  ene: "La evolución conjunta de la ocupación, la desocupación y la participación permite distinguir los cambios en el empleo de las variaciones en la fuerza de trabajo.",
  informality: "La tasa de ocupación informal muestra qué proporción de las personas ocupadas trabaja sin acceso pleno a la protección laboral y social asociada a su vínculo de trabajo.",
  ipc: "El IPC mide la variación de los precios de una canasta representativa del consumo de los hogares y permite examinar el resultado general y el aporte de sus divisiones.",
  ipp: "Los índices de precios de productor muestran la evolución de los precios en las primeras etapas de comercialización de la producción nacional.",
  births: "La serie de nacimientos permite observar su evolución temporal y los cambios en su distribución territorial y por características demográficas.",
  fertility: "Los indicadores de fecundidad relacionan los nacimientos con la población expuesta y permiten comparar niveles y calendarios reproductivos entre períodos.",
  deaths: "La evolución de las defunciones permite examinar cambios temporales, territoriales y demográficos en la mortalidad observada.",
  mortality: "Las tasas de mortalidad relacionan las defunciones con la población expuesta y permiten realizar comparaciones que no dependen solo del tamaño poblacional.",
  unions: "Las estadísticas de matrimonios y acuerdos de unión civil muestran la evolución de estas uniones y su composición demográfica.",
  enusc: "La ENUSC permite analizar la victimización, la percepción de inseguridad y otros antecedentes asociados a la seguridad ciudadana.",
  police: "Los registros de Carabineros y la Policía de Investigaciones permiten examinar denuncias, detenciones y víctimas según período y territorio.",
  energy: "La producción de electricidad, gas y agua permite distinguir los movimientos coyunturales de las tendencias de fondo en estos servicios esenciales.",
  industry: "El Índice de Producción Industrial reúne minería, manufactura y electricidad, gas y agua. Su lectura conjunta muestra qué actividades explican el resultado industrial del país.",
  permits: "La superficie autorizada anticipa parte de la actividad constructiva; su composición permite identificar cuánto corresponde a vivienda y a destinos no habitacionales.",
  commerce: "El índice de actividad del comercio permite seguir la evolución del sector a precios constantes y distinguir el resultado agregado de sus divisiones y productos.",
  tourism: "Las pernoctaciones, llegadas y tasas de ocupación permiten seguir la actividad de los establecimientos de alojamiento turístico y su distribución territorial.",
  supermarkets: "Los índices de ventas de supermercados permiten comparar la evolución a precios corrientes y constantes, tanto a nivel nacional como regional.",
  businessDemography: "La demografía de empresas permite examinar empresas activas, nacimientos, muertes y supervivencia según territorio, actividad económica y tamaño.",
};

const refreshEndpoints = [
  "/api/ene-data?refresh=1",
  "/api/informality-data?refresh=1",
  "/api/ipc-data?refresh=1",
  "/api/ipp-data?refresh=1",
  "/api/vital-data?refresh=1",
  "/api/enusc-data?refresh=1",
  "/api/police-data?refresh=1",
  "/api/economic-data?kind=energy&refresh=1",
  "/api/economic-data?kind=industry&refresh=1",
  "/api/economic-data?kind=permits&refresh=1",
  "/api/economic-data?kind=commerce&refresh=1",
  "/api/tourism-data?refresh=1",
  "/api/supermarkets-data?refresh=1",
];

async function readLatest(): Promise<Latest[]> {
  const response = await fetch("/api/catalog-latest", { cache: "no-store" });
  return response.ok ? response.json() : [];
}

async function refreshAllCaches() {
  // Ejecuta lotes pequeños para no concentrar todas las descargas y
  // transformaciones de libros Excel en un mismo instante.
  for (let index = 0; index < refreshEndpoints.length; index += 3) {
    const batch = refreshEndpoints.slice(index, index + 3);
    await Promise.allSettled(batch.map((endpoint) => fetch(endpoint, { cache: "no-store" })));
  }
}

function OperationChart({ operation, label }: { operation: SiteDestination; label: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(540);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let observer: ResizeObserver | undefined;
    let mutations: MutationObserver | undefined;
    const connect = () => {
      observer?.disconnect();
      mutations?.disconnect();
      const doc = element.contentDocument;
      if (!doc?.body) return;
      const resize = () => {
        const root = doc.querySelector(".principal-chart-document");
        if (root) setHeight(Math.max(320, Math.ceil(root.getBoundingClientRect().height) + 4));
      };
      observer = new ResizeObserver(resize);
      observer.observe(doc.body);
      mutations = new MutationObserver(resize);
      mutations.observe(doc.body, { childList: true, subtree: true });
      resize();
    };
    element.addEventListener("load", connect);
    connect();
    return () => {
      element.removeEventListener("load", connect);
      observer?.disconnect();
      mutations?.disconnect();
    };
  }, [operation]);
  const src = operation === "businessDemography" ? "/demografia-empresas/index.html?chart=principal" : `/?chart=${operation}`;
  return <iframe ref={frame} className="operation-chart-frame" src={src} title={`Gráfico principal: ${label}`} style={{ height }} />;
}

const dateText = (date: string | null) => date ? new Date(date).toLocaleDateString("es-CL") : "Actualización pendiente";

export default function CatalogHome({ onNavigate }: { onNavigate: (destination: SiteDestination) => void }) {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  // La copia publicada evita una portada vacía mientras se lee la caché D1.
  const [latest, setLatest] = useState<Latest[]>(catalogLatestSnapshot as Latest[]);
  const refreshStarted = useRef(false);
  useEffect(() => {
    let active = true;
    if (!refreshStarted.current) {
      refreshStarted.current = true;
      void (async () => {
        // 1. Lee y muestra primero la caché pública compartida.
        const cached = await readLatest().catch(() => [] as Latest[]);
        if (active && cached.length) setLatest(cached);

        // 2. Revisa las fuentes oficiales sin bloquear la portada.
        await refreshAllCaches().catch(() => {});

        // 3. Si una fuente cambió, lee la caché ya guardada y actualiza la web.
        const refreshed = await readLatest().catch(() => [] as Latest[]);
        if (active && refreshed.length && JSON.stringify(refreshed) !== JSON.stringify(cached)) {
          setLatest(refreshed);
        }
      })();
    }
    return () => { active = false; };
  }, []);
  const all = useMemo(() => catalogGroups.flatMap((group) => group.items.map(([operation, label]) => ({ operation, label, topic: group.title }))), []);
  const featured = latest[0];
  const stories = catalogGroups.slice(0, 6).map((group) => {
    const item = latest.find((entry) => entry.topic === group.title && entry.operation !== featured.operation) ?? all.find((entry) => entry.topic === group.title && entry.operation !== featured.operation);
    return item ? { group, item } : null;
  }).filter(Boolean) as { group: Group; item: Latest | { operation: SiteDestination; label: string; topic: string } }[];
  return <main id="catalog-home">
    <header className="catalog-mast"><div aria-hidden="true" /></header>
    <section className="catalog-hero"><div className="catalog-eyebrow">Explora las estadísticas de Chile</div><h1>¿Qué quieres conocer<br />del país que habitamos?</h1><p>Encuentra una historia, entiende su contexto y explora la operación estadística que la sustenta.</p></section>
    <section className="catalog-feature"><div className="catalog-feature-copy"><div className="catalog-eyebrow">Publicación más reciente · {dateText(featured.updatedAt)}</div><h2>{featured.label}</h2><p className="catalog-feature-analysis">{principalAnalysis[featured.operation]}</p><button className="catalog-link" onClick={() => onNavigate(featured.operation)}>Ir a la operación <span>→</span></button></div><div className="catalog-operation-chart"><OperationChart operation={featured.operation} label={featured.label} /></div></section>
    <div className="catalog-content">
      <aside aria-label="Temas estadísticos"><div className="catalog-eyebrow">Explorar por materia</div><div className="catalog-topic-browser"><div className="catalog-topics">{catalogGroups.map((group, index) => <div className="catalog-topic-row" key={group.title}><button onClick={() => setSelectedTopic(selectedTopic === index ? null : index)} aria-expanded={selectedTopic === index}>{group.title}<span>{group.items.length}</span></button>{selectedTopic === index && <section className="catalog-operation-menu" aria-label={`Operaciones de ${group.title}`}>{group.items.map(([operation, label]) => <button className="catalog-entry" key={operation} onClick={() => onNavigate(operation)}>{label}<span>→</span></button>)}</section>}</div>)}</div></div></aside>
      <section className="catalog-stories"><div className="catalog-result-head"><h2>Historias por tema actualizadas recientemente</h2><span>{stories.length} temas</span></div><div className="catalog-groups">{stories.map(({ group, item }) => <article key={group.title}><div className="catalog-eyebrow">{group.title} · {dateText(latest.find((entry) => entry.topic === group.title)?.updatedAt ?? null)}</div><h3>{item.label}</h3><p>{group.question}</p><div className="catalog-operation-chart"><OperationChart operation={item.operation} label={item.label} /></div><button className="catalog-link" onClick={() => onNavigate(item.operation)}>Explorar relato <span>→</span></button></article>)}</div></section>
    </div>
    <footer>Las cifras y documentos publicados en <a href="https://www.ine.gob.cl" target="_blank" rel="noreferrer">ine.gob.cl</a> constituyen la fuente oficial. <a href="/admin">Administración</a></footer>
  </main>;
}
