import Link from "next/link";
import { FileText, Lightbulb, PlayCircle, Send } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [totalIdeas, totalDrafts, readyDrafts, agentRuns, recentIdeas, recentDrafts] = await Promise.all([
    prisma.idea.count(),
    prisma.draft.count(),
    prisma.draft.count({ where: { status: "ready" } }),
    prisma.agentRun.count(),
    prisma.idea.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.draft.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { idea: true }
    })
  ]);

  const stats = [
    { label: "Total ideas", value: totalIdeas, icon: Lightbulb },
    { label: "Total drafts", value: totalDrafts, icon: FileText },
    { label: "Ready drafts", value: readyDrafts, icon: Send },
    { label: "Agent runs", value: agentRuns, icon: PlayCircle }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your local command center for ideas, drafts, style, and future agent runs."
        actions={
          <Button asChild>
            <Link href="/ideas/new">Capture idea</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent ideas</CardTitle>
          </CardHeader>
          <CardContent>
            {recentIdeas.length === 0 ? (
              <EmptyState
                title="No ideas yet"
                description="Capture a rough thought and ContentOS will keep it ready for future drafting."
                action={
                  <Button asChild size="sm">
                    <Link href="/ideas/new">Add idea</Link>
                  </Button>
                }
              />
            ) : (
              <div className="divide-y">
                {recentIdeas.map((idea) => (
                  <Link key={idea.id} href={`/ideas/${idea.id}`} className="block py-3 hover:bg-muted/50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{idea.title}</p>
                      <Badge>{idea.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(idea.createdAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent drafts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDrafts.length === 0 ? (
              <EmptyState
                title="No drafts yet"
                description="Drafts will appear here after you create or generate content from ideas."
              />
            ) : (
              <div className="divide-y">
                {recentDrafts.map((draft) => (
                  <Link key={draft.id} href={`/drafts/${draft.id}`} className="block py-3 hover:bg-muted/50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 font-medium">{draft.idea?.title ?? "Untitled draft"}</p>
                      <Badge>{draft.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {draft.platform} · {formatDate(draft.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
