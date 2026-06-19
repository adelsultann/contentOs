import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type {
  BrainstormOutput,
  HookOutput,
  PipelineIdea,
  PipelineStyleProfile
} from "@/lib/agents/types";
import { isHookOutput } from "@/lib/agents/validators";
import { createHookPrompt } from "@/lib/prompts/hook-prompt";

export async function runHookAgent({
  idea,
  brainstorm,
  styleProfile
}: {
  idea: PipelineIdea;
  brainstorm: BrainstormOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<HookOutput>({
    agentName: "Hook Agent",
    ideaId: idea.id,
    prompt: createHookPrompt({ idea, brainstorm, styleProfile }),
    input: {
      idea,
      brainstorm,
      styleProfile
    },
    temperature: contentAgentTemperatures.hook,
    validate: isHookOutput
  });
}
