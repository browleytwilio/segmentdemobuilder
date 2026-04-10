"use client";

import { useRef } from "react";
import { SANITIZATION_MAP } from "@/lib/compiler/sanitizer";
import type { CompiledPrompt } from "@/lib/compiler/types";
import { useClipboard } from "@/hooks/use-clipboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckIcon, CopyIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

const placeholderValues = Object.values(SANITIZATION_MAP);
const placeholderRegex = new RegExp(
  `(${placeholderValues.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g"
);

/** Highlight placeholder strings in red */
function highlightPlaceholders(text: string): React.ReactNode {
  const parts = text.split(placeholderRegex);
  return parts.map((part, i) =>
    placeholderValues.includes(part) ? (
      <mark key={i} className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

interface PromptCardProps {
  prompt: CompiledPrompt;
  playbookId: string;
  isComplete: boolean;
  onMarkComplete: () => void;
}

export function PromptCard({
  prompt,
  playbookId,
  isComplete,
  onMarkComplete,
}: PromptCardProps) {
  const { copy } = useClipboard();
  const cardRef = useRef<HTMLDivElement>(null);

  const hasPlaceholders = placeholderRegex.test(prompt.promptText);
  // Reset regex lastIndex after test
  placeholderRegex.lastIndex = 0;

  return (
    <div ref={cardRef} id={`step-${prompt.stepNumber}`}>
      <Card
        className={isComplete ? "border-green-500/30 bg-green-500/5" : ""}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                Step {prompt.stepNumber}: {prompt.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {prompt.expectedOutput}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prompt block */}
          <div className="relative">
            <pre className="max-h-[32rem] overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap dark:bg-zinc-900">
              {hasPlaceholders
                ? highlightPlaceholders(prompt.promptText)
                : prompt.promptText}
            </pre>
            <Button
              size="lg"
              className="mt-3 w-full"
              onClick={() => {
                trackEvent("Prompt Copied", {
                  playbook_id: playbookId,
                  step_number: prompt.stepNumber,
                  prompt_title: prompt.title,
                });
                copy(prompt.promptText);
              }}
            >
              <CopyIcon className="size-4" />
              Copy Prompt to Clipboard
            </Button>
          </div>

          {/* Expected Output */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="text-sm font-medium mb-1">Expected Output</h4>
            <p className="text-xs text-muted-foreground">
              {prompt.expectedOutput}
            </p>
          </div>

          {/* Troubleshooting Accordion */}
          <Accordion onValueChange={(val) => {
            if (val) trackEvent("Troubleshooting Expanded", { playbook_id: playbookId, step_number: prompt.stepNumber });
          }}>
            <AccordionItem value="troubleshoot">
              <AccordionTrigger>
                Troubleshooting — What if the AI agent failed?
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">
                      Did the AI agent fail on a peer dependency?
                    </p>
                    <pre className="mt-1 rounded bg-muted p-2 text-xs">
                      Stop. Please run the installation again using
                      --legacy-peer-deps and ensure you are using the exact
                      version numbers provided.
                    </pre>
                  </div>
                  <div>
                    <p className="font-medium">
                      Did the AI agent skip a step or take a shortcut?
                    </p>
                    <pre className="mt-1 rounded bg-muted p-2 text-xs">
                      Stop. Please revert the last change and follow the
                      instructions exactly as written. Do not modify, skip, or
                      optimize any step.
                    </pre>
                  </div>
                  <div>
                    <p className="font-medium">
                      Did the AI agent produce a TypeScript error?
                    </p>
                    <pre className="mt-1 rounded bg-muted p-2 text-xs">
                      Stop. Run `npm run build` and fix any TypeScript errors
                      before proceeding. Show me the full error output.
                    </pre>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Mark Complete */}
          {!isComplete && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                trackEvent("Step Marked Complete", { playbook_id: playbookId, step_number: prompt.stepNumber });
                onMarkComplete();
              }}
            >
              <CheckIcon className="size-4" />
              Mark as Complete
            </Button>
          )}
          {isComplete && (
            <p className="text-center text-sm text-green-600 font-medium">
              Step completed
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
