import Link from "next/link";
import { Edit3, Plus } from "lucide-react";
import { IdeaInboxForm } from "@/components/idea-inbox-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureInboxIdea } from "@/lib/actions/ideas";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function IdeaInboxPage() {
  const inboxIdeas = await prisma.idea.findMany({
    where: {
      status: "captured",
      priority: "medium",
      contentPillarId: null
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      _count: {
        select: { drafts: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Idea Inbox"
        description="Dump rough thoughts quickly, then organize them when you have more context."
        actions={
          <Button asChild variant="outline">
            <Link href="/ideas/new">
              <Plus className="mr-2 h-4 w-4" />
              Full idea form
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Fast capture</CardTitle>
          <CardDescription>No title, tags, or priority needed yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <IdeaInboxForm onSubmit={captureInboxIdea} />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Recent inbox ideas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Captured ideas with no pillar, medium priority, and captured status.
          </p>
        </div>

        {inboxIdeas.length === 0 ? (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">No inbox ideas yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {inboxIdeas.map((idea) => (
              <Card key={idea.id}>
                <CardContent className="p-5">
                  <Link href={`/ideas/${idea.id}`} className="block">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-medium">{idea.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{formatDate(idea.createdAt)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{idea.status}</Badge>
                        <Badge>{idea.priority}</Badge>
                        <Badge>{idea._count.drafts} drafts</Badge>
                      </div>
                    </div>
                    {idea.rawInput ? (
                      <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{idea.rawInput}</p>
                    ) : null}
                    <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Organize idea
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
