import sources from "../public/catalog/publication-sources.json";

export type PublicationSource = {
  operations: string[];
  label: string;
  publicationTitle: string;
  publicationUrl: string;
  dataUrl: string;
  publicationDate: string | null;
  sourceHash: string | null;
  checkedAt: string | null;
};

export type PublicationCacheRecord = Omit<PublicationSource, "publicationDate" | "sourceHash" | "checkedAt"> & {
  publicationDate: string | null;
  sourceHash: string | null;
  checkedAt: string;
};

// Calcula un hash estable para detectar cambios en los archivos oficiales.
async function sha256(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

// Consulta la página y el archivo oficial sin inventar fechas editoriales.
export async function refreshPublicationSources(): Promise<PublicationCacheRecord[]> {
  const checkedAt = new Date().toISOString();
  return Promise.all(
    (sources as PublicationSource[]).map(async (source) => {
      const page = await fetch(source.publicationUrl, { cache: "no-store" });
      const data = await fetch(source.dataUrl, { cache: "no-store" });
      if (!page.ok || !data.ok) {
        throw new Error(`No fue posible consultar la fuente de ${source.label}`);
      }
      const httpDate = page.headers.get("date");
      const bytes = await data.arrayBuffer();
      return {
        ...source,
        publicationDate: httpDate ? new Date(httpDate).toISOString() : null,
        publicationDateSource: "http-date" as const,
        sourceHash: await sha256(bytes),
        checkedAt,
      };
    }),
  );
}
