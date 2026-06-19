import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AgentRunsPage() {
  const runs = await prisma.agentRun.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agentConfig: true,
      idea: true,
      draft: true
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent runs"
        description="Local execution history for manual tests and the controlled content pipeline."
      />

      {runs.length === 0 ? (
        <EmptyState
          title="No agent runs yet"
          description="Generate from an idea or run an agent manually to see inputs, outputs, model, temperature, and status here."
        />
      ) : (
        <div className="grid gap-3">
          {runs.map((run) => (
            <Card key={run.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold">{run.agentConfig?.name ?? run.agentName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(run.createdAt)}
                      {run.model ? ` · ${run.model}` : ""}
                      {run.temperature !== null ? ` · temp ${run.temperature}` : ""}
                    </p>
                    {run.idea ? <p className="mt-1 text-sm text-muted-foreground">Idea: {run.idea.title}</p> : null}
                    {run.errorMessage ? (
                      <p className="mt-2 text-sm text-destructive">{run.errorMessage}</p>
                    ) : null}
                  </div>
                  <Badge>{run.status}</Badge>
                </div>

                <details className="rounded-lg border bg-muted/30 p-3">
                  <summary className="cursor-pointer text-sm font-medium">View run details</summary>
                  <div className="mt-3 grid gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Input</p>
                      <pre className="mt-1 max-h-72 overflow-auto rounded-md bg-background p-3 text-xs">
                        {run.inputJson}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Output</p>
                      <pre className="mt-1 max-h-72 overflow-auto rounded-md bg-background p-3 text-xs">
                        {run.outputJson}
                      </pre>
                    </div>
                    {run.errorMessage ? (
                      <div>
                        <p className="text-xs font-medium uppercase text-muted-foreground">Error</p>
                        <pre className="mt-1 max-h-72 overflow-auto rounded-md bg-background p-3 text-xs text-destructive">
                          {run.errorMessage}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
