import { notFound } from "next/navigation";
import { getPlaybookById } from "@/app/(app)/dashboard/actions";
import { PlaybookViewer } from "@/components/playbook/playbook-viewer";

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ playbook_id: string }>;
}) {
  const { playbook_id } = await params;
  const playbook = await getPlaybookById(playbook_id);

  if (!playbook) {
    notFound();
  }

  return <PlaybookViewer playbook={playbook} />;
}
