import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPlaybookById } from "@/app/(app)/dashboard/actions";
import { getPlaybookComments } from "@/app/(app)/playbooks/actions";
import { PlaybookViewer } from "@/components/playbook/playbook-viewer";
import { CommentThread } from "@/components/playbook/comment-thread";
import { VisibilitySelector } from "@/components/playbook/visibility-selector";
import { ProfileInspector } from "@/components/playbook/profile-inspector";

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ playbook_id: string }>;
}) {
  const { playbook_id } = await params;
  const [playbook, comments, { userId }] = await Promise.all([
    getPlaybookById(playbook_id),
    getPlaybookComments(playbook_id),
    auth(),
  ]);

  if (!playbook) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Visibility control for owner */}
      <div className="max-w-5xl flex justify-end print:hidden">
        <VisibilitySelector
          playbookId={playbook_id}
          currentVisibility={playbook.visibility ?? "private"}
        />
      </div>

      <PlaybookViewer playbook={playbook} />

      {/* Profile Inspector — shown when Profile API is enabled */}
      {playbook.demo_config?.architecture?.enableProfileAPI && (
        <div className="max-w-5xl print:hidden">
          <ProfileInspector playbookId={playbook_id} />
        </div>
      )}

      {/* Comments section */}
      <div className="max-w-5xl pb-10 print:hidden">
        <CommentThread
          playbookId={playbook_id}
          comments={comments}
          currentUserId={userId}
        />
      </div>
    </div>
  );
}
