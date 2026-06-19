"use client";

import { Bot, Plus, Save, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { draftStatuses, platforms } from "@/lib/constants";
import type { DraftThreadFormValues } from "@/lib/validations";

type DraftPostValue = {
  content: string;
};

export function DraftThreadEditor({
  defaultValues,
  onSave,
  onRewrite
}: {
  defaultValues: DraftThreadFormValues;
  onSave: (values: DraftThreadFormValues) => Promise<{ ok?: boolean; error?: string } | void>;
  onRewrite: (values: { instructions: string }) => Promise<{ ok?: boolean; notes?: string; error?: string } | void>;
}) {
  const [platform, setPlatform] = useState(defaultValues.platform);
  const [status, setStatus] = useState(defaultValues.status);
  const [posts, setPosts] = useState<DraftPostValue[]>(defaultValues.posts);
  const [instructions, setInstructions] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [isRewriting, startRewriting] = useTransition();

  function updatePost(index: number, content: string) {
    setPosts((current) =>
      current.map((post, postIndex) => (postIndex === index ? { content } : post))
    );
  }

  function removePost(index: number) {
    setPosts((current) => current.filter((_, postIndex) => postIndex !== index));
  }

  function payload(): DraftThreadFormValues {
    return {
      platform,
      status,
      posts: posts.map((post) => ({
        content: post.content
      }))
    };
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Platform</span>
          <Select value={platform} onChange={(event) => setPlatform(event.target.value as typeof platform)}>
            {platforms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium">Status</span>
          <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            {draftStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="grid gap-4">
        {posts.map((post, index) => (
          <div key={index} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Post {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={posts.length === 1}
                onClick={() => removePost(index)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
            <Textarea
              className="min-h-40"
              value={post.content}
              onChange={(event) => updatePost(index, event.target.value)}
              placeholder="Write this post"
            />
            <p className="mt-2 text-xs text-muted-foreground">{post.content.length} characters</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setPosts((current) => [...current, { content: "" }])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add post
        </Button>
        <Button
          type="button"
          disabled={isSaving}
          onClick={() => {
            setMessage("");
            startSaving(async () => {
              const result = await onSave(payload());
              setMessage(result?.error ?? "Draft saved.");
            });
          }}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving" : "Save thread"}
        </Button>
      </div>

      <div className="rounded-lg border p-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Ask the agent to rewrite with adjustments</span>
          <Textarea
            className="min-h-28"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="Example: Make it a 3-post thread, more practical, less formal, stronger opening, keep Saudi Arabic style."
          />
        </label>
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={isRewriting || !instructions.trim()}
            onClick={() => {
              setMessage("");
              startRewriting(async () => {
                const result = await onRewrite({ instructions });
                if (result?.error) {
                  setMessage(result.error);
                  return;
                }

                setMessage(result?.notes ? `Agent rewrite complete: ${result.notes}` : "Agent rewrite complete.");
                setInstructions("");
                window.location.reload();
              });
            }}
          >
            <Bot className="mr-2 h-4 w-4" />
            {isRewriting ? "Rewriting" : "Rewrite with agent"}
          </Button>
        </div>
      </div>

      {message ? (
        <p className={message.includes("failed") || message.includes("error") ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
