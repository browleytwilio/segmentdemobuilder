"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { PlaybookRow } from "@/lib/compiler/types";
import { downloadMarkdown } from "@/lib/export/download";
import { trackEvent } from "@/lib/analytics/events";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { SparklesIcon, DownloadIcon, LoaderIcon } from "lucide-react";

const transport = new DefaultChatTransport({ api: "/api/ai/demo-script" });

interface AIScriptGeneratorProps {
  playbook: PlaybookRow;
}

export function AIScriptGenerator({ playbook }: AIScriptGeneratorProps) {
  const [generated, setGenerated] = useState(false);
  const hasTriggered = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport,
    onFinish: () => {
      trackEvent("AI Script Generated", {
        playbook_id: playbook.id,
        industry: playbook.industry,
        persona: playbook.demo_config.persona,
      });
    },
  });

  // Auto-scroll while streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isStreaming = status === "streaming" || status === "submitted";

  function handleGenerate() {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    setGenerated(true);
    sendMessage(
      {
        text: `Generate a demo script for ${playbook.customer_name} in the ${playbook.industry} industry, targeting a ${playbook.demo_config.persona}.`,
      },
      {
        body: {
          playbook: {
            customerName: playbook.customer_name,
            persona: playbook.demo_config.persona,
            industry: playbook.industry,
            scenarioSlugs: playbook.demo_config.scenarioSlugs ?? {},
            architecture: playbook.demo_config.architecture,
          },
        },
      }
    );
  }

  function handleExport() {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    const text = lastAssistant.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n");
    downloadMarkdown(`${playbook.customer_name}-ai-demo-script.md`, text);
  }

  // Get the streamed content from the latest assistant message
  const assistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const streamedText = assistantMessage?.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("\n");

  if (!generated) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-8">
        <SparklesIcon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Generate a personalized demo script with AI
        </p>
        <Button onClick={handleGenerate} size="sm" className="gap-2">
          <SparklesIcon className="size-3.5" />
          Generate AI Script
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SparklesIcon className="size-4 text-primary" />
          AI-Generated Script
          {isStreaming && (
            <LoaderIcon className="size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
        {!isStreaming && streamedText && (
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <DownloadIcon className="size-3.5" />
            Export
          </Button>
        )}
      </div>
      <div
        ref={scrollRef}
        className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-6"
      >
        {streamedText ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {streamedText}
          </ReactMarkdown>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderIcon className="size-4 animate-spin" />
            Generating script...
          </div>
        )}
      </div>
    </div>
  );
}
