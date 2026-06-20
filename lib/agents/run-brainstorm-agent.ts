import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type {
  BrainstormOutput,
  ContentAngle,
  IdeaQualityScoreOutput,
  PipelineIdea,
  PipelineStyleProfile
} from "@/lib/agents/types";
import { isBrainstormOutput } from "@/lib/agents/validators";
import { createBrainstormPrompt } from "@/lib/prompts/brainstorm-prompt";

export async function runBrainstormAgent({
  idea,
  ideaQuality,
  selectedAngle,
  styleProfile
}: {
  idea: PipelineIdea;
  ideaQuality?: IdeaQualityScoreOutput;
  selectedAngle?: ContentAngle;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<BrainstormOutput>({
    agentName: "Brainstorm Agent",
    ideaId: idea.id,
    prompt: createBrainstormPrompt({ idea, ideaQuality, selectedAngle, styleProfile }),
    input: {
      idea,
      ideaQuality,
      selectedAngle,
      styleProfile
    },
    temperature: contentAgentTemperatures.brainstorm,
    validate: isBrainstormOutput
  });
}
