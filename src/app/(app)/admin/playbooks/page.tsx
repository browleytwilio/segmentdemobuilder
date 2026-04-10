import { getAdminPlaybooks } from "../actions";
import { PlaybooksTable } from "./playbooks-table";

interface AdminPlaybooksPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminPlaybooksPage({ searchParams }: AdminPlaybooksPageProps) {
  const params = await searchParams;
  const { data, total, error } = await getAdminPlaybooks({
    industry: params.industry,
    status: params.status,
    q: params.q,
    limit: 50,
    offset: params.offset ? Number(params.offset) : 0,
  });

  return <PlaybooksTable playbooks={data} total={total} error={error} />;
}
