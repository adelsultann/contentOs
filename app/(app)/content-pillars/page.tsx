import { DeleteButton } from "@/components/delete-button";
import { ContentPillarForm } from "@/components/content-pillar-form";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createContentPillar,
  deleteContentPillar,
  updateContentPillar
} from "@/lib/actions/content-pillars";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function ContentPillarsPage() {
  const contentPillars = await prisma.contentPillar.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { ideas: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Pillars"
        description="Group ideas by durable themes so your pipeline stays focused."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add content pillar</CardTitle>
          <CardDescription>Create a reusable theme for ideas, drafts, and planning filters.</CardDescription>
        </CardHeader>
        <CardContent>
          <ContentPillarForm submitLabel="Create pillar" onSubmit={createContentPillar} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Saved pillars</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Editing a pillar updates every idea and draft filter that uses it.
          </p>
        </div>

        {contentPillars.length === 0 ? (
          <EmptyState
            title="No content pillars yet"
            description="Add one above, then assign captured ideas to it from the idea form."
          />
        ) : (
          <div className="grid gap-4">
            {contentPillars.map((pillar) => (
              <Card key={pillar.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{pillar.name}</CardTitle>
                      <CardDescription>Created {formatDate(pillar.createdAt)}</CardDescription>
                    </div>
                    <Badge>{pillar._count.ideas} ideas</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ContentPillarForm
                    defaultValues={{
                      name: pillar.name,
                      description: pillar.description
                    }}
                    submitLabel="Update pillar"
                    onSubmit={updateContentPillar.bind(null, pillar.id)}
                  />
                  <div className="flex justify-end">
                    <DeleteButton
                      label="content pillar"
                      onDelete={deleteContentPillar.bind(null, pillar.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
