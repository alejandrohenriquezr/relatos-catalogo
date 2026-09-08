import { requireChatGPTUser } from "../chatgpt-auth";
import { defaults } from "../../lib/operation-config";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const operations = defaults();
  return <main className="admin-shell"><h1>Configuración de Relatos Estadísticos</h1><p>Sesión: {user.displayName}</p><p>Esta configuración controla qué secciones quedan disponibles por operación. El análisis de resultados permanece activo por omisión.</p><section className="admin-grid">{operations.map((item) => <article className="admin-card" key={item.operation}><h2>{item.label}</h2><p><code>{item.operation}</code></p><a href={`/admin/operations/${item.operation}`}>Configurar secciones</a></article>)}</section></main>;
}
