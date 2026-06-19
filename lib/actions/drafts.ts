"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runDraftAdjustmentAgent } from "@/lib/agents/run-draft-adjustment-agent";
import { combineDraftPosts } from "@/lib/draft-posts";
import { prisma } from "@/lib/prisma";
import {
  draftRewriteSchema,
  draftSchema,
  draftThreadSchema,
  type DraftFormValues,
  type DraftThreadFormValues
} from "@/lib/validations";

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

export async function updateDraftThread(id: string, values: DraftThreadFormValues) {
  const parsed = draftThreadSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the draft posts and try again." };
  }

  const posts = parsed.data.posts.map((post) => ({
    content: post.content
  }));

  await prisma.$transaction(async (tx) => {
    await tx.draft.update({
      where: { id },
      data: {
        platform: parsed.data.platform,
        status: parsed.data.status,
        content: combineDraftPosts(posts)
      }
    });

    await tx.draftPost.deleteMany({
      where: { draftId: id }
    });

    await tx.draftPost.createMany({
      data: posts.map((post, index) => ({
        draftId: id,
        position: index + 1,
        content: post.content
      }))
    });
  });

  revalidatePath("/drafts");
  revalidatePath(`/drafts/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rewriteDraftWithAgent(id: string, values: { instructions: string }) {
  const parsed = draftRewriteSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Tell the agent what to adjust." };
  }

  try {
    const result = await runDraftAdjustmentAgent({
      draftId: id,
      instructions: parsed.data.instructions
    });

    const posts = result.posts.map((post) => ({
      content: post.content.trim()
    }));

    await prisma.$transaction(async (tx) => {
      await tx.draft.update({
        where: { id },
        data: {
          content: combineDraftPosts(posts),
          status: "needs_edit"
        }
      });

      await tx.draftPost.deleteMany({
        where: { draftId: id }
      });

      await tx.draftPost.createMany({
        data: posts.map((post, index) => ({
          draftId: id,
          position: index + 1,
          content: post.content
        }))
      });
    });

    revalidatePath("/drafts");
    revalidatePath(`/drafts/${id}`);
    revalidatePath("/agent-runs");
    revalidatePath("/dashboard");
    return { ok: true, notes: result.notes };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Draft rewrite failed."
    };
  }
}

export async function deleteDraft(id: string) {
  await prisma.draft.delete({
    where: { id }
  });

  revalidatePath("/drafts");
  revalidatePath("/dashboard");
  redirect("/drafts");
}
