import {NextRequest, NextResponse} from "next/server";
import {refreshPublicationSources} from "../../../../lib/publication-cache";

type CacheRow = {
  id: string;
  payload: string;
  checked_at: string;
};

// Sirve la caché primero y solo consulta ine.gob.cl cuando se solicita refresh=1.
export async function GET(request: NextRequest) {
  const db = (globalThis as typeof globalThis & {__SITES_DB?: D1Database}).__SITES_DB;
  if (!db) {
    return NextResponse.json({error: "La caché pública no está disponible"}, {status: 503});
  }

  await db.prepare(
    "CREATE TABLE IF NOT EXISTS catalog_publications_v1 (id TEXT PRIMARY KEY, payload TEXT NOT NULL, checked_at TEXT NOT NULL)",
  ).run();

  const refresh = request.nextUrl.searchParams.get("refresh") === "1";
  const cached = await db.prepare(
    "SELECT id, payload, checked_at FROM catalog_publications_v1 WHERE id = 'all'",
  ).first<CacheRow>();

  if (cached && !refresh) {
    return NextResponse.json({
      publications: JSON.parse(cached.payload),
      source: "cache",
      checkedAt: cached.checked_at,
    });
  }

  const publications = await refreshPublicationSources();
  const checkedAt = new Date().toISOString();
  await db.prepare(
    "INSERT INTO catalog_publications_v1 (id, payload, checked_at) VALUES ('all', ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, checked_at = excluded.checked_at",
  ).bind(JSON.stringify(publications), checkedAt).run();

  return NextResponse.json({publications, source: "updated", checkedAt});
}
