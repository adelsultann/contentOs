"use server";

import { revalidatePath } from "next/cache";
import { createOpenAiCompatibleChatCompletion } from "@/lib/ai/openai-compatible";
import { prisma } from "@/lib/prisma";

export async function runAgentConfig(agentId: string, input: string) {
  const cleanInput = input.trim();

  if (!cleanInput) {
    return { error: "Input is required." };
  }

  const agent = await prisma.agentConfig.findUnique({
    where: { id: agentId },
    include: { providerConfig: true }
  });

  if (!agent || !agent.isEnabled) {
    return { error: "Agent is not available." };
  }

  const inputJson = JSON.stringify({
    input: cleanInput,
    agentGoal: agent.goal,
    outputFormat: agent.outputFormat
  });

  try {
    const systemPrompt = [
      agent.systemPrompt,
      agent.goal ? `Goal:\n${agent.goal}` : "",
      agent.outputFormat ? `Output format:\n${agent.outputFormat}` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await createOpenAiCompatibleChatCompletion({
      providerId: agent.providerConfigId ?? undefined,
      model: agent.model ?? undefined,
      temperature: agent.temperature ?? undefined,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: cleanInput
        }
      ]
    });

    await prisma.agentRun.create({
      data: {
        agentConfigId: agent.id,
        agentName: agent.name,
        inputJson,
        outputJson: JSON.stringify({
          content: result.content,
          raw: result.raw
        }),
        model: result.model ?? agent.model ?? agent.providerConfig?.defaultModel ?? null,
        temperature: agent.temperature ?? agent.providerConfig?.temperature ?? null,
        status: "completed"
      }
    });

    revalidatePath("/agents");
    revalidatePath(`/agents/${agent.id}`);
    revalidatePath("/agent-runs");
    revalidatePath("/dashboard");
    return { ok: true, content: result.content };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent run failed.";

    await prisma.agentRun.create({
      data: {
        agentConfigId: agent.id,
        agentName: agent.name,
        inputJson,
        outputJson: "{}",
        model: agent.model ?? agent.providerConfig?.defaultModel ?? null,
        temperature: agent.temperature ?? agent.providerConfig?.temperature ?? null,
        status: "failed",
        errorMessage: message
      }
    });

    revalidatePath("/agents");
    revalidatePath(`/agents/${agent.id}`);
    revalidatePath("/agent-runs");
    return { error: message };
  }
}
