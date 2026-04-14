"use client";

import { useState, useEffect, useCallback } from "react";
import { updatePlaybookProgress } from "@/app/(app)/playbooks/actions";

function storageKey(playbookId: string) {
  return `playbook-progress-${playbookId}`;
}

export function usePlaybookProgress(
  playbookId: string,
  initialProgress?: number[]
) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Merge: DB progress (authoritative) + localStorage (optimistic cache)
    const stored = localStorage.getItem(storageKey(playbookId));
    let local: number[] = [];
    if (stored) {
      try {
        local = JSON.parse(stored);
      } catch {
        // corrupted — ignore
      }
    }
    const db = initialProgress ?? [];
    const merged = Array.from(new Set([...db, ...local])).sort(
      (a, b) => a - b
    );
    setCompletedSteps(merged);
    // Sync merged state back to localStorage
    localStorage.setItem(storageKey(playbookId), JSON.stringify(merged));
  }, [playbookId, initialProgress]);

  const markComplete = useCallback(
    (step: number) => {
      setCompletedSteps((prev) => {
        if (prev.includes(step)) return prev;
        const next = [...prev, step];
        localStorage.setItem(storageKey(playbookId), JSON.stringify(next));
        // Fire-and-forget DB sync
        updatePlaybookProgress(playbookId, next);
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
