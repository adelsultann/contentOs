import type {
  BrainstormOutput,
  EditorOutput,
  HookOutput,
  IdeaQualityScoreOutput,
  ScoreOutput,
  WriterOutput
} from "@/lib/agents/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

export function isBrainstormOutput(value: unknown): value is BrainstormOutput {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.mainConcept === "string" &&
    typeof value.bestAngle === "string" &&
    isStringArray(value.possibleAngles) &&
    typeof value.targetAudience === "string" &&
    typeof value.contentPillarSuggestion === "string" &&
    typeof value.whyThisCouldWork === "string"
  );
}

export function isIdeaQualityScoreOutput(value: unknown): value is IdeaQualityScoreOutput {
  if (!isRecord(value) || !isRecord(value.scores)) {
    return false;
  }

  return (
    isNumber(value.scores.clarity) &&
    isNumber(value.scores.usefulness) &&
    isNumber(value.scores.originality) &&
    isNumber(value.scores.personalExperience) &&
    isNumber(value.scores.jobOpportunityValue) &&
    isNumber(value.overallScore) &&
    typeof value.problem === "string" &&
    typeof value.betterAngle === "string" &&
    (value.recommendation === "generate_draft" || value.recommendation === "improve_idea")
  );
}

export function isHookOutput(value: unknown): value is HookOutput {
  if (!isRecord(value) || !Array.isArray(value.hooks)) {
    return false;
  }

  return (
    value.hooks.every(
      (hook) =>
        isRecord(hook) &&
        typeof hook.hook === "string" &&
        typeof hook.reason === "string" &&
        isNumber(hook.score)
    ) && typeof value.recommendedHook === "string"
  );
}

export function isWriterOutput(value: unknown): value is WriterOutput {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.draft === "string" &&
    typeof value.format === "string" &&
    typeof value.notes === "string"
  );
}

export function isEditorOutput(value: unknown): value is EditorOutput {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.editedDraft === "string" &&
    isStringArray(value.changesMade) &&
    isStringArray(value.removedWeaknesses)
  );
}

export function isScoreOutput(value: unknown): value is ScoreOutput {
  if (!isRecord(value) || !isRecord(value.scores)) {
    return false;
  }

  return (
    isNumber(value.scores.hookStrength) &&
    isNumber(value.scores.clarity) &&
    isNumber(value.scores.styleMatch) &&
    isNumber(value.scores.technicalAccuracy) &&
    isNumber(value.scores.engagementPotential) &&
    isNumber(value.scores.jobOpportunityPotential) &&
    isNumber(value.overallScore) &&
    isStringArray(value.issues) &&
    (value.recommendation === "ready" ||
      value.recommendation === "needs_edit" ||
      value.recommendation === "weak_idea")
  );
}
