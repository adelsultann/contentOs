"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { aiProviderPresets, aiProviders } from "@/lib/constants";
import {
  aiProviderConfigSchema,
  type AiProviderConfigFormValues
} from "@/lib/validations";

export function AiProviderForm({
  defaultValues,
  submitLabel,
  apiKeyHint,
  onSubmit
}: {
  defaultValues?: Partial<AiProviderConfigFormValues>;
  submitLabel: string;
  apiKeyHint: string;
  onSubmit: (values: AiProviderConfigFormValues) => Promise<{ ok?: boolean; error?: string } | void>;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AiProviderConfigFormValues>({
    resolver: zodResolver(aiProviderConfigSchema),
    defaultValues: {
      name: "",
      provider: "openai",
      baseUrl: aiProviderPresets.openai.baseUrl,
      apiKey: "",
      defaultModel: "",
      temperature: 0.7,
      isDefault: false,
      isEnabled: true,
      ...defaultValues
    }
  });

  const provider = watch("provider");

  useEffect(() => {
    const preset = aiProviderPresets[provider];
    if (preset.baseUrl) {
      setValue("baseUrl", preset.baseUrl, { shouldValidate: true });
    }
  }, [provider, setValue]);

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit((values) => {
        setMessage("");
        startTransition(async () => {
          const result = await onSubmit(values);
          setMessage(result?.error ?? "API provider saved.");
        });
      })}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Provider name" error={errors.name?.message}>
          <Input placeholder="OpenAI main account" {...register("name")} />
        </Field>
        <Field label="Provider" error={errors.provider?.message}>
          <Select {...register("provider")}>
            {aiProviders.map((providerName) => (
              <option key={providerName} value={providerName}>
                {aiProviderPresets[providerName].label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="API base URL" error={errors.baseUrl?.message}>
        <Input placeholder="https://api.openai.com/v1" {...register("baseUrl")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="API key" error={errors.apiKey?.message}>
          <Input type="password" placeholder={apiKeyHint} autoComplete="off" {...register("apiKey")} />
        </Field>
        <Field label="Default model" error={errors.defaultModel?.message}>
          <Input placeholder={aiProviderPresets[provider].modelPlaceholder} {...register("defaultModel")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <Field label="Temperature" error={errors.temperature?.message}>
          <Input type="number" min="0" max="2" step="0.1" {...register("temperature")} />
        </Field>
        <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
          <input type="checkbox" className="h-4 w-4" {...register("isDefault")} />
          Default
        </label>
        <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
          <input type="checkbox" className="h-4 w-4" {...register("isEnabled")} />
          Enabled
        </label>
      </div>

      {message ? (
        <p className={message.includes("check") || message.includes("required") ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
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
