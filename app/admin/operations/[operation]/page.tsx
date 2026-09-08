import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../chatgpt-auth";
import { defaults } from "../../../../lib/operation-config";
import OperationEditor from "./OperationEditor";

export default async function OperationAdminPage({ params }: { params: Promise<{ operation: string }> }) {
  await requireChatGPTUser("/admin");
  const { operation } = await params;
  const config = defaults().find((item) => item.operation === operation);
  if (!config) notFound();
  return <main className="admin-shell"><a href="/admin">← Volver al CMS</a><h1>{config.label}</h1><p>Define las secciones que el administrador editorial puede publicar para esta operación.</p><OperationEditor config={config} /></main>;
}
