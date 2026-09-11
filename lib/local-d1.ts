/**
 * Adaptador mínimo de D1 sobre node:sqlite para el entorno Docker local.
 *
 * Las rutas públicas ya están escritas contra la interfaz de D1 de Sites.
 * Este adaptador conserva esa interfaz en local y persiste la caché en un
 * archivo SQLite montado en un volumen, sin cambiar el comportamiento de
 * producción cuando Sites entrega el binding real.
 */
type SqliteStatement = {
  run(...values: unknown[]): { changes?: number };
  get(...values: unknown[]): Record<string, unknown> | undefined;
  all(...values: unknown[]): Record<string, unknown>[];
};

type SqliteDatabase = {
  exec(sql: string): unknown;
  prepare(sql: string): SqliteStatement;
};

class LocalD1Statement {
  constructor(
    private readonly database: SqliteDatabase,
    private readonly sql: string,
    private readonly values: unknown[] = [],
  ) {}

  bind(...values: unknown[]) {
    return new LocalD1Statement(this.database, this.sql, values);
  }

  async run() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes ?? 0) } };
  }

  async first<T = Record<string, unknown>>() {
    return (this.database.prepare(this.sql).get(...this.values) ?? null) as T | null;
  }

  async all<T = Record<string, unknown>>() {
    return { results: this.database.prepare(this.sql).all(...this.values) as T[] };
  }
}

class LocalD1Database {
  constructor(private readonly database: SqliteDatabase) {}

  prepare(sql: string) {
    return new LocalD1Statement(this.database, sql);
  }
}

/** Abre o crea la caché local y la expone con la forma que esperan las rutas. */
export async function createLocalD1(filename: string): Promise<D1Database> {
  // La importación dinámica evita incluir módulos exclusivos de Node en el
  // bundle de Cloudflare; esta función solo se ejecuta en Docker/Vinext.
  const load = new Function(
    "return Promise.all([import('node:sqlite'), import('node:fs')])",
  ) as () => Promise<[
    { DatabaseSync: { new (filename: string): SqliteDatabase } },
    { mkdirSync(path: string, options: { recursive: boolean }): void },
  ]>;
  const [{ DatabaseSync }, fs] = await load();
  const slash = filename.lastIndexOf("/");
  if (slash > 0) fs.mkdirSync(filename.slice(0, slash), { recursive: true });
  const database = new DatabaseSync(filename);
  database.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;");
  return new LocalD1Database(database) as unknown as D1Database;
}
