"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useBuilderStore } from "@/lib/stores/builder-store";
import { trackEvent } from "@/lib/analytics/events";
import { ChatMessage } from "./chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon, SendIcon, SquareIcon, SparklesIcon } from "lucide-react";

const transport = new DefaultChatTransport({ api: "/api/ai/chat" });

interface CopilotChatProps {
  open: boolean;
  onClose: () => void;
}

export function CopilotChat({ open, onClose }: CopilotChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendTimeRef = useRef<number>(0);
  const [input, setInput] = useState("");

  const customerName = useBuilderStore((s) => s.customerName);
  const industry = useBuilderStore((s) => s.industry);
  const persona = useBuilderStore((s) => s.persona);
  const architecture = useBuilderStore((s) => s.architecture);
  const selectedScenarios = useBuilderStore((s) => s.selectedScenarios);

  const hasContext = !!(customerName || industry || persona);

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    onFinish: () => {
      if (sendTimeRef.current) {
        trackEvent("AI Chat Response Received", {
          response_time_ms: Date.now() - sendTimeRef.current,
        });
        sendTimeRef.current = 0;
      }
    },
  });

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const isStreaming = status === "streaming" || status === "submitted";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendTimeRef.current = Date.now();
    trackEvent("AI Chat Sent", {
      message_length: input.length,
      has_playbook_context: hasContext,
    });
    sendMessage(
      { text: input },
      {
        body: hasContext
          ? { context: { customerName, industry, persona, architecture, selectedScenarios } }
          : undefined,
      }
    );
    setInput("");
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[600px] w-[400px] flex-col rounded-tl-xl border border-border bg-background shadow-2xl sm:bottom-4 sm:right-4 sm:rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" />
          <span className="text-sm font-medium">Segment Copilot</span>
          {hasContext && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
              Context
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="size-7 p-0">
          <XIcon className="size-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 pt-12 text-center text-sm text-muted-foreground">
            <SparklesIcon className="size-8 opacity-50" />
            <p className="font-medium">How can I help?</p>
            <p className="text-xs">
              Ask about Segment concepts, get demo advice, or troubleshoot
              issues.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="border-t p-3">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Segment..."
            className="h-9 text-sm"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => stop()}
              className="shrink-0"
            >
              <SquareIcon className="size-3.5" />
            </Button>
          ) : (
            <Button type="submit" size="sm" className="shrink-0" disabled={!input.trim()}>
              <SendIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
