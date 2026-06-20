import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type {
  IdeaQualityScoreOutput,
  PipelineIdea,
  PipelineStyleProfile
} from "@/lib/agents/types";
import { isIdeaQualityScoreOutput } from "@/lib/agents/validators";
import { createIdeaQualityScorePrompt } from "@/lib/prompts/idea-quality-score-prompt";

export async function runIdeaQualityScoreAgent({
  idea,
  styleProfile
}: {
  idea: PipelineIdea;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<IdeaQualityScoreOutput>({
    agentName: "Idea Quality Score Agent",
    ideaId: idea.id,
    prompt: createIdeaQualityScorePrompt({ idea, styleProfile }),
    input: {
      idea,
      styleProfile
    },
    temperature: contentAgentTemperatures.score,
    validate: isIdeaQualityScoreOutput
  });
}
