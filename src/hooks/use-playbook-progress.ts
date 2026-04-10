"use client";

import { useState, useEffect, useCallback } from "react";

function storageKey(playbookId: string) {
  return `playbook-progress-${playbookId}`;
}

export function usePlaybookProgress(playbookId: string) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(playbookId));
    if (stored) {
      try {
        setCompletedSteps(JSON.parse(stored));
      } catch {
        // corrupted — reset
      }
    }
  }, [playbookId]);

  const markComplete = useCallback(
    (step: number) => {
      setCompletedSteps((prev) => {
        if (prev.includes(step)) return prev;
        const next = [...prev, step];
        localStorage.setItem(storageKey(playbookId), JSON.stringify(next));
        return next;
      });
    },
    [playbookId]
  );

  const isComplete = useCallback(
    (step: number) => completedSteps.includes(step),
    [completedSteps]
  );

  return { completedSteps, markComplete, isComplete };
}
