import type { PipelineStyleProfile } from "@/lib/agents/types";

export function createDraftRewritePrompt({
  idea,
  posts,
  instructions,
  styleProfile
}: {
  idea: { title: string; rawInput: string; topic: string } | null;
  posts: string[];
  instructions: string;
  styleProfile: PipelineStyleProfile;
}) {
  return `You are the Draft Adjustment Agent for ContentOS.

Your job:
Rewrite the current draft using the user's adjustment notes.
You may return one post or multiple posts if the idea needs more explanation.
Do not auto-publish.
Do not add extra keys.

Source idea:
${JSON.stringify(idea, null, 2)}

Current draft posts:
${JSON.stringify(posts, null, 2)}

User adjustment notes:
${instructions}

Style profile:
${JSON.stringify(styleProfile, null, 2)}

Writing constraints:
- Use Saudi Arabic style.
- Avoid formal Arabic.
- Avoid generic AI tone.
- Avoid fake hype.
- Use technical English terms naturally when needed.
- Keep each post practical and clear.
- If more than one post is needed, split into a clean X thread.
- Preserve the core idea unless the user asks for a stronger angle.

Return only valid JSON in this exact shape:
{
  "posts": [
    {
      "content": "..."
    }
  ],
  "notes": "..."
}`;
}
