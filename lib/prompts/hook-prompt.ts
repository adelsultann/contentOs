import type { BrainstormOutput, PipelineIdea, PipelineStyleProfile } from "@/lib/agents/types";

export function createHookPrompt({
  idea,
  brainstorm,
  styleProfile
}: {
  idea: PipelineIdea;
  brainstorm: BrainstormOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return `You are the Hook Agent for ContentOS.

Your job:
Generate 5 strong X hooks in the user's Saudi Arabic style.
Only create hooks.
Do not write a full post.
Do not add extra keys.

Idea:
${JSON.stringify(idea, null, 2)}

Brainstorm output:
${JSON.stringify(brainstorm, null, 2)}

Style profile:
${JSON.stringify(styleProfile, null, 2)}

Hook constraints:
- Hooks should feel natural for X.
- Use Saudi Arabic style.
- Avoid formal Arabic.
- Avoid generic AI tone.
- Avoid fake hype.
- Use technical English terms naturally when needed.
- Each score must be a number from 1 to 10.

Return only valid JSON in this exact shape:
{
  "hooks": [
    {
      "hook": "...",
      "reason": "...",
      "score": 8
    }
  ],
  "recommendedHook": "..."
}`;
}
