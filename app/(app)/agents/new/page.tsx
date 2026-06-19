import { AgentForm } from "@/components/agent-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAgentConfig } from "@/lib/actions/agent-configs";
import { prisma } from "@/lib/prisma";

export default async function NewAgentPage() {
  const providers = await prisma.aiProviderConfig.findMany({
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
  });

  return (
    <div className="space-y-6">
      <PageHeader title="New agent" description="Define one reusable agent for your content workflow." />
      <Card>
        <CardHeader>
          <CardTitle>Agent setup</CardTitle>
          <CardDescription>
            Each agent can use the default API provider or override the provider, model, and temperature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentForm providers={providers} submitLabel="Create agent" onSubmit={createAgentConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
