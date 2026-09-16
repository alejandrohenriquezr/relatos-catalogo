import { NextRequest, NextResponse } from "next/server";

const table = `CREATE TABLE IF NOT EXISTS statistical_operation_config (operation TEXT PRIMARY KEY, label TEXT NOT NULL, analysis TEXT NOT NULL DEFAULT 'on', publications TEXT NOT NULL DEFAULT 'off', documentation TEXT NOT NULL DEFAULT 'off', databases TEXT NOT NULL DEFAULT 'off', resources TEXT NOT NULL DEFAULT 'off', updated_at TEXT NOT NULL, updated_by TEXT NOT NULL)`;

export async function PUT(request: NextRequest) {
  // La persistencia institucional se resuelve en FastAPI/PostgreSQL mediante
  // el adaptador interno instalado por el Worker.
  const db = (globalThis as typeof globalThis & { __SITES_DB?: D1Database }).__SITES_DB;
  if (!db) return NextResponse.json({ error: "PostgreSQL no está disponible mediante FastAPI." }, { status: 503 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const operation = String(body.operation ?? "");
    const label = String(body.label ?? operation);
    if (!operation) return NextResponse.json({ error: "Operación inválida" }, { status: 400 });
    await db.prepare(table).run();
    const onOff = (key: string, fallback: boolean) => body[key] === undefined ? fallback ? "on" : "off" : body[key] ? "on" : "off";
    const now = new Date().toISOString();
    await db.prepare("INSERT INTO statistical_operation_config (operation,label,analysis,publications,documentation,databases,resources,updated_at,updated_by) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(operation) DO UPDATE SET label=excluded.label,analysis=excluded.analysis,publications=excluded.publications,documentation=excluded.documentation,databases=excluded.databases,resources=excluded.resources,updated_at=excluded.updated_at,updated_by=excluded.updated_by")
      .bind(operation, label, onOff("analysis", true), onOff("publications", false), onOff("documentation", false), onOff("databases", false), onOff("resources", false), now, "site-owner").run();
    return NextResponse.json({ ok: true, operation, updatedAt: now });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error de persistencia en PostgreSQL" }, { status: 500 });
  }
}
