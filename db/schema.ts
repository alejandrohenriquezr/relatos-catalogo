import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const economicSourceCache = sqliteTable("economic_source_cache", {
  kind: text("kind").primaryKey(),
  sourceUrl: text("source_url").notNull(),
  sourceLastModified: text("source_last_modified"),
  sourceEtag: text("source_etag"),
  sourceSize: text("source_size"),
  payloadJson: text("payload_json").notNull(),
  checkedAt: text("checked_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Configuración editorial controlada por el CMS para cada operación estadística.
export const statisticalOperationConfig = sqliteTable("statistical_operation_config", {
  operation: text("operation").primaryKey(),
  label: text("label").notNull(),
  analysis: text("analysis").notNull().default("on"),
  publications: text("publications").notNull().default("off"),
  documentation: text("documentation").notNull().default("off"),
  databases: text("databases").notNull().default("off"),
  resources: text("resources").notNull().default("off"),
  updatedAt: text("updated_at").notNull(),
  updatedBy: text("updated_by").notNull(),
});
