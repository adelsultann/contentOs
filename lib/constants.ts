export const ideaStatuses = ["captured", "researching", "ready", "archived"] as const;
export const ideaPriorities = ["low", "medium", "high"] as const;
export const draftStatuses = ["draft", "ready", "needs_edit", "published", "archived"] as const;
export const platforms = ["x", "X", "linkedin", "newsletter", "other"] as const;
export const agentRunStatuses = ["queued", "running", "completed", "failed"] as const;
export const agentRoles = ["strategist", "writer", "editor", "critic", "formatter", "custom"] as const;

export const aiProviders = [
  "openai",
  "openrouter",
  "groq",
  "together",
  "deepseek",
  "custom"
] as const;

export const aiProviderPresets: Record<
  (typeof aiProviders)[number],
  { label: string; baseUrl: string; modelPlaceholder: string }
> = {
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    modelPlaceholder: "gpt-4o-mini"
  },
  openrouter: {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    modelPlaceholder: "openai/gpt-4o-mini"
  },
  groq: {
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    modelPlaceholder: "llama-3.3-70b-versatile"
  },
  together: {
    label: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    modelPlaceholder: "meta-llama/Llama-3.3-70B-Instruct-Turbo"
  },
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    modelPlaceholder: "deepseek-chat"
  },
  custom: {
    label: "Custom",
    baseUrl: "",
    modelPlaceholder: "provider-model-name"
  }
};
