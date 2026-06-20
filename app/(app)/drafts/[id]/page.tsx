import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentAnalyticsForm } from "@/components/content-analytics-form";
import { DeleteButton } from "@/components/delete-button";
import { DraftThreadEditor } from "@/components/draft-thread-editor";
import { PageHeader } from "@/components/page-header";
import { PipelineRunDetails } from "@/components/pipeline-run-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteDraft,
  recordDraftAnalytics,
  restoreDraftVersion,
  rewriteDraftWithAgent,
  updateDraftThread
} from "@/lib/actions/drafts";
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
      },
      versions: {
        orderBy: { version: "desc" }
      },
      analytics: {
        orderBy: { recordedAt: "desc" }
      }
    }
  });

  if (!draft) {
    notFound();
  }

  const latestAnalytics = draft.analytics[0];
  const latestEngagements = latestAnalytics
    ? latestAnalytics.likes + latestAnalytics.comments + latestAnalytics.shares + latestAnalytics.saves
    : 0;
  const latestEngagementRate =
    latestAnalytics && latestAnalytics.views > 0
      ? `${((latestEngagements / latestAnalytics.views) * 100).toFixed(1)}%`
      : "0.0%";
  const analyticsDefaults = latestAnalytics
    ? {
        views: latestAnalytics.views,
        likes: latestAnalytics.likes,
        comments: latestAnalytics.comments,
        shares: latestAnalytics.shares,
        saves: latestAnalytics.saves,
        notes: ""
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={draft.idea?.title ?? "Draft"}
        description={`Created ${formatDate(draft.createdAt)} - Updated ${formatDate(draft.updatedAt)}`}
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
          <CardTitle>Content analytics</CardTitle>
          <CardDescription>
            Manually enter performance after publishing so ContentOS can compare what topics,
            hooks, and formats earn attention.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Views", value: latestAnalytics?.views ?? 0 },
              { label: "Engagements", value: latestEngagements },
              { label: "Saves", value: latestAnalytics?.saves ?? 0 },
              { label: "Engagement rate", value: latestEngagementRate }
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>

          <ContentAnalyticsForm
            defaultValues={analyticsDefaults}
            onSave={recordDraftAnalytics.bind(null, draft.id)}
          />

          {draft.analytics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No performance snapshots recorded yet.</p>
          ) : (
            <div className="grid gap-3">
              {draft.analytics.map((entry) => {
                const engagements = entry.likes + entry.comments + entry.shares + entry.saves;

                return (
                  <div key={entry.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium">Snapshot from {formatDate(entry.recordedAt)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {entry.views} views - {engagements} engagements - {entry.saves} saves
                        </p>
                      </div>
                      <Badge>
                        {entry.views > 0 ? `${((engagements / entry.views) * 100).toFixed(1)}%` : "0.0%"}
                      </Badge>
                    </div>
                    {entry.notes ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{entry.notes}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
          <CardTitle>Version history</CardTitle>
          <CardDescription>Saved snapshots created before each AI rewrite.</CardDescription>
        </CardHeader>
        <CardContent>
          {draft.versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rewrite versions saved yet.</p>
          ) : (
            <div className="grid gap-3">
              {draft.versions.map((version) => (
                <div key={version.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">Version {version.version}</p>
                        <Badge>{version.platform}</Badge>
                        <Badge>{version.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Saved {formatDate(version.createdAt)}
                      </p>
                    </div>
                    <form action={restoreDraftVersion.bind(null, draft.id, version.id)}>
                      <Button type="submit" variant="outline" size="sm">
                        Restore
                      </Button>
                    </form>
                  </div>
                  {version.rewriteNotes ? (
                    <div className="mt-3">
                      <p className="text-xs font-medium uppercase text-muted-foreground">Rewrite request</p>
                      <p className="mt-1 text-sm text-muted-foreground">{version.rewriteNotes}</p>
                    </div>
                  ) : null}
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm">{version.content}</p>
                </div>
              ))}
            </div>
          )}
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
