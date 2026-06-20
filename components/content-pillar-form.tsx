"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  contentPillarSchema,
  type ContentPillarFormValues
} from "@/lib/validations";

export function ContentPillarForm({
  defaultValues,
  submitLabel,
  onSubmit
}: {
  defaultValues?: Partial<ContentPillarFormValues>;
  submitLabel: string;
  onSubmit: (values: ContentPillarFormValues) => Promise<{ ok?: boolean; error?: string } | void>;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContentPillarFormValues>({
    resolver: zodResolver(contentPillarSchema),
    defaultValues: {
      name: "",
      description: "",
      ...defaultValues
    }
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit((values) => {
        setMessage("");
        startTransition(async () => {
          const result = await onSubmit(values);
          if (result?.error) {
            setMessage(result.error);
            return;
          }

          setMessage("Content pillar saved.");
          if (!defaultValues) {
            reset({ name: "", description: "" });
          }
        });
      })}
    >
      <Field label="Name" error={errors.name?.message}>
        <Input placeholder="Founder lessons" {...register("name")} />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <Textarea
          placeholder="What belongs in this pillar, the audience need it serves, and angles to prioritize."
          {...register("description")}
        />
      </Field>

      {message ? (
        <p className={message.includes("check") ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Saving" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
