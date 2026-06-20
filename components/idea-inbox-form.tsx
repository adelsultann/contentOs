"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Inbox } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ideaInboxSchema, type IdeaInboxFormValues } from "@/lib/validations";

export function IdeaInboxForm({
  onSubmit
}: {
  onSubmit: (values: IdeaInboxFormValues) => Promise<{ error?: string } | void>;
}) {
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<IdeaInboxFormValues>({
    resolver: zodResolver(ideaInboxSchema),
    defaultValues: {
      rawInput: ""
    }
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit((values) => {
        setServerError("");
        startTransition(async () => {
          const result = await onSubmit(values);

          if (result?.error) {
            setServerError(result.error);
          }
        });
      })}
    >
      <Field label="Rough thought" error={errors.rawInput?.message}>
        <Textarea
          className="min-h-64 text-base leading-7"
          placeholder="Dump the thought here. A half-formed lesson, mistake, voice-note transcript, thread idea, or messy observation is enough."
          autoFocus
          {...register("rawInput")}
        />
      </Field>

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Inbox className="mr-2 h-4 w-4" />
          {isPending ? "Capturing" : "Capture to inbox"}
        </Button>
      </div>
    </form>
  );
}
