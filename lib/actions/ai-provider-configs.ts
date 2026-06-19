"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  aiProviderConfigSchema,
  type AiProviderConfigFormValues
} from "@/lib/validations";

async function applyDefaultState(id: string, isDefault: boolean) {
  if (!isDefault) {
    return;
  }

  await prisma.aiProviderConfig.updateMany({
    where: {
      id: {
        not: id
      }
    },
    data: {
      isDefault: false
    }
  });
}

export async function createAiProviderConfig(values: AiProviderConfigFormValues) {
  const parsed = aiProviderConfigSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the API provider fields and try again." };
  }

  if (!parsed.data.apiKey) {
    return { error: "API key is required for a new provider." };
  }

  const existingCount = await prisma.aiProviderConfig.count();
  const shouldBeDefault = parsed.data.isDefault || existingCount === 0;

  const config = await prisma.aiProviderConfig.create({
    data: {
      ...parsed.data,
      isDefault: shouldBeDefault
    }
  });

  await applyDefaultState(config.id, shouldBeDefault);

  revalidatePath("/settings");
  return { ok: true };
}

export async function updateAiProviderConfig(id: string, values: AiProviderConfigFormValues) {
  const parsed = aiProviderConfigSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the API provider fields and try again." };
  }

  const existing = await prisma.aiProviderConfig.findUnique({
    where: { id }
  });

  if (!existing) {
    return { error: "API provider not found." };
  }

  const updated = await prisma.aiProviderConfig.update({
    where: { id },
    data: {
      name: parsed.data.name,
      provider: parsed.data.provider,
      baseUrl: parsed.data.baseUrl,
      apiKey: parsed.data.apiKey || existing.apiKey,
      defaultModel: parsed.data.defaultModel,
      temperature: parsed.data.temperature,
      isDefault: parsed.data.isDefault,
      isEnabled: parsed.data.isEnabled
    }
  });

  await applyDefaultState(updated.id, parsed.data.isDefault);

  revalidatePath("/settings");
  return { ok: true };
}

export async function deleteAiProviderConfig(id: string) {
  const deleted = await prisma.aiProviderConfig.delete({
    where: { id }
  });

  if (deleted.isDefault) {
    const nextDefault = await prisma.aiProviderConfig.findFirst({
      where: { isEnabled: true },
      orderBy: { createdAt: "asc" }
    });

    if (nextDefault) {
      await prisma.aiProviderConfig.update({
        where: { id: nextDefault.id },
        data: { isDefault: true }
      });
    }
  }

  revalidatePath("/settings");
  redirect("/settings");
}
