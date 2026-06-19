import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type { EditorOutput, PipelineIdea, PipelineStyleProfile, ScoreOutput } from "@/lib/agents/types";
import { isScoreOutput } from "@/lib/agents/validators";
import { createScorePrompt } from "@/lib/prompts/score-prompt";

export async function runScoreAgent({
  idea,
  editor,
  styleProfile
}: {
  idea: PipelineIdea;
  editor: EditorOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<ScoreOutput>({
    agentName: "Score Agent",
    ideaId: idea.id,
    prompt: createScorePrompt({ idea, editor, styleProfile }),
    input: {
      idea,
      editor,
      styleProfile
    },
    temperature: contentAgentTemperatures.score,
    validate: isScoreOutput
  });
}
