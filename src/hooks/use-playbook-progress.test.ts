import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaybookProgress } from "@/hooks/use-playbook-progress";

beforeEach(() => {
  localStorage.clear();
});

describe("usePlaybookProgress", () => {
  it("initializes with empty completedSteps", () => {
    const { result } = renderHook(() => usePlaybookProgress("pb-1"));

    expect(result.current.completedSteps).toEqual([]);
  });

  it("reads from localStorage on mount", () => {
    localStorage.setItem("playbook-progress-pb-2", JSON.stringify([0, 1, 2]));

    const { result } = renderHook(() => usePlaybookProgress("pb-2"));

    expect(result.current.completedSteps).toEqual([0, 1, 2]);
  });

  it("markComplete adds step to completedSteps", () => {
    const { result } = renderHook(() => usePlaybookProgress("pb-3"));

    act(() => {
      result.current.markComplete(1);
    });

    expect(result.current.completedSteps).toContain(1);
  });

  it("markComplete persists to localStorage", () => {
    const { result } = renderHook(() => usePlaybookProgress("pb-4"));

    act(() => {
      result.current.markComplete(2);
    });

    expect(localStorage.getItem("playbook-progress-pb-4")).toBe(
      JSON.stringify([2]),
    );
  });

  it("markComplete is idempotent (no duplicates)", () => {
    const { result } = renderHook(() => usePlaybookProgress("pb-5"));

    act(() => {
      result.current.markComplete(1);
    });
    act(() => {
      result.current.markComplete(1);
    });

    expect(result.current.completedSteps).toEqual([1]);
  });

  it("isComplete returns true for completed steps", () => {
    const { result } = renderHook(() => usePlaybookProgress("pb-6"));

    act(() => {
      result.current.markComplete(3);
    });

    expect(result.current.isComplete(3)).toBe(true);
  });

  it("isComplete returns false for incomplete steps", () => {
    const { result } = renderHook(() => usePlaybookProgress("pb-7"));

    expect(result.current.isComplete(5)).toBe(false);
  });

  it("handles corrupted JSON in localStorage (silent reset, stays empty)", () => {
    localStorage.setItem("playbook-progress-pb-8", "NOT_VALID_JSON{{{");

    const { result } = renderHook(() => usePlaybookProgress("pb-8"));

    expect(result.current.completedSteps).toEqual([]);
  });

  it("uses correct storage key (playbook-progress-{id})", () => {
    localStorage.setItem("playbook-progress-abc-123", JSON.stringify([7]));

    const { result } = renderHook(() => usePlaybookProgress("abc-123"));

    expect(result.current.completedSteps).toEqual([7]);
  });

  it("different playbookIds use different storage keys", () => {
    localStorage.setItem("playbook-progress-alpha", JSON.stringify([1, 2]));
    localStorage.setItem("playbook-progress-beta", JSON.stringify([3, 4]));

    const { result: resultAlpha } = renderHook(() =>
      usePlaybookProgress("alpha"),
    );
    const { result: resultBeta } = renderHook(() =>
      usePlaybookProgress("beta"),
    );

    expect(resultAlpha.current.completedSteps).toEqual([1, 2]);
    expect(resultBeta.current.completedSteps).toEqual([3, 4]);
  });
});
