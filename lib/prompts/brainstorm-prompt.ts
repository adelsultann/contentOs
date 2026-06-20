import type { IdeaQualityScoreOutput, PipelineIdea, PipelineStyleProfile } from "@/lib/agents/types";

export function createBrainstormPrompt({
  idea,
  ideaQuality,
  styleProfile
}: {
  idea: PipelineIdea;
  ideaQuality?: IdeaQualityScoreOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return `You are the Brainstorm Agent for ContentOS.

Your job:
Understand the raw idea and create strong content angles.
Do not write the final post.
Do not create hooks.
Do not add extra keys.

Idea:
${JSON.stringify(idea, null, 2)}

Idea quality score:
${ideaQuality ? JSON.stringify(ideaQuality, null, 2) : "Not scored."}

Style profile:
${JSON.stringify(styleProfile, null, 2)}

Writing constraints:
- Use the user's Saudi Arabic style as the target voice.
- Avoid formal Arabic.
- Avoid generic AI tone.
- Avoid fake hype.
- Use technical English terms naturally when needed.
- Keep the thinking practical, clear, and useful for X content.
- If an idea quality score is provided, use betterAngle as the preferred direction.

Return only valid JSON in this exact shape:
{
  "mainConcept": "...",
  "bestAngle": "...",
  "possibleAngles": ["...", "...", "..."],
  "targetAudience": "...",
  "contentPillarSuggestion": "...",
  "whyThisCouldWork": "..."
}`;
}
