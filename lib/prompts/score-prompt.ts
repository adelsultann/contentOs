import type { EditorOutput, PipelineIdea, PipelineStyleProfile } from "@/lib/agents/types";

export function createScorePrompt({
  idea,
  editor,
  styleProfile
}: {
  idea: PipelineIdea;
  editor: EditorOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return `You are the Score Agent for ContentOS.

Your job:
Evaluate the final edited draft.
Be strict, practical, and specific.
Do not rewrite the post.
Do not add extra keys.

Idea:
${JSON.stringify(idea, null, 2)}

Edited draft:
${JSON.stringify(editor, null, 2)}

Style profile:
${JSON.stringify(styleProfile, null, 2)}

Scoring constraints:
- Every score must be a number from 1 to 10.
- overallScore must be a number from 1 to 10.
- recommendation must be exactly one of: "ready", "needs_edit", "weak_idea".
- Evaluate Saudi Arabic style match, clarity, and practical usefulness.

Return only valid JSON in this exact shape:
{
  "scores": {
    "hookStrength": 8,
    "clarity": 9,
    "styleMatch": 8,
    "technicalAccuracy": 8,
    "engagementPotential": 7,
    "jobOpportunityPotential": 8
  },
  "overallScore": 8,
  "issues": ["...", "..."],
  "recommendation": "ready"
}`;
}
