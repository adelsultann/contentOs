"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { agentConfigSchema, type AgentConfigFormValues } from "@/lib/validations";

function toAgentData(values: AgentConfigFormValues) {
  return {
    name: values.name,
    description: values.description,
    role: values.role,
    goal: values.goal,
    systemPrompt: values.systemPrompt,
    outputFormat: values.outputFormat,
    providerConfigId: values.providerConfigId || null,
    model: values.model || null,
    temperature: values.temperature === "" ? null : values.temperature,
    isEnabled: values.isEnabled
  };
}

export async function createAgentConfig(values: AgentConfigFormValues) {
  const parsed = agentConfigSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the agent fields and try again." };
  }

  const agent = await prisma.agentConfig.create({
    data: toAgentData(parsed.data)
  });

  revalidatePath("/agents");
  revalidatePath("/agent-runs");
  redirect(`/agents/${agent.id}`);
}

export async function updateAgentConfig(id: string, values: AgentConfigFormValues) {
  const parsed = agentConfigSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the agent fields and try again." };
  }

  await prisma.agentConfig.update({
    where: { id },
    data: toAgentData(parsed.data)
  });

  revalidatePath("/agents");
  revalidatePath(`/agents/${id}`);
  revalidatePath("/agent-runs");
  redirect(`/agents/${id}`);
}

export async function deleteAgentConfig(id: string) {
  await prisma.agentConfig.delete({
    where: { id }
  });

  revalidatePath("/agents");
  revalidatePath("/agent-runs");
  redirect("/agents");
}
