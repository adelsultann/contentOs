import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AgentsPage() {
  const agents = await prisma.agentConfig.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      providerConfig: true,
      _count: {
        select: { runs: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Create reusable agents with their own prompts, models, and provider settings."
        actions={
          <Button asChild>
            <Link href="/agents/new">
              <Plus className="mr-2 h-4 w-4" />
              New agent
            </Link>
          </Button>
        }
      />

      {agents.length === 0 ? (
        <EmptyState
          title="No agents configured"
          description="Create your first agent, then later you can connect it to ideas, drafts, and multi-agent workflows."
          action={
            <Button asChild>
              <Link href="/agents/new">Create first agent</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardContent className="p-5">
                <Link href={`/agents/${agent.id}`} className="block">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold">{agent.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {agent.providerConfig?.name ?? "Default provider"} ·{" "}
                        {agent.model || agent.providerConfig?.defaultModel || "provider default"} ·{" "}
                        {formatDate(agent.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{agent.role}</Badge>
                      <Badge>{agent.isEnabled ? "enabled" : "disabled"}</Badge>
                      <Badge>{agent._count.runs} runs</Badge>
                    </div>
                  </div>
                  {agent.description ? (
                    <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{agent.description}</p>
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
