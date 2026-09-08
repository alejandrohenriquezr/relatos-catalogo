import { NextResponse } from "next/server";
import { defaults, rowToConfig } from "../../../lib/operation-config";

const table = `CREATE TABLE IF NOT EXISTS statistical_operation_config (operation TEXT PRIMARY KEY, label TEXT NOT NULL, analysis TEXT NOT NULL DEFAULT 'on', publications TEXT NOT NULL DEFAULT 'off', documentation TEXT NOT NULL DEFAULT 'off', databases TEXT NOT NULL DEFAULT 'off', resources TEXT NOT NULL DEFAULT 'off', updated_at TEXT NOT NULL, updated_by TEXT NOT NULL)`;

async function db() {
  const value = (globalThis as typeof globalThis & { __SITES_DB?: D1Database }).__SITES_DB;
  if (!value) throw new Error("La caché compartida no está disponible");
  await value.prepare(table).run();
  return value;
}

export async function GET() {
  try {
    const database = await db();
    const result = await database.prepare("SELECT * FROM statistical_operation_config ORDER BY operation").all<Record<string, unknown>>();
    const byOperation = new Map(result.results.map((row) => [String(row.operation), rowToConfig(row)]));
    return NextResponse.json(defaults().map((item) => byOperation.get(item.operation) ?? item), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(defaults(), { headers: { "Cache-Control": "no-store", "X-Config-Source": "defaults" } });
  }
}
