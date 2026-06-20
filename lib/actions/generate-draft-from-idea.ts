"use server";

import { revalidatePath } from "next/cache";
import { runContentPipeline } from "@/lib/agents/run-content-pipeline";

export async function generateDraftFromIdea(ideaId: string) {
  try {
    const result = await runContentPipeline(ideaId);

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
