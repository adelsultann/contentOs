import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DraftsPage() {
  const drafts = await prisma.draft.findMany({
    orderBy: { updatedAt: "desc" },
    include: { idea: true }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drafts"
        description="Review and refine content drafts before they are ready to post."
      />

      {drafts.length === 0 ? (
        <EmptyState
          title="No drafts yet"
          description="Drafts will live here once you create them from ideas or connect future agents."
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
                        {draft.platform} · Updated {formatDate(draft.updatedAt)}
                      </p>
                    </div>
                    <Badge>{draft.status}</Badge>
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
