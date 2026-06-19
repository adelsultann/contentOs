export type PipelineIdea = {
  id: string;
  title: string;
  rawInput: string;
  topic: string;
};

export type PipelineStyleProfile = {
  dialect: string;
  tone: string;
  audience: string;
  writingRules: string;
  bannedPhrases: string;
  commonPhrases: string;
  examplePosts: string;
};

export type BrainstormOutput = {
  mainConcept: string;
  bestAngle: string;
  possibleAngles: string[];
  targetAudience: string;
  contentPillarSuggestion: string;
  whyThisCouldWork: string;
};

export type HookOutput = {
  hooks: Array<{
    hook: string;
    reason: string;
    score: number;
  }>;
  recommendedHook: string;
};

export type WriterOutput = {
  draft: string;
  format: "single_x_post" | string;
  notes: string;
};

export type EditorOutput = {
  editedDraft: string;
  changesMade: string[];
  removedWeaknesses: string[];
};

export type ScoreOutput = {
  scores: {
    hookStrength: number;
    clarity: number;
    styleMatch: number;
    technicalAccuracy: number;
    engagementPotential: number;
    jobOpportunityPotential: number;
  };
  overallScore: number;
  issues: string[];
  recommendation: "ready" | "needs_edit" | "weak_idea";
};

export type LoggedAgentResult<T> = {
  data: T;
  runId: string;
  rawOutput: string;
  model: string;
};
