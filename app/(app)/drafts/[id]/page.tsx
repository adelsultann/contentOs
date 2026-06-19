import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { DraftForm } from "@/components/draft-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteDraft, updateDraft } from "@/lib/actions/drafts";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await prisma.draft.findUnique({
    where: { id },
    include: {
      idea: true,
      agentRuns: {
        orderBy: { createdAt: "desc" },
        take: 5
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
          <CardDescription>Refine the post content and mark it ready when it is usable.</CardDescription>
        </CardHeader>
        <CardContent>
          <DraftForm
            defaultValues={{
              platform: draft.platform as "x" | "X" | "linkedin" | "newsletter" | "other",
              content: draft.content,
              status: draft.status as "draft" | "ready" | "needs_edit" | "published" | "archived"
            }}
            onSubmit={updateDraft.bind(null, draft.id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent history</CardTitle>
          <CardDescription>Past automation attempts connected to this draft.</CardDescription>
        </CardHeader>
        <CardContent>
          {draft.agentRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agent runs are connected to this draft yet.</p>
          ) : (
            <div className="divide-y">
              {draft.agentRuns.map((run) => (
                <div key={run.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{run.agentName}</p>
                    <Badge>{run.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(run.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
