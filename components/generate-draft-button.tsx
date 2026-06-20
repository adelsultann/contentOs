"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { IdeaQualityScoreOutput } from "@/lib/agents/types";

type GenerateResult = {
  ok?: boolean;
  draftId?: string;
  ideaQuality?: IdeaQualityScoreOutput;
  blocked?: boolean;
  error?: string;
};

function scoreTone(score: number) {
  if (score >= 8) {
    return "text-primary";
  }
  if (score >= 6) {
    return "text-amber-700";
  }
  return "text-destructive";
}

function IdeaQualityReport({
  blocked,
  ideaQuality
}: {
  blocked: boolean;
  ideaQuality: IdeaQualityScoreOutput;
}) {
  const metricRows = [
    ["Clarity", ideaQuality.scores.clarity],
    ["Usefulness", ideaQuality.scores.usefulness],
    ["Originality", ideaQuality.scores.originality],
    ["Personal experience", ideaQuality.scores.personalExperience],
    ["Job-opportunity value", ideaQuality.scores.jobOpportunityValue]
  ] as const;

  return (
    <div className="max-w-2xl rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Idea score</p>
          <p className={`text-3xl font-semibold ${scoreTone(ideaQuality.overallScore)}`}>
            {ideaQuality.overallScore}/10
          </p>
        </div>
        {blocked ? (
          <p className="rounded-md border border-destructive/30 px-3 py-1 text-sm text-destructive">
            Draft not generated
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Problem</p>
          <p className="mt-1 text-sm">{ideaQuality.problem}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Better angle</p>
          <p className="mt-1 text-sm">{ideaQuality.betterAngle}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {metricRows.map(([label, score]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2"
          >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm font-semibold ${scoreTone(score)}`}>{score}/10</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GenerateDraftButton({
  onGenerate
}: {
  onGenerate: () => Promise<GenerateResult>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [draftId, setDraftId] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [ideaQuality, setIdeaQuality] = useState<IdeaQualityScoreOutput | null>(null);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError("");
          setDraftId("");
          setBlocked(false);
          setIdeaQuality(null);
          startTransition(async () => {
            const result = await onGenerate();

            if (result.error) {
              setError(result.error);
              return;
            }

            if (result.ideaQuality) {
              setIdeaQuality(result.ideaQuality);
            }

            setBlocked(Boolean(result.blocked));

            if (result.draftId) {
              setDraftId(result.draftId);
            }
          });
        }}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isPending ? "Scoring idea" : "Score idea and generate"}
      </Button>

      {ideaQuality ? <IdeaQualityReport blocked={blocked} ideaQuality={ideaQuality} /> : null}

      {draftId ? (
        <p className="text-sm text-muted-foreground">
          Draft generated.{" "}
          <Link className="font-medium text-primary hover:underline" href={`/drafts/${draftId}`}>
            View draft
          </Link>
        </p>
      ) : null}

      {error ? <p className="max-w-2xl text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
