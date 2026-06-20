import Link from "next/link";
import { Filter, Plus, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ideaPriorities, ideaStatuses } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type IdeasSearchParams = {
  pillar?: string;
  status?: string;
  priority?: string;
};

export default async function IdeasPage({
  searchParams
}: {
  searchParams: Promise<IdeasSearchParams>;
}) {
  const filters = await searchParams;
  const selectedPillar = filters.pillar ?? "";
  const selectedStatus = ideaStatuses.includes(filters.status as (typeof ideaStatuses)[number])
    ? filters.status
    : "";
  const selectedPriority = ideaPriorities.includes(filters.priority as (typeof ideaPriorities)[number])
    ? filters.priority
    : "";

  const where = {
    ...(selectedPillar === "unassigned"
      ? { contentPillarId: null }
      : selectedPillar
        ? { contentPillarId: selectedPillar }
        : {}),
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(selectedPriority ? { priority: selectedPriority } : {})
  };

  const [ideas, contentPillars] = await Promise.all([
    prisma.idea.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        contentPillar: true,
        _count: {
          select: { drafts: true, agentRuns: true }
        }
      }
    }),
    prisma.contentPillar.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, _count: { select: { ideas: true } } }
    })
  ]);

  const hasFilters = Boolean(selectedPillar || selectedStatus || selectedPriority);

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

      <Card>
        <CardContent className="p-5">
          <form action="/ideas" className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
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
            <label className="grid gap-2">
              <span className="text-sm font-medium">Status</span>
              <Select name="status" defaultValue={selectedStatus}>
                <option value="">All statuses</option>
                {ideaStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Priority</span>
              <Select name="priority" defaultValue={selectedPriority}>
                <option value="">All priorities</option>
                {ideaPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
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
                <Link href="/ideas">
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {ideas.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No ideas match these filters" : "No ideas captured"}
          description={
            hasFilters
              ? "Adjust the filters or clear them to return to the full idea list."
              : "Start with a rough note, topic, or thought. It does not need to be polished yet."
          }
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
                        {idea.topic || "No topic"} - {formatDate(idea.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{idea.status}</Badge>
                      <Badge>{idea.priority}</Badge>
                      <Badge>{idea.contentPillar?.name ?? "no pillar"}</Badge>
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
