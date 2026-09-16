/**
 * Adaptador de la interfaz D1 usada por las rutas Vinext hacia FastAPI.
 *
 * El frontend no abre conexiones de base de datos. Cada sentencia estática se
 * envía al endpoint interno autenticado y FastAPI la ejecuta en PostgreSQL.
 * Las sentencias DDL históricas se ignoran porque Alembic es el único dueño
 * del esquema en la versión institucional.
 */

type QueryMode = "run" | "first" | "all";

type GatewayResponse = {
  results?: Record<string, unknown>[];
  changes?: number;
};

class PostgresStatement {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly sql: string,
    private readonly values: unknown[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new PostgresStatement(this.baseUrl, this.token, this.sql, values);
  }

  private isLegacyDdl() {
    return /^\s*(CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS|ALTER\s+TABLE)\b/i.test(this.sql);
  }

  private async execute(mode: QueryMode): Promise<GatewayResponse> {
    // Las tablas son creadas y modificadas exclusivamente mediante Alembic.
    if (this.isLegacyDdl()) return { results: [], changes: 0 };

    const response = await fetch(`${this.baseUrl}/internal/database`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-token": this.token,
      },
      body: JSON.stringify({ sql: this.sql, params: this.values, mode }),
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`PostgreSQL gateway ${response.status}: ${detail.slice(0, 500)}`);
    }
    return response.json() as Promise<GatewayResponse>;
  }

  async run() {
    const response = await this.execute("run");
    return { success: true, meta: { changes: response.changes ?? 0 } };
  }

  async first<T = Record<string, unknown>>() {
    const response = await this.execute("first");
    return (response.results?.[0] ?? null) as T | null;
  }

  async all<T = Record<string, unknown>>() {
    const response = await this.execute("all");
    return { results: (response.results ?? []) as T[] };
  }
}

class PostgresDatabase {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  prepare(sql: string) {
    return new PostgresStatement(this.baseUrl, this.token, sql);
  }
}

/** Crea el cliente remoto compatible con las rutas que antes usaban D1. */
export function createPostgresDatabase(baseUrl: string, token: string): D1Database {
  if (!baseUrl || !token) {
    throw new Error("INTERNAL_API_BASE_URL e INTERNAL_API_TOKEN son obligatorios.");
  }
  return new PostgresDatabase(baseUrl.replace(/\/+$/, ""), token) as unknown as D1Database;
}
