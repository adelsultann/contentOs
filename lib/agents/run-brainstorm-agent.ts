import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type {
  BrainstormOutput,
  IdeaQualityScoreOutput,
  PipelineIdea,
  PipelineStyleProfile
} from "@/lib/agents/types";
import { isBrainstormOutput } from "@/lib/agents/validators";
import { createBrainstormPrompt } from "@/lib/prompts/brainstorm-prompt";

export async function runBrainstormAgent({
  idea,
  ideaQuality,
  styleProfile
}: {
  idea: PipelineIdea;
  ideaQuality?: IdeaQualityScoreOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<BrainstormOutput>({
    agentName: "Brainstorm Agent",
    ideaId: idea.id,
    prompt: createBrainstormPrompt({ idea, ideaQuality, styleProfile }),
    input: {
      idea,
      ideaQuality,
      styleProfile
    },
    temperature: contentAgentTemperatures.brainstorm,
    validate: isBrainstormOutput
  });
}
