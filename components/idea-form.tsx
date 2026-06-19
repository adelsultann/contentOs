"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { ideaPriorities, ideaStatuses } from "@/lib/constants";
import { ideaSchema, type IdeaFormValues } from "@/lib/validations";

export function IdeaForm({
  defaultValues,
  onSubmit,
  submitLabel
}: {
  defaultValues?: Partial<IdeaFormValues>;
  onSubmit: (values: IdeaFormValues) => Promise<{ error?: string } | void>;
  submitLabel: string;
}) {
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: "",
      rawInput: "",
      topic: "",
      status: "captured",
      priority: "medium",
      ...defaultValues
    }
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
      <Field label="Title" error={errors.title?.message}>
        <Input placeholder="A sharp angle for a future post" {...register("title")} />
      </Field>

      <Field label="Raw input" error={errors.rawInput?.message}>
        <Textarea
          placeholder="Paste the thought, voice note transcript, rough observation, or messy idea here."
          {...register("rawInput")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Topic" error={errors.topic?.message}>
          <Input placeholder="Founder lessons" {...register("topic")} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <Select {...register("status")}>
            {ideaStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority" error={errors.priority?.message}>
          <Select {...register("priority")}>
            {ideaPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Saving" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
