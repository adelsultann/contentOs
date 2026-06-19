import { prisma } from "@/lib/prisma";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionInput = {
  providerId?: string;
  model?: string;
  temperature?: number;
  messages: ChatMessage[];
};

type ChatCompletionResponse = {
  content: string;
  model?: string;
  raw: unknown;
};

type OpenAiCompatibleResponse = {
  model?: string;
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

export function maskApiKey(apiKey: string) {
  if (apiKey.length <= 8) {
    return "••••";
  }

  return `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}`;
}

export async function getDefaultAiProviderConfig() {
  return prisma.aiProviderConfig.findFirst({
    where: {
      isEnabled: true
    },
    orderBy: [
      {
        isDefault: "desc"
      },
      {
        createdAt: "asc"
      }
    ]
  });
}

export async function createOpenAiCompatibleChatCompletion({
  providerId,
  model,
  temperature,
  messages
}: ChatCompletionInput): Promise<ChatCompletionResponse> {
  const provider = providerId
    ? await prisma.aiProviderConfig.findUnique({ where: { id: providerId } })
    : await getDefaultAiProviderConfig();

  if (!provider || !provider.isEnabled) {
    throw new Error("No enabled AI provider is configured.");
  }

  const response = await fetch(`${normalizeBaseUrl(provider.baseUrl)}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model || provider.defaultModel,
      messages,
      temperature: temperature ?? provider.temperature
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI provider request failed: ${response.status} ${errorText}`);
  }

  const raw = (await response.json()) as OpenAiCompatibleResponse;
  const content = raw?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("AI provider returned an unsupported response shape.");
  }

  return {
    content,
    model: raw?.model,
    raw
  };
}
