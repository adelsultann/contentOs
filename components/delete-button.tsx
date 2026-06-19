"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  label,
  onDelete
}: {
  label: string;
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(`Delete ${label}? This cannot be undone.`)) {
          startTransition(async () => {
            await onDelete();
          });
        }
      }}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? "Deleting" : "Delete"}
    </Button>
  );
}
