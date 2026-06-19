"use client";

import type { AiProviderConfig } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { agentRoles } from "@/lib/constants";
import { agentConfigSchema, type AgentConfigFormValues } from "@/lib/validations";

export function AgentForm({
  defaultValues,
  providers,
  submitLabel,
  onSubmit
}: {
  defaultValues?: Partial<AgentConfigFormValues>;
  providers: Pick<AiProviderConfig, "id" | "name" | "defaultModel" | "isEnabled">[];
  submitLabel: string;
  onSubmit: (values: AgentConfigFormValues) => Promise<{ error?: string } | void>;
}) {
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AgentConfigFormValues>({
    resolver: zodResolver(agentConfigSchema),
    defaultValues: {
      name: "",
      description: "",
      role: "writer",
      goal: "",
      systemPrompt: "",
      outputFormat: "",
      providerConfigId: providers[0]?.id ?? "",
      model: "",
      temperature: "",
      isEnabled: true,
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Agent name" error={errors.name?.message}>
          <Input placeholder="Saudi X Writer" {...register("name")} />
        </Field>
        <Field label="Role" error={errors.role?.message}>
          <Select {...register("role")}>
            {agentRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Description" error={errors.description?.message}>
        <Input placeholder="What this agent is responsible for" {...register("description")} />
      </Field>

      <Field label="Goal" error={errors.goal?.message}>
        <Textarea placeholder="The outcome this agent should optimize for." {...register("goal")} />
      </Field>

      <Field label="System prompt" error={errors.systemPrompt?.message}>
        <Textarea
          className="min-h-56"
          placeholder="Define the agent behavior, constraints, writing style rules, and boundaries."
          {...register("systemPrompt")}
        />
      </Field>

      <Field label="Output format" error={errors.outputFormat?.message}>
        <Textarea placeholder="Example: return one X post, no hashtags, Saudi Arabic, max 280 characters." {...register("outputFormat")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="API provider" error={errors.providerConfigId?.message}>
          <Select {...register("providerConfigId")}>
            <option value="">Use default provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id} disabled={!provider.isEnabled}>
                {provider.name} ({provider.defaultModel})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Model override" error={errors.model?.message}>
          <Input placeholder="Leave blank for provider default" {...register("model")} />
        </Field>
        <Field label="Temperature override" error={errors.temperature?.message}>
          <Input type="number" min="0" max="2" step="0.1" placeholder="Provider default" {...register("temperature")} />
        </Field>
      </div>

      <label className="flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <input type="checkbox" className="h-4 w-4" {...register("isEnabled")} />
        Enabled
      </label>

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
