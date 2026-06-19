"use client";

import { Play } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AgentRunForm({
  onRun
}: {
  onRun: (input: string) => Promise<{ ok?: boolean; content?: string; error?: string } | void>;
}) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [output, setOutput] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");
        setOutput("");
        startTransition(async () => {
          const result = await onRun(input);
          if (result?.error) {
            setMessage(result.error);
            return;
          }

          setMessage("Agent run completed.");
          setOutput(result?.content ?? "");
          setInput("");
        });
      }}
    >
      <Textarea
        className="min-h-36"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Give this agent a task or paste an idea to test its behavior."
      />
      {message ? (
        <p className={message.includes("completed") ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
          {message}
        </p>
      ) : null}
      {output ? (
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="whitespace-pre-wrap text-sm">{output}</p>
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !input.trim()}>
          <Play className="mr-2 h-4 w-4" />
          {isPending ? "Running" : "Run agent"}
        </Button>
      </div>
    </form>
  );
}
