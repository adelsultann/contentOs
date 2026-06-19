"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { styleProfileSchema, type StyleProfileFormValues } from "@/lib/validations";

export function StyleProfileForm({
  defaultValues,
  onSubmit
}: {
  defaultValues: StyleProfileFormValues;
  onSubmit: (values: StyleProfileFormValues) => Promise<{ ok?: boolean; error?: string } | void>;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<StyleProfileFormValues>({
    resolver: zodResolver(styleProfileSchema),
    defaultValues
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit((values) => {
        setMessage("");
        startTransition(async () => {
          const result = await onSubmit(values);
          setMessage(result?.error ?? "Style profile saved.");
        });
      })}
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Dialect" error={errors.dialect?.message}>
          <Input placeholder="Saudi Arabic" {...register("dialect")} />
        </Field>
        <Field label="Tone" error={errors.tone?.message}>
          <Input placeholder="Direct, warm, practical" {...register("tone")} />
        </Field>
        <Field label="Audience" error={errors.audience?.message}>
          <Input placeholder="Saudi founders and operators" {...register("audience")} />
        </Field>
      </div>

      <Field label="Writing rules" error={errors.writingRules?.message}>
        <Textarea placeholder="Rules the future agent should follow." {...register("writingRules")} />
      </Field>
      <Field label="Banned phrases" error={errors.bannedPhrases?.message}>
        <Textarea placeholder="Words, cliches, or structures to avoid." {...register("bannedPhrases")} />
      </Field>
      <Field label="Common phrases" error={errors.commonPhrases?.message}>
        <Textarea placeholder="Phrases you naturally use." {...register("commonPhrases")} />
      </Field>
      <Field label="Example posts" error={errors.examplePosts?.message}>
        <Textarea className="min-h-48" placeholder="Paste posts that represent your voice." {...register("examplePosts")} />
      </Field>

      {message ? (
        <p className={message.includes("check") ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Saving" : "Save style profile"}
        </Button>
      </div>
    </form>
  );
}
