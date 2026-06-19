import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function IdeasPage() {
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { drafts: true, agentRuns: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ideas"
        description="Capture raw thoughts before they become drafts."
        actions={
          <Button asChild>
            <Link href="/ideas/new">
              <Plus className="mr-2 h-4 w-4" />
              New idea
            </Link>
          </Button>
        }
      />

      {ideas.length === 0 ? (
        <EmptyState
          title="No ideas captured"
          description="Start with a rough note, topic, or thought. It does not need to be polished yet."
          action={
            <Button asChild>
              <Link href="/ideas/new">Capture your first idea</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {ideas.map((idea) => (
            <Card key={idea.id}>
              <CardContent className="p-5">
                <Link href={`/ideas/${idea.id}`} className="block">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold">{idea.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {idea.topic || "No topic"} · {formatDate(idea.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{idea.status}</Badge>
                      <Badge>{idea.priority}</Badge>
                      <Badge>{idea._count.drafts} drafts</Badge>
                    </div>
                  </div>
                  {idea.rawInput ? (
                    <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{idea.rawInput}</p>
                  ) : null}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
