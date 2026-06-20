"use server";

import { revalidatePath } from "next/cache";
import { prepareIdeaAngles, runContentPipeline } from "@/lib/agents/run-content-pipeline";
import type { ContentAngle } from "@/lib/agents/types";

export async function generateAnglesForIdea(ideaId: string) {
  try {
    const result = await prepareIdeaAngles(ideaId);

    revalidatePath("/dashboard");
    revalidatePath("/ideas");
    revalidatePath(`/ideas/${ideaId}`);
    revalidatePath("/agent-runs");

    return {
      ok: true,
      ideaQuality: result.ideaQuality,
      angles: result.angles.angles,
      blocked: result.blocked
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Angle generation failed."
    };
  }
}

export async function generateDraftFromIdea(ideaId: string, selectedAngle?: ContentAngle) {
  try {
    const result = await runContentPipeline(ideaId, selectedAngle);

    revalidatePath("/dashboard");
    revalidatePath("/ideas");
    revalidatePath(`/ideas/${ideaId}`);
    revalidatePath("/drafts");
    revalidatePath("/agent-runs");

    if (!result.draft) {
      return {
        ok: true,
        ideaQuality: result.ideaQuality,
        blocked: true
      };
    }

    revalidatePath(`/drafts/${result.draft.id}`);

    return {
      ok: true,
      draftId: result.draft.id,
      ideaQuality: result.ideaQuality,
      blocked: false
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Draft generation failed."
    };
  }
}
