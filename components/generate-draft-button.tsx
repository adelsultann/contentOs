"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function GenerateDraftButton({
  onGenerate
}: {
  onGenerate: () => Promise<{ ok?: boolean; draftId?: string; error?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [draftId, setDraftId] = useState("");

  return (
    <div className="space-y-3">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError("");
          setDraftId("");
          startTransition(async () => {
            const result = await onGenerate();

            if (result.error) {
              setError(result.error);
              return;
            }

            if (result.draftId) {
              setDraftId(result.draftId);
            }
          });
        }}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isPending ? "Generating" : "Generate with agents"}
      </Button>

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
