import type { IdeaQualityScoreOutput, PipelineIdea, PipelineStyleProfile } from "@/lib/agents/types";

export function createIdeaAnglesPrompt({
  idea,
  ideaQuality,
  styleProfile
}: {
  idea: PipelineIdea;
  ideaQuality: IdeaQualityScoreOutput;
  styleProfile: PipelineStyleProfile;
}) {
  return `You are the Idea Angles Agent for ContentOS.

Your job:
Generate exactly 3 possible angles before writing a draft.
Do not choose the final angle.
Do not write hooks.
Do not write the final post.
Do not add extra keys.

Idea:
${JSON.stringify(idea, null, 2)}

Idea quality score:
${JSON.stringify(ideaQuality, null, 2)}

Style profile:
${JSON.stringify(styleProfile, null, 2)}

Angle rules:
- beginner_explanation: explain the core idea in a simple way for beginners.
- personal_story: anchor the idea in a concrete mistake, build, decision, or lesson the creator could plausibly have faced.
- technical_deep_dive: explain the deeper technical reasoning, tradeoff, implementation detail, or failure mode.
- Make each angle specific to the raw idea.
- Prefer practical, job-relevant angles over generic motivation.
- Use clear English labels.
- Keep angle text to one sentence.
- Keep whyItWorks to one sentence.

Return only valid JSON in this exact shape:
{
  "angles": [
    {
      "type": "beginner_explanation",
      "label": "Beginner angle",
      "angle": "What temperature means in AI models.",
      "whyItWorks": "It makes the concept easy for beginners to understand."
    },
    {
      "type": "personal_story",
      "label": "Personal story angle",
      "angle": "I built an invoice extraction agent and it started making weird mistakes.",
      "whyItWorks": "It adds a concrete lived problem instead of a generic explanation."
    },
    {
      "type": "technical_deep_dive",
      "label": "Technical angle",
      "angle": "Why extraction tasks should use low temperature and structured output.",
      "whyItWorks": "It shows technical judgment and practical competence."
    }
  ]
}`;
}
