"use client";

import { useState } from "react";
import type { OperationConfig } from "../../../../lib/operation-config";

export default function OperationEditor({ config }: { config: OperationConfig }) {
  const [state, setState] = useState(config);
  const [message, setMessage] = useState("");
  const sections: [keyof OperationConfig, string][] = [["analysis", "Análisis de resultados"], ["publications", "Publicaciones"], ["documentation", "Documentación"], ["databases", "Bases de datos"], ["resources", "Centro de recursos"]];
  async function save() {
    const response = await fetch("/api/admin/operations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(state) });
    const payload = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Configuración guardada." : String(payload.error ?? "No fue posible guardar la configuración."));
  }
  return <section className="admin-editor">{sections.map(([key, label]) => <label key={key}><input type="checkbox" checked={Boolean(state[key])} onChange={(event) => setState({ ...state, [key]: event.target.checked })} /> {label}</label>)}<button type="button" onClick={save}>Guardar configuración</button>{message && <p role="status">{message}</p>}</section>;
}
