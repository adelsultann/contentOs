"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ContentAngle, IdeaQualityScoreOutput } from "@/lib/agents/types";

type AngleResult = {
  ok?: boolean;
  ideaQuality?: IdeaQualityScoreOutput;
  angles?: ContentAngle[];
  blocked?: boolean;
  error?: string;
};

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
            Improve before drafting
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

function AngleChoices({
  angles,
  selectedAngle,
  onSelect
}: {
  angles: ContentAngle[];
  selectedAngle: ContentAngle | null;
  onSelect: (angle: ContentAngle) => void;
}) {
  return (
    <div className="grid max-w-3xl gap-3">
      {angles.map((angle) => {
        const isSelected = selectedAngle?.type === angle.type;

        return (
          <button
            key={angle.type}
            type="button"
            onClick={() => onSelect(angle)}
            className={`rounded-lg border p-4 text-left transition hover:bg-muted/40 ${
              isSelected ? "border-primary bg-primary/5" : "bg-background"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{angle.label}</p>
                <p className="mt-2 text-sm">{angle.angle}</p>
              </div>
              {isSelected ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : null}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{angle.whyItWorks}</p>
          </button>
        );
      })}
    </div>
  );
}

export function GenerateDraftButton({
  onGenerateAngles,
  onGenerate
}: {
  onGenerateAngles: () => Promise<AngleResult>;
  onGenerate: (selectedAngle: ContentAngle) => Promise<GenerateResult>;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingLabel, setPendingLabel] = useState("");
  const [error, setError] = useState("");
  const [draftId, setDraftId] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [ideaQuality, setIdeaQuality] = useState<IdeaQualityScoreOutput | null>(null);
  const [angles, setAngles] = useState<ContentAngle[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<ContentAngle | null>(null);

  function handleGenerateAngles() {
    setError("");
    setDraftId("");
    setBlocked(false);
    setIdeaQuality(null);
    setAngles([]);
    setSelectedAngle(null);
    setPendingLabel("Generating angles");

    startTransition(async () => {
      const result = await onGenerateAngles();

      if (result.error) {
        setError(result.error);
        setPendingLabel("");
        return;
      }

      setIdeaQuality(result.ideaQuality ?? null);
      setAngles(result.angles ?? []);
      setBlocked(Boolean(result.blocked));
      setPendingLabel("");
    });
  }

  function handleGenerateDraft() {
    if (!selectedAngle) {
      return;
    }

    setError("");
    setDraftId("");
    setPendingLabel("Writing draft");

    startTransition(async () => {
      const result = await onGenerate(selectedAngle);

      if (result.error) {
        setError(result.error);
        setPendingLabel("");
        return;
      }

      if (result.ideaQuality) {
        setIdeaQuality(result.ideaQuality);
      }

      setBlocked(Boolean(result.blocked));

      if (result.draftId) {
        setDraftId(result.draftId);
      }

      setPendingLabel("");
    });
  }

  return (
    <div className="space-y-4">
      <Button type="button" disabled={isPending} onClick={handleGenerateAngles}>
        <Sparkles className="mr-2 h-4 w-4" />
        {isPending && pendingLabel === "Generating angles" ? "Generating angles" : "Generate 3 angles"}
      </Button>

      {ideaQuality ? <IdeaQualityReport blocked={blocked} ideaQuality={ideaQuality} /> : null}

      {angles.length > 0 ? (
        <div className="space-y-3">
          <AngleChoices angles={angles} selectedAngle={selectedAngle} onSelect={setSelectedAngle} />
          <Button
            type="button"
            disabled={isPending || blocked || !selectedAngle}
            onClick={handleGenerateDraft}
          >
            {isPending && pendingLabel === "Writing draft" ? "Writing draft" : "Generate draft from selected angle"}
          </Button>
        </div>
      ) : null}

      {blocked && angles.length > 0 ? (
        <p className="max-w-2xl text-sm text-muted-foreground">
          The angles are available for direction, but this idea needs a sharper raw input before drafting.
        </p>
      ) : null}

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
