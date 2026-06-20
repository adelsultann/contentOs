"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { draftAnalyticsSchema, type DraftAnalyticsFormValues } from "@/lib/validations";

const metricFields = [
  { name: "views", label: "Views" },
  { name: "likes", label: "Likes" },
  { name: "comments", label: "Comments" },
  { name: "shares", label: "Shares" },
  { name: "saves", label: "Saves" }
] as const;

export function ContentAnalyticsForm({
  defaultValues,
  onSave
}: {
  defaultValues?: DraftAnalyticsFormValues;
  onSave: (values: DraftAnalyticsFormValues) => Promise<{ ok?: boolean; error?: string } | void>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DraftAnalyticsFormValues>({
    resolver: zodResolver(draftAnalyticsSchema),
    defaultValues: defaultValues ?? {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      notes: ""
    }
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit((values) => {
        setMessage("");
        startTransition(async () => {
          const result = await onSave(values);
          if (result?.error) {
            setMessage(result.error);
            return;
          }

          setMessage("Performance snapshot saved.");
          router.refresh();
        });
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricFields.map((field) => (
          <Field key={field.name} label={field.label} error={errors[field.name]?.message}>
            <Input
              min={0}
              step={1}
              type="number"
              inputMode="numeric"
              {...register(field.name, { valueAsNumber: true })}
            />
          </Field>
        ))}
      </div>

      <Field label="Notes" error={errors.notes?.message}>
        <Textarea
          className="min-h-24"
          placeholder="Add context: timing, creative changes, hook, audience reaction, or anything worth remembering."
          {...register("notes")}
        />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          Save a new snapshot whenever you check post performance.
        </p>
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Saving" : "Save performance"}
        </Button>
      </div>

      {message ? (
        <p className={message.includes("check") || message.includes("not found") ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
