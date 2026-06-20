import type { AgentRun } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type JsonRecord = Record<string, unknown>;

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function text(value: unknown, fallback = "Not provided") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getOutput(run: AgentRun) {
  return asRecord(parseJson(run.outputJson));
}

function scoreTone(score: number | null) {
  if (score === null) {
    return "text-muted-foreground";
  }
  if (score >= 8) {
    return "text-primary";
  }
  if (score >= 6) {
    return "text-amber-700";
  }
  return "text-destructive";
}

function JsonDebug({ run }: { run: AgentRun }) {
  return (
    <details className="rounded-lg border bg-muted/30 p-3">
      <summary className="cursor-pointer text-sm font-medium">Raw input/output</summary>
      <div className="mt-3 grid gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Input</p>
          <pre className="mt-1 max-h-72 overflow-auto rounded-md bg-background p-3 text-xs">{run.inputJson}</pre>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Output</p>
          <pre className="mt-1 max-h-72 overflow-auto rounded-md bg-background p-3 text-xs">{run.outputJson}</pre>
        </div>
      </div>
    </details>
  );
}

function BrainstormDetails({ run }: { run: AgentRun }) {
  const output = getOutput(run);

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <InfoBlock label="Main concept" value={text(output?.mainConcept)} />
        <InfoBlock label="Best angle" value={text(output?.bestAngle)} />
        <InfoBlock label="Target audience" value={text(output?.targetAudience)} />
        <InfoBlock label="Pillar suggestion" value={text(output?.contentPillarSuggestion)} />
      </div>
      <InfoBlock label="Why this could work" value={text(output?.whyThisCouldWork)} />
      <ListBlock label="Possible angles" items={stringArray(output?.possibleAngles)} />
    </div>
  );
}

function IdeaQualityDetails({ run }: { run: AgentRun }) {
  const output = getOutput(run);
  const scores = asRecord(output?.scores);
  const scoreRows = [
    ["Clarity", number(scores?.clarity)],
    ["Usefulness", number(scores?.usefulness)],
    ["Originality", number(scores?.originality)],
    ["Personal experience", number(scores?.personalExperience)],
    ["Job-opportunity value", number(scores?.jobOpportunityValue)]
  ] as const;
  const overallScore = number(output?.overallScore);

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Idea score</p>
        <div className="mt-1 flex items-end gap-3">
          <p className={`text-4xl font-semibold ${scoreTone(overallScore)}`}>{overallScore ?? "-"}</p>
          <Badge>{text(output?.recommendation, "no recommendation")}</Badge>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scoreRows.map(([label, value]) => (
          <div key={label} className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${scoreTone(value)}`}>{value ?? "-"}</p>
          </div>
        ))}
      </div>
      <InfoBlock label="Problem" value={text(output?.problem)} />
      <InfoBlock label="Better angle" value={text(output?.betterAngle)} />
    </div>
  );
}

function HookDetails({ run }: { run: AgentRun }) {
  const output = getOutput(run);
  const hooks = Array.isArray(output?.hooks) ? output.hooks : [];

  return (
    <div className="grid gap-4">
      <InfoBlock label="Recommended hook" value={text(output?.recommendedHook)} />
      <div className="grid gap-3">
        {hooks.map((item, index) => {
          const hook = asRecord(item);
          const hookScore = number(hook?.score);

          return (
            <div key={index} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{text(hook?.hook, "Untitled hook")}</p>
                <span className={`text-sm font-semibold ${scoreTone(hookScore)}`}>
                  {hookScore ?? "-"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{text(hook?.reason)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WriterDetails({ run }: { run: AgentRun }) {
  const output = getOutput(run);

  return (
    <div className="grid gap-4">
      <InfoBlock label="Writer draft" value={text(output?.draft)} preserveWhitespace />
      <InfoBlock label="Format" value={text(output?.format)} />
      <InfoBlock label="Notes" value={text(output?.notes)} />
    </div>
  );
}

function EditorDetails({ run }: { run: AgentRun }) {
  const output = getOutput(run);

  return (
    <div className="grid gap-4">
      <InfoBlock label="Edited draft" value={text(output?.editedDraft)} preserveWhitespace />
      <ListBlock label="Changes made" items={stringArray(output?.changesMade)} />
      <ListBlock label="Removed weaknesses" items={stringArray(output?.removedWeaknesses)} />
    </div>
  );
}

function ScoreDetails({ run }: { run: AgentRun }) {
  const output = getOutput(run);
  const scores = asRecord(output?.scores);
  const scoreRows = [
    ["Hook strength", number(scores?.hookStrength)],
    ["Clarity", number(scores?.clarity)],
    ["Style match", number(scores?.styleMatch)],
    ["Technical accuracy", number(scores?.technicalAccuracy)],
    ["Engagement potential", number(scores?.engagementPotential)],
    ["Job opportunity potential", number(scores?.jobOpportunityPotential)]
  ] as const;
  const overallScore = number(output?.overallScore);

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Overall score</p>
        <div className="mt-1 flex items-end gap-3">
          <p className={`text-4xl font-semibold ${scoreTone(overallScore)}`}>{overallScore ?? "-"}</p>
          <Badge>{text(output?.recommendation, "no recommendation")}</Badge>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scoreRows.map(([label, value]) => (
          <div key={label} className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${scoreTone(value)}`}>{value ?? "-"}</p>
          </div>
        ))}
      </div>
      <ListBlock label="Issues" items={stringArray(output?.issues)} />
    </div>
  );
}

