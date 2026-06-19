import { contentAgentTemperatures } from "@/lib/agents/config";
import { runJsonAgent } from "@/lib/agents/run-json-agent";
import type { EditorOutput, PipelineIdea, PipelineStyleProfile, WriterOutput } from "@/lib/agents/types";
import { isEditorOutput } from "@/lib/agents/validators";
import { createEditorPrompt } from "@/lib/prompts/editor-prompt";

export async function runEditorAgent({
  idea,
  writer,
  styleProfile
}: {
  idea: PipelineIdea;
  writer: WriterOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return runJsonAgent<EditorOutput>({
    agentName: "Editor Agent",
    ideaId: idea.id,
    prompt: createEditorPrompt({ writer, styleProfile }),
    input: {
      writer,
      styleProfile
    },
    temperature: contentAgentTemperatures.editor,
    validate: isEditorOutput
  });
}
