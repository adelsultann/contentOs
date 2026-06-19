import { contentAgentModel } from "@/lib/agents/config";
import { getDefaultAiProviderConfig } from "@/lib/ai/openai-compatible";

type OpenAiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type CreateChatCompletionInput = {
  messages: OpenAiChatMessage[];
  model?: string;
  temperature: number;
};

type OpenAiChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
  model?: string;
};

function isUnsupportedTemperatureError(status: number, errorText: string) {
  return (
    status === 400 &&
    errorText.includes("temperature") &&
    errorText.includes("unsupported")
  );
}

async function requestJsonCompletion({
  apiKey,
  baseUrl,
  selectedModel,
  messages,
  temperature
}: {
  apiKey: string;
  baseUrl: string;
  selectedModel: string;
  messages: OpenAiChatMessage[];
  temperature?: number;
}) {
  const body: Record<string, unknown> = {
    model: selectedModel,
    messages,
    response_format: {
      type: "json_object"
    }
  };

  if (temperature !== undefined) {
    body.temperature = temperature;
  }

  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

export async function createOpenAiJsonChatCompletion({
  messages,
  model,
  temperature
}: CreateChatCompletionInput) {
  const savedProvider = process.env.OPENAI_API_KEY ? null : await getDefaultAiProviderConfig();
  const apiKey = process.env.OPENAI_API_KEY || savedProvider?.apiKey;
  const baseUrl = (savedProvider?.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  const selectedModel = model || process.env.OPENAI_MODEL || savedProvider?.defaultModel || contentAgentModel;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set and no saved default API provider is configured.");
  }

  let usedTemperature: number | null = temperature;
  let response = await requestJsonCompletion({
    apiKey,
    baseUrl,
    selectedModel,
    messages,
    temperature
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (isUnsupportedTemperatureError(response.status, errorText)) {
      usedTemperature = 1;
      response = await requestJsonCompletion({
        apiKey,
        baseUrl,
        selectedModel,
        messages
      });

      if (response.ok) {
        const retryJson = (await response.json()) as OpenAiChatCompletionResponse;
        const retryContent = retryJson.choices?.[0]?.message?.content;

        if (typeof retryContent !== "string") {
          throw new Error("OpenAI returned an unsupported response shape.");
        }

        return {
          content: retryContent,
          model: retryJson.model ?? selectedModel,
          temperature: usedTemperature
        };
      }

      const retryErrorText = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${retryErrorText}`);
    }

    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const json = (await response.json()) as OpenAiChatCompletionResponse;
  const content = json.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("OpenAI returned an unsupported response shape.");
  }

  return {
    content,
    model: json.model ?? selectedModel,
    temperature: usedTemperature
  };
}
