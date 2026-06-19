import { contentAgentModel } from "@/lib/agents/config";
import type { PipelineStyleProfile } from "@/lib/agents/types";
import { createOpenAiJsonChatCompletion } from "@/lib/openai";
import { createDraftRewritePrompt } from "@/lib/prompts/draft-rewrite-prompt";
import { prisma } from "@/lib/prisma";

type DraftRewriteOutput = {
  posts: Array<{ content: string }>;
  notes: string;
};

function isDraftRewriteOutput(value: unknown): value is DraftRewriteOutput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    Array.isArray(record.posts) &&
    record.posts.length > 0 &&
    record.posts.every(
      (post) =>
        typeof post === "object" &&
        post !== null &&
        !Array.isArray(post) &&
        typeof (post as Record<string, unknown>).content === "string"
    ) &&
    typeof record.notes === "string"
  );
}

function parseRewriteOutput(rawOutput: string) {
  try {
    return JSON.parse(rawOutput) as unknown;
  } catch {
    throw new Error("Draft Adjustment Agent returned invalid JSON.");
  }
}

function emptyStyleProfile(): PipelineStyleProfile {
  return {
    dialect: "",
    tone: "",
    audience: "",
    writingRules: "",
    bannedPhrases: "",
    commonPhrases: "",
    examplePosts: ""
  };
}

export async function runDraftAdjustmentAgent({
  draftId,
  instructions
}: {
  draftId: string;
  instructions: string;
}) {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      idea: true,
      posts: {
        orderBy: { position: "asc" }
      }
    }
  });

  if (!draft) {
    throw new Error("Draft not found.");
  }

  const styleProfile = await prisma.styleProfile.findFirst({
    orderBy: { updatedAt: "desc" }
  });

  const pipelineStyleProfile = styleProfile
    ? {
        dialect: styleProfile.dialect,
        tone: styleProfile.tone,
        audience: styleProfile.audience,
        writingRules: styleProfile.writingRules,
        bannedPhrases: styleProfile.bannedPhrases,
        commonPhrases: styleProfile.commonPhrases,
        examplePosts: styleProfile.examplePosts
      }
    : emptyStyleProfile();

  const posts = draft.posts.length > 0 ? draft.posts.map((post) => post.content) : [draft.content];
  const prompt = createDraftRewritePrompt({
    idea: draft.idea
      ? {
          title: draft.idea.title,
          rawInput: draft.idea.rawInput,
          topic: draft.idea.topic
        }
      : null,
    posts,
    instructions,
    styleProfile: pipelineStyleProfile
  });
  const inputJson = JSON.stringify({
    draftId,
    ideaId: draft.ideaId,
    posts,
    instructions,
    styleProfile: pipelineStyleProfile
  });
  let rawOutput = "";

  try {
    const result = await createOpenAiJsonChatCompletion({
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a controlled ContentOS draft adjustment agent. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    rawOutput = result.content;
    const parsed = parseRewriteOutput(rawOutput);

    if (!isDraftRewriteOutput(parsed)) {
      throw new Error("Draft Adjustment Agent JSON did not match the expected shape.");
    }

    await prisma.agentRun.create({
      data: {
        agentName: "Draft Adjustment Agent",
        ideaId: draft.ideaId,
        draftId: draft.id,
        inputJson,
        outputJson: JSON.stringify(parsed),
        model: result.model,
        temperature: result.temperature,
        status: "completed"
      }
    });

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Draft adjustment failed.";

    await prisma.agentRun.create({
      data: {
        agentName: "Draft Adjustment Agent",
        ideaId: draft.ideaId,
        draftId: draft.id,
        inputJson,
        outputJson: rawOutput ? JSON.stringify({ rawOutput }) : "{}",
        model: contentAgentModel,
        temperature: 0.7,
        status: "failed",
        errorMessage: message
      }
    });

    throw new Error(`Draft Adjustment Agent failed: ${message}`);
  }
}
