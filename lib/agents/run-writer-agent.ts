import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type {
  BrainstormOutput,
  HookOutput,
  PipelineIdea,
  PipelineStyleProfile,
  WriterOutput
} from "@/lib/agents/types";
import { isWriterOutput } from "@/lib/agents/validators";
import { createWriterPrompt } from "@/lib/prompts/writer-prompt";

export async function runWriterAgent({
  idea,
  brainstorm,
  hook,
  styleProfile
}: {
  idea: PipelineIdea;
  brainstorm: BrainstormOutput;
  hook: HookOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<WriterOutput>({
    agentName: "Writer Agent",
    ideaId: idea.id,
    prompt: createWriterPrompt({ idea, brainstorm, hook, styleProfile }),
    input: {
      idea,
      brainstorm,
      hook,
      styleProfile
    },
    temperature: contentAgentTemperatures.writer,
    validate: isWriterOutput
  });
}
