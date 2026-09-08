"use client";

import SectionHeader, { type SiteDestination } from "./SectionHeader";
import { useEffect, useRef, useState } from "react";

type BusinessDemographyPageProps = {
  onNavigate: (destination: SiteDestination) => void;
};

// Presenta la copia local del análisis para mantenerlo dentro del mismo sitio.
export default function BusinessDemographyPage({
  onNavigate,
}: BusinessDemographyPageProps) {
  // Ajusta la altura al documento migrado para que el navegador no cree un
  // segundo scroll vertical dentro del iframe.
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = useState("100vh");
  useEffect(() => {
    const resize = () => {
      const documentBody = frameRef.current?.contentDocument?.body;
      const documentRoot = frameRef.current?.contentDocument?.documentElement;
      const height = Math.max(documentBody?.scrollHeight ?? 0, documentRoot?.scrollHeight ?? 0);
      if (height > 0) setFrameHeight(`${height}px`);
    };
    const frame = frameRef.current;
    frame?.addEventListener("load", resize);
    return () => frame?.removeEventListener("load", resize);
  }, []);
  return (
    <main className="business-demography-page">
      <SectionHeader current="businessDemography" onNavigate={onNavigate} />
      {/* El contenido migrado oculta internamente presentación, publicaciones y documentación. */}
      <section className="business-demography-frame" aria-label="Análisis de resultados">
        <iframe
          ref={frameRef}
          src="/demografia-empresas/index.html"
          style={{ height: frameHeight }}
          title="Análisis de resultados: Demografía de empresas"
        />
      </section>
    </main>
  );
}
