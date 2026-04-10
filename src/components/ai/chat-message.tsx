"use client";

import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? "Y" : "AI"}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            if (isUser) {
              return <p key={i}>{part.text}</p>;
            }
            return (
              <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {part.text}
                </ReactMarkdown>
              </div>
            );
          }
          if (part.type === "tool-segmentKnowledge") {
            return (
              <div
                key={i}
                className="my-1 rounded border border-border/50 bg-background/50 px-2 py-1 text-xs text-muted-foreground"
              >
                Looking up: {((part as unknown as { args?: { topic?: string } }).args?.topic) ?? "Segment docs"}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
