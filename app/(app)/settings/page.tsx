import { AiProviderForm } from "@/components/ai-provider-form";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createAiProviderConfig,
  deleteAiProviderConfig,
  updateAiProviderConfig
} from "@/lib/actions/ai-provider-configs";
import { aiProviderPresets } from "@/lib/constants";
import { maskApiKey } from "@/lib/ai/openai-compatible";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const aiProviders = await prisma.aiProviderConfig.findMany({
    orderBy: [
      {
        isDefault: "desc"
      },
      {
        createdAt: "asc"
      }
    ]
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage local API providers, default models, and app preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add API provider</CardTitle>
          <CardDescription>
            Add OpenAI GPT or another OpenAI-compatible API endpoint for future agents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiProviderForm
            submitLabel="Save provider"
            apiKeyHint="sk-..."
            onSubmit={createAiProviderConfig}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Saved API providers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            API keys are stored locally in your SQLite database for this personal app.
          </p>
        </div>

        {aiProviders.length === 0 ? (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                No API providers are configured yet. Add one above to make ContentOS ready for GPT
                and model-specific agent calls.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {aiProviders.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{provider.name}</CardTitle>
                      <CardDescription>
                        {aiProviderPresets[
                          provider.provider as keyof typeof aiProviderPresets
                        ]?.label ?? provider.provider}{" "}
                        · {provider.defaultModel} · {maskApiKey(provider.apiKey)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {provider.isDefault ? <Badge>default</Badge> : null}
                      <Badge>{provider.isEnabled ? "enabled" : "disabled"}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <AiProviderForm
                    defaultValues={{
                      name: provider.name,
                      provider: provider.provider as keyof typeof aiProviderPresets,
                      baseUrl: provider.baseUrl,
                      apiKey: "",
                      defaultModel: provider.defaultModel,
                      temperature: provider.temperature,
                      isDefault: provider.isDefault,
                      isEnabled: provider.isEnabled
                    }}
                    submitLabel="Update provider"
                    apiKeyHint="Leave blank to keep current key"
                    onSubmit={updateAiProviderConfig.bind(null, provider.id)}
                  />
                  <div className="flex justify-end">
                    <DeleteButton
                      label="API provider"
                      onDelete={deleteAiProviderConfig.bind(null, provider.id)}
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
