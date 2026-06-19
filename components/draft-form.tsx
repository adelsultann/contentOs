"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { draftStatuses, platforms } from "@/lib/constants";
import { draftSchema, type DraftFormValues } from "@/lib/validations";

export function DraftForm({
  defaultValues,
  onSubmit
}: {
  defaultValues: DraftFormValues;
  onSubmit: (values: DraftFormValues) => Promise<{ error?: string } | void>;
}) {
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DraftFormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues
  });

  return (
    <form
      className="grid gap-5"
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Platform" error={errors.platform?.message}>
          <Select {...register("platform")}>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register("status")}>
            {draftStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Content" error={errors.content?.message}>
        <Textarea className="min-h-64" placeholder="Draft content" {...register("content")} />
      </Field>

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Saving" : "Save draft"}
        </Button>
      </div>
    </form>
  );
}
