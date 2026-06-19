import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { DraftThreadEditor } from "@/components/draft-thread-editor";
import { PageHeader } from "@/components/page-header";
import { PipelineRunDetails } from "@/components/pipeline-run-details";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteDraft, rewriteDraftWithAgent, updateDraftThread } from "@/lib/actions/drafts";
import { splitDraftContent } from "@/lib/draft-posts";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await prisma.draft.findUnique({
    where: { id },
    include: {
      idea: true,
      posts: {
        orderBy: { position: "asc" }
      },
      agentRuns: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!draft) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={draft.idea?.title ?? "Draft"}
        description={`Created ${formatDate(draft.createdAt)} · Updated ${formatDate(draft.updatedAt)}`}
        actions={<DeleteButton label="draft" onDelete={deleteDraft.bind(null, draft.id)} />}
      />

      <div className="flex flex-wrap gap-2">
        <Badge>{draft.platform}</Badge>
        <Badge>{draft.status}</Badge>
        {draft.idea ? (
          <Link className="text-sm font-medium text-primary hover:underline" href={`/ideas/${draft.idea.id}`}>
            View source idea
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit draft</CardTitle>
          <CardDescription>Edit the final post or expand it into a multi-post X thread.</CardDescription>
        </CardHeader>
        <CardContent>
          <DraftThreadEditor
            defaultValues={{
              platform: draft.platform as "x" | "X" | "linkedin" | "newsletter" | "other",
              status: draft.status as "draft" | "ready" | "needs_edit" | "published" | "archived",
              posts:
                draft.posts.length > 0
                  ? draft.posts.map((post) => ({ content: post.content }))
                  : splitDraftContent(draft.content).map((content) => ({ content }))
            }}
            onSave={updateDraftThread.bind(null, draft.id)}
            onRewrite={rewriteDraftWithAgent.bind(null, draft.id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent pipeline details</CardTitle>
          <CardDescription>What each agent produced while generating this draft.</CardDescription>
        </CardHeader>
        <CardContent>
          <PipelineRunDetails runs={draft.agentRuns} />
        </CardContent>
      </Card>
    </div>
  );
}
