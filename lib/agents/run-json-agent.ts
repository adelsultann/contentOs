import { contentAgentModel } from "@/lib/agents/config";
import type { LoggedAgentResult } from "@/lib/agents/types";
import { createOpenAiJsonChatCompletion } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

type RunJsonAgentInput<T> = {
  agentName: string;
  ideaId: string;
  draftId?: string;
  prompt: string;
  input: unknown;
  model?: string;
  temperature: number;
  validate: (value: unknown) => value is T;
};

function parseJsonOutput(rawOutput: string) {
  try {
    return JSON.parse(rawOutput) as unknown;
  } catch {
    throw new Error("Agent returned invalid JSON.");
  }
}

export async function runJsonAgent<T>({
  agentName,
  ideaId,
  draftId,
  prompt,
  input,
  model,
  temperature,
  validate
}: RunJsonAgentInput<T>): Promise<LoggedAgentResult<T>> {
  const inputJson = JSON.stringify(input);
  let rawOutput = "";

  try {
    const result = await createOpenAiJsonChatCompletion({
      model,
      temperature,
      messages: [
        {
          role: "system",
          content:
            "You are a controlled ContentOS pipeline agent. Follow the user prompt exactly and return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    rawOutput = result.content;
    const parsed = parseJsonOutput(rawOutput);

    if (!validate(parsed)) {
      throw new Error("Agent JSON did not match the expected shape.");
    }

    const run = await prisma.agentRun.create({
      data: {
        agentName,
        ideaId,
        draftId,
        inputJson,
        outputJson: JSON.stringify(parsed),
        model: result.model,
        temperature: result.temperature,
        status: "completed"
      }
    });

    return {
      data: parsed,
      runId: run.id,
      rawOutput,
      model: result.model
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent failed.";

    await prisma.agentRun.create({
      data: {
        agentName,
        ideaId,
        draftId,
        inputJson,
        outputJson: rawOutput ? JSON.stringify({ rawOutput }) : "{}",
        model: model ?? contentAgentModel,
        temperature,
        status: "failed",
        errorMessage: message
      }
    });

    throw new Error(`${agentName} failed: ${message}`);
  }
}
