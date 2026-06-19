import { notFound } from "next/navigation";
import { AgentForm } from "@/components/agent-form";
import { AgentRunForm } from "@/components/agent-run-form";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAgentConfig, updateAgentConfig } from "@/lib/actions/agent-configs";
import { runAgentConfig } from "@/lib/actions/agent-runs";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [agent, providers] = await Promise.all([
    prisma.agentConfig.findUnique({
      where: { id },
      include: {
        providerConfig: true,
        runs: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    }),
    prisma.aiProviderConfig.findMany({
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "asc" }
      ],
      select: {
        id: true,
        name: true,
        defaultModel: true,
        isEnabled: true
      }
    })
  ]);

  if (!agent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={agent.name}
        description={`Updated ${formatDate(agent.updatedAt)}`}
        actions={<DeleteButton label="agent" onDelete={deleteAgentConfig.bind(null, agent.id)} />}
      />

      <div className="flex flex-wrap gap-2">
        <Badge>{agent.role}</Badge>
        <Badge>{agent.isEnabled ? "enabled" : "disabled"}</Badge>
        <Badge>{agent.providerConfig?.name ?? "default provider"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run this agent</CardTitle>
          <CardDescription>Send a manual test input using this agent prompt and model settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <AgentRunForm onRun={runAgentConfig.bind(null, agent.id)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit agent</CardTitle>
          <CardDescription>Adjust this agent prompt, model routing, and output rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <AgentForm
            providers={providers}
            defaultValues={{
              name: agent.name,
              description: agent.description,
              role: agent.role as "strategist" | "writer" | "editor" | "critic" | "formatter" | "custom",
              goal: agent.goal,
              systemPrompt: agent.systemPrompt,
              outputFormat: agent.outputFormat,
              providerConfigId: agent.providerConfigId ?? "",
              model: agent.model ?? "",
              temperature: agent.temperature ?? "",
              isEnabled: agent.isEnabled
            }}
            submitLabel="Save agent"
            onSubmit={updateAgentConfig.bind(null, agent.id)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent runs</CardTitle>
          <CardDescription>Recent manual and future workflow executions for this agent.</CardDescription>
        </CardHeader>
        <CardContent>
          {agent.runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">This agent has no runs yet.</p>
          ) : (
            <div className="divide-y">
              {agent.runs.map((run) => (
                <div key={run.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{run.status}</p>
                    <Badge>{run.model ?? "default model"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(run.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
