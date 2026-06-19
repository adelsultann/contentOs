import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type { BrainstormOutput, PipelineIdea, PipelineStyleProfile } from "@/lib/agents/types";
import { isBrainstormOutput } from "@/lib/agents/validators";
import { createBrainstormPrompt } from "@/lib/prompts/brainstorm-prompt";

export async function runBrainstormAgent({
  idea,
  styleProfile
}: {
  idea: PipelineIdea;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<BrainstormOutput>({
    agentName: "Brainstorm Agent",
    ideaId: idea.id,
    prompt: createBrainstormPrompt({ idea, styleProfile }),
    input: {
      idea,
      styleProfile
    },
    temperature: contentAgentTemperatures.brainstorm,
    validate: isBrainstormOutput
  });
}
