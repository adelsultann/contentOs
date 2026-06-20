"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  contentPillarSchema,
  type ContentPillarFormValues
} from "@/lib/validations";

export async function createContentPillar(values: ContentPillarFormValues) {
  const parsed = contentPillarSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the content pillar fields and try again." };
  }

  await prisma.contentPillar.create({
    data: parsed.data
  });

  revalidatePath("/content-pillars");
  revalidatePath("/ideas");
  return { ok: true };
}

export async function updateContentPillar(id: string, values: ContentPillarFormValues) {
  const parsed = contentPillarSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the content pillar fields and try again." };
  }

  await prisma.contentPillar.update({
    where: { id },
    data: parsed.data
  });

  revalidatePath("/content-pillars");
  revalidatePath("/ideas");
  revalidatePath("/drafts");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteContentPillar(id: string) {
  await prisma.contentPillar.delete({
    where: { id }
  });

  revalidatePath("/content-pillars");
  revalidatePath("/ideas");
  revalidatePath("/drafts");
  revalidatePath("/dashboard");
  redirect("/content-pillars");
}