function InfoBlock({
  label,
  value,
  preserveWhitespace = false
}: {
  label: string;
  value: string;
  preserveWhitespace?: boolean;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className={`mt-2 text-sm ${preserveWhitespace ? "whitespace-pre-wrap" : ""}`}>{value}</p>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No items returned.</p>
      ) : (
        <ul className="mt-2 grid gap-2">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="text-sm">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AgentSpecificDetails({ run }: { run: AgentRun }) {
  if (run.errorMessage) {
    return <p className="text-sm text-destructive">{run.errorMessage}</p>;
  }

  if (run.agentName === "Brainstorm Agent") {
    return <BrainstormDetails run={run} />;
  }

  if (run.agentName === "Idea Quality Score Agent") {
    return <IdeaQualityDetails run={run} />;
  }

  if (run.agentName === "Hook Agent") {
    return <HookDetails run={run} />;
  }

  if (run.agentName === "Writer Agent") {
    return <WriterDetails run={run} />;
  }

  if (run.agentName === "Editor Agent") {
    return <EditorDetails run={run} />;
  }

  if (run.agentName === "Score Agent") {
    return <ScoreDetails run={run} />;
  }

  return <JsonDebug run={run} />;
}

export function PipelineRunDetails({ runs }: { runs: AgentRun[] }) {
  const orderedNames = [
    "Idea Quality Score Agent",
    "Brainstorm Agent",
    "Hook Agent",
    "Writer Agent",
    "Editor Agent",
    "Score Agent"
  ];
  const orderedRuns = [...runs].sort((a, b) => {
    const byName = orderedNames.indexOf(a.agentName) - orderedNames.indexOf(b.agentName);

    if (byName !== 0) {
      return byName;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  if (orderedRuns.length === 0) {
    return <p className="text-sm text-muted-foreground">No agent runs are connected to this draft yet.</p>;
  }

  return (
    <div className="grid gap-4">
      {orderedRuns.map((run) => (
        <Card key={run.id}>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{run.agentName}</CardTitle>
                <CardDescription>
                  {formatDate(run.createdAt)}
                  {run.model ? ` · ${run.model}` : ""}
                  {run.temperature !== null ? ` · temp ${run.temperature}` : ""}
                </CardDescription>
              </div>
              <Badge>{run.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AgentSpecificDetails run={run} />
            <JsonDebug run={run} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
