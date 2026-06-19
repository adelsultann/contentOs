"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { draftSchema, type DraftFormValues } from "@/lib/validations";

export async function updateDraft(id: string, values: DraftFormValues) {
  const parsed = draftSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the draft fields and try again." };
  }

  await prisma.draft.update({
    where: { id },
    data: parsed.data
  });

  revalidatePath("/drafts");
  revalidatePath(`/drafts/${id}`);
  revalidatePath("/dashboard");
  redirect(`/drafts/${id}`);
}

export async function deleteDraft(id: string) {
  await prisma.draft.delete({
    where: { id }
  });

  revalidatePath("/drafts");
  revalidatePath("/dashboard");
  redirect("/drafts");
}
