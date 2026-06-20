"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ideaInboxSchema,
  ideaSchema,
  type IdeaFormValues,
  type IdeaInboxFormValues
} from "@/lib/validations";

function toIdeaData(values: IdeaFormValues) {
  return {
    title: values.title,
    rawInput: values.rawInput,
    topic: values.topic,
    contentPillarId: values.contentPillarId || null,
    status: values.status,
    priority: values.priority
  };
}

function titleFromRawInput(rawInput: string) {
  const firstLine = rawInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return "Untitled idea";
  }

  return firstLine.length > 120 ? `${firstLine.slice(0, 117)}...` : firstLine;
}

export async function createIdea(values: IdeaFormValues) {
  const parsed = ideaSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the idea fields and try again." };
  }

  const idea = await prisma.idea.create({
    data: toIdeaData(parsed.data)
  });

  revalidatePath("/ideas");
  revalidatePath("/dashboard");
  redirect(`/ideas/${idea.id}`);
}

export async function captureInboxIdea(values: IdeaInboxFormValues) {
  const parsed = ideaInboxSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Capture at least one rough thought and try again." };
  }

  const idea = await prisma.idea.create({
    data: {
      title: titleFromRawInput(parsed.data.rawInput),
      rawInput: parsed.data.rawInput,
      topic: "",
      contentPillarId: null,
      status: "captured",
      priority: "medium"
    }
  });

  revalidatePath("/ideas");
  revalidatePath("/ideas/inbox");
  revalidatePath("/dashboard");
  redirect(`/ideas/${idea.id}`);
}

export async function updateIdea(id: string, values: IdeaFormValues) {
  const parsed = ideaSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the idea fields and try again." };
  }

  await prisma.idea.update({
    where: { id },
    data: toIdeaData(parsed.data)
  });

  revalidatePath("/ideas");
  revalidatePath(`/ideas/${id}`);
  revalidatePath("/drafts");
  revalidatePath("/dashboard");
  redirect(`/ideas/${id}`);
}

export async function deleteIdea(id: string) {
  await prisma.idea.delete({
    where: { id }
  });

  revalidatePath("/ideas");
  revalidatePath("/dashboard");
  redirect("/ideas");
}
