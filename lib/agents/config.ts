export const contentAgentModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const contentAgentTemperatures = {
  brainstorm: 0.7,
  hook: 0.8,
  writer: 0.7,
  editor: 0.3,
  score: 0.2
} as const;
