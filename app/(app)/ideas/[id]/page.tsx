import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { GenerateDraftButton } from "@/components/generate-draft-button";
import { IdeaForm } from "@/components/idea-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAnglesForIdea, generateDraftFromIdea } from "@/lib/actions/generate-draft-from-idea";
import { deleteIdea, updateIdea } from "@/lib/actions/ideas";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [idea, contentPillars] = await Promise.all([
    prisma.idea.findUnique({
      where: { id },
      include: {
        contentPillar: true,
        drafts: {
          orderBy: { updatedAt: "desc" }
        },
        agentRuns: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    }),
    prisma.contentPillar.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  if (!idea) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={idea.title}
        description={`Created ${formatDate(idea.createdAt)} - Updated ${formatDate(idea.updatedAt)}`}
        actions={<DeleteButton label="idea" onDelete={deleteIdea.bind(null, idea.id)} />}
      />

      <div className="flex flex-wrap gap-2">
        <Badge>{idea.status}</Badge>
        <Badge>{idea.priority}</Badge>
        <Badge>{idea.contentPillar?.name ?? "no pillar"}</Badge>
        <Badge>{idea.topic || "no topic"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent pipeline</CardTitle>
          <CardDescription>
            Score the raw idea, generate three angles, then draft from the selected angle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateDraftButton
            onGenerateAngles={generateAnglesForIdea.bind(null, idea.id)}
            onGenerate={generateDraftFromIdea.bind(null, idea.id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit idea</CardTitle>
          <CardDescription>Keep the idea clear enough for future draft generation.</CardDescription>
        </CardHeader>
        <CardContent>
          <IdeaForm
            defaultValues={{
              title: idea.title,
              rawInput: idea.rawInput,
              topic: idea.topic,
              contentPillarId: idea.contentPillarId ?? "",
              status: idea.status as "captured" | "researching" | "ready" | "archived",
              priority: idea.priority as "low" | "medium" | "high"
            }}
            contentPillars={contentPillars}
            onSubmit={updateIdea.bind(null, idea.id)}
            submitLabel="Save idea"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Drafts from this idea</CardTitle>
          <CardDescription>Generated or manually created drafts connected to this idea.</CardDescription>
        </CardHeader>
        <CardContent>
          {idea.drafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No drafts are connected to this idea yet.</p>
          ) : (
            <div className="divide-y">
              {idea.drafts.map((draft) => (
                <Link key={draft.id} href={`/drafts/${draft.id}`} className="block py-3 hover:bg-muted/50">
                  <div className="flex items-center justify-between gap-3">
                    <p className="line-clamp-1 text-sm">{draft.content}</p>
                    <Badge>{draft.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {draft.platform} - {formatDate(draft.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
