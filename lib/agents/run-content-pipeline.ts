import type { Draft } from "@prisma/client";
import { runBrainstormAgent } from "@/lib/agents/run-brainstorm-agent";
import { runEditorAgent } from "@/lib/agents/run-editor-agent";
import { runHookAgent } from "@/lib/agents/run-hook-agent";
import { runScoreAgent } from "@/lib/agents/run-score-agent";
import { runWriterAgent } from "@/lib/agents/run-writer-agent";
import type { PipelineIdea, PipelineStyleProfile } from "@/lib/agents/types";
import { prisma } from "@/lib/prisma";

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

export async function runContentPipeline(ideaId: string): Promise<Draft> {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId }
  });

  if (!idea) {
    throw new Error("Idea not found.");
  }

  const styleProfile = await prisma.styleProfile.findFirst({
    orderBy: { updatedAt: "desc" }
  });

  const pipelineIdea: PipelineIdea = {
    id: idea.id,
    title: idea.title,
    rawInput: idea.rawInput,
    topic: idea.topic
  };

  const pipelineStyleProfile: PipelineStyleProfile = styleProfile
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

  const runIds: string[] = [];

  const brainstorm = await runBrainstormAgent({
    idea: pipelineIdea,
    styleProfile: pipelineStyleProfile
  });
  runIds.push(brainstorm.runId);

  const hook = await runHookAgent({
    idea: pipelineIdea,
    brainstorm: brainstorm.data,
    styleProfile: pipelineStyleProfile
  });
  runIds.push(hook.runId);

  const writer = await runWriterAgent({
    idea: pipelineIdea,
    brainstorm: brainstorm.data,
    hook: hook.data,
    styleProfile: pipelineStyleProfile
  });
  runIds.push(writer.runId);

  const editor = await runEditorAgent({
    idea: pipelineIdea,
    writer: writer.data,
    styleProfile: pipelineStyleProfile
  });
  runIds.push(editor.runId);

  const score = await runScoreAgent({
    idea: pipelineIdea,
    editor: editor.data,
    styleProfile: pipelineStyleProfile
  });
  runIds.push(score.runId);

  const draft = await prisma.draft.create({
    data: {
      ideaId: idea.id,
      platform: "X",
      content: editor.data.editedDraft,
      status: score.data.recommendation === "ready" ? "ready" : "needs_edit",
      scoreJson: JSON.stringify(score.data),
      posts: {
        create: {
          position: 1,
          content: editor.data.editedDraft
        }
      }
    }
  });

  await prisma.agentRun.updateMany({
    where: {
      id: {
        in: runIds
      }
    },
    data: {
      draftId: draft.id
    }
  });

  return draft;
}
