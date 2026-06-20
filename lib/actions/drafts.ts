"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runDraftAdjustmentAgent } from "@/lib/agents/run-draft-adjustment-agent";
import { combineDraftPosts, splitDraftContent } from "@/lib/draft-posts";
import { prisma } from "@/lib/prisma";
import {
  draftAnalyticsSchema,
  draftRewriteSchema,
  draftSchema,
  draftThreadSchema,
  type DraftAnalyticsFormValues,
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
      const currentDraft = await tx.draft.findUnique({
        where: { id },
        include: {
          posts: {
            orderBy: { position: "asc" }
          },
          versions: {
            orderBy: { version: "desc" },
            take: 1,
            select: { version: true }
          }
        }
      });

      if (!currentDraft) {
        throw new Error("Draft not found.");
      }

      const currentPosts =
        currentDraft.posts.length > 0
          ? currentDraft.posts.map((post) => ({ content: post.content }))
          : splitDraftContent(currentDraft.content).map((content) => ({ content }));
      const nextVersion = (currentDraft.versions[0]?.version ?? 0) + 1;

      await tx.draftVersion.create({
        data: {
          draftId: id,
          version: nextVersion,
          platform: currentDraft.platform,
          status: currentDraft.status,
          content: currentDraft.content,
          postsJson: JSON.stringify(currentPosts),
          rewriteNotes: parsed.data.instructions
        }
      });

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

function parseVersionPosts(postsJson: string, fallbackContent: string) {
  try {
    const parsed = JSON.parse(postsJson) as unknown;

    if (
      Array.isArray(parsed) &&
      parsed.every(
        (post) =>
          typeof post === "object" &&
          post !== null &&
          !Array.isArray(post) &&
          typeof (post as Record<string, unknown>).content === "string"
      )
    ) {
      return parsed.map((post) => ({
        content: (post as { content: string }).content
      }));
    }
  } catch {
  }

  return splitDraftContent(fallbackContent).map((content) => ({ content }));
}

export async function restoreDraftVersion(draftId: string, versionId: string) {
  const version = await prisma.draftVersion.findFirst({
    where: {
      id: versionId,
      draftId
    }
  });

  if (!version) {
    throw new Error("Draft version not found.");
  }

  const posts = parseVersionPosts(version.postsJson, version.content);

  await prisma.$transaction(async (tx) => {
    await tx.draft.update({
      where: { id: draftId },
      data: {
        platform: version.platform,
        status: version.status,
        content: version.content
      }
    });

    await tx.draftPost.deleteMany({
      where: { draftId }
    });

    await tx.draftPost.createMany({
      data: posts.map((post, index) => ({
        draftId,
        position: index + 1,
        content: post.content
      }))
    });
  });

  revalidatePath("/drafts");
  revalidatePath(`/drafts/${draftId}`);
  revalidatePath("/dashboard");
}

export async function recordDraftAnalytics(id: string, values: DraftAnalyticsFormValues) {
  const parsed = draftAnalyticsSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check the performance metrics and try again." };
  }

  const draft = await prisma.draft.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!draft) {
    return { error: "Draft not found." };
  }

  await prisma.draftAnalytics.create({
    data: {
      draftId: id,
      ...parsed.data
    }
  });

  revalidatePath("/analytics");
  revalidatePath("/drafts");
  revalidatePath(`/drafts/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteDraft(id: string) {
  await prisma.draft.delete({
    where: { id }
  });

  revalidatePath("/drafts");
  revalidatePath("/dashboard");
  redirect("/drafts");
}
