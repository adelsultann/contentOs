"use server";

import { revalidatePath } from "next/cache";
import { runContentPipeline } from "@/lib/agents/run-content-pipeline";

export async function generateDraftFromIdea(ideaId: string) {
  try {
    const draft = await runContentPipeline(ideaId);

    revalidatePath("/dashboard");
    revalidatePath("/ideas");
    revalidatePath(`/ideas/${ideaId}`);
    revalidatePath("/drafts");
    revalidatePath(`/drafts/${draft.id}`);
    revalidatePath("/agent-runs");

    return {
      ok: true,
      draftId: draft.id
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Draft generation failed."
    };
  }
}
