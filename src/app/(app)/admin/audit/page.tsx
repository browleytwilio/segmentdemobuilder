import { getAuditLog } from "../actions";
import { AuditLog } from "./audit-log";

export default async function AdminAuditPage() {
  const { data, error } = await getAuditLog(200);
  return <AuditLog entries={data} error={error} />;
}
