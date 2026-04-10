"use client";

import { useState, useRef, useEffect } from "react";
import { trackEvent } from "@/lib/analytics/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SparklesIcon, LoaderIcon, CheckIcon, XIcon } from "lucide-react";

interface AITemplateAssistantProps {
  templateId: string;
  templateContent: string;
  onAccept: (refinedContent: string) => void;
}

export function AITemplateAssistant({
  templateId,
  templateContent,
  onAccept,
}: AITemplateAssistantProps) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset result when template changes
  useEffect(() => {
    setResult(null);
    setInstruction("");
  }, [templateId]);

  async function handleRefine(e: React.FormEvent) {
    e.preventDefault();
    if (!instruction.trim() || loading) return;
    setLoading(true);
    setResult(null);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/refine-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateContent, instruction }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("Failed to refine template");
      if (!res.body) throw new Error("No response body");

      // Read the raw text from the streaming response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      // Extract text content from the SSE stream
      // The stream format is SSE with data lines containing JSON
      const textParts: string[] = [];
      for (const line of fullText.split("\n")) {
        if (line.startsWith("g:")) {
          try {
            const parsed = JSON.parse(line.slice(2));
            if (parsed?.type === "text" && parsed?.value) {
              textParts.push(parsed.value);
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }

      const refinedText = textParts.join("");
      if (refinedText) {
        setResult(refinedText);
        trackEvent("AI Template Refined", { template_id: templateId });
      } else {
        setResult(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleAccept() {
    if (result) {
      onAccept(result);
      setResult(null);
      setInstruction("");
    }
  }

  function handleDismiss() {
    setResult(null);
  }

  return (
    <div className="border-t px-4 py-2">
      <form onSubmit={handleRefine} className="flex items-center gap-2">
        <SparklesIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <Input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="AI: e.g., Add more detail for FinTech..."
          className="h-7 text-xs"
          disabled={loading}
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!instruction.trim() || loading}
          className="h-7 text-xs"
        >
          {loading ? (
            <LoaderIcon className="size-3 animate-spin" />
          ) : (
            "Refine"
          )}
        </Button>
      </form>
      {result && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            AI refinement ready
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAccept}
            className="h-6 gap-1 text-xs"
          >
            <CheckIcon className="size-3" />
            Accept
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-6 gap-1 text-xs"
          >
            <XIcon className="size-3" />
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
