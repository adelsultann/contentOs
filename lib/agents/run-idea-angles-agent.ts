import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type {
  IdeaAnglesOutput,
  IdeaQualityScoreOutput,
  PipelineIdea,
  PipelineStyleProfile
} from "@/lib/agents/types";
import { isIdeaAnglesOutput } from "@/lib/agents/validators";
import { createIdeaAnglesPrompt } from "@/lib/prompts/idea-angles-prompt";

export async function runIdeaAnglesAgent({
  idea,
  ideaQuality,
  styleProfile
}: {
  idea: PipelineIdea;
  ideaQuality: IdeaQualityScoreOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<IdeaAnglesOutput>({
    agentName: "Idea Angles Agent",
    ideaId: idea.id,
    prompt: createIdeaAnglesPrompt({ idea, ideaQuality, styleProfile }),
    input: {
      idea,
      ideaQuality,
      styleProfile
    },
    temperature: contentAgentTemperatures.brainstorm,
    validate: isIdeaAnglesOutput
  });
}
