import Link from "next/link";
import { Filter, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type DraftsSearchParams = {
  pillar?: string;
};

export default async function DraftsPage({
  searchParams
}: {
  searchParams: Promise<DraftsSearchParams>;
}) {
  const filters = await searchParams;
  const selectedPillar = filters.pillar ?? "";
  const where =
    selectedPillar === "unassigned"
      ? {
          OR: [{ idea: { is: { contentPillarId: null } } }, { idea: null }]
        }
      : selectedPillar
        ? { idea: { is: { contentPillarId: selectedPillar } } }
        : {};

  const [drafts, contentPillars] = await Promise.all([
    prisma.draft.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: { idea: { include: { contentPillar: true } } }
    }),
    prisma.contentPillar.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, _count: { select: { ideas: true } } }
    })
  ]);

  const hasFilters = Boolean(selectedPillar);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drafts"
        description="Review and refine content drafts before they are ready to post."
      />

      <Card>
        <CardContent className="p-5">
          <form action="/drafts" className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Content pillar</span>
              <Select name="pillar" defaultValue={selectedPillar}>
                <option value="">All pillars</option>
                <option value="unassigned">No pillar</option>
                {contentPillars.map((pillar) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.name} ({pillar._count.ideas})
                  </option>
                ))}
              </Select>
            </label>
            <Button type="submit">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            {hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/drafts">
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {drafts.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No drafts match this pillar" : "No drafts yet"}
          description={
            hasFilters
              ? "Clear the filter to return to every draft."
              : "Drafts will live here once you create them from ideas or connect future agents."
          }
        />
      ) : (
        <div className="grid gap-3">
          {drafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="p-5">
                <Link href={`/drafts/${draft.id}`} className="block">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold">{draft.idea?.title ?? "Standalone draft"}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {draft.platform} - Updated {formatDate(draft.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{draft.idea?.contentPillar?.name ?? "no pillar"}</Badge>
                      <Badge>{draft.status}</Badge>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {draft.content}
                  </p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
