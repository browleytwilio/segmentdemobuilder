import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

let mockStep = 0;
const mockSetStep = vi.fn((s: number) => {
  mockStep = s;
});

vi.mock("@/lib/stores/builder-store", () => ({
  useBuilderStore: vi.fn((selector: any) => {
    const state = { currentStep: mockStep, setStep: mockSetStep };
    return selector(state);
  }),
}));

vi.mock("@/lib/analytics/events", () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from "@/lib/analytics/events";
import {
  useBuilderWizard,
  STEP_LABELS,
} from "@/lib/builder/use-builder-wizard";

beforeEach(() => {
  mockStep = 0;
  mockSetStep.mockClear();
  (trackEvent as ReturnType<typeof vi.fn>).mockClear();
});

describe("useBuilderWizard", () => {
  it("initializes with currentStep from store (default 0)", () => {
    const { result } = renderHook(() => useBuilderWizard());

    expect(result.current.currentStep).toBe(0);
  });

  it("goNext increments step", () => {
    const { result } = renderHook(() => useBuilderWizard());

    act(() => {
      result.current.goNext();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it("goNext does not exceed step 3", () => {
    mockStep = 3;
    const { result } = renderHook(() => useBuilderWizard());

    act(() => {
      result.current.goNext();
    });

    expect(result.current.currentStep).toBe(3);
  });

  it("goBack decrements step", () => {
    mockStep = 2;
    const { result } = renderHook(() => useBuilderWizard());

    act(() => {
      result.current.goBack();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it("goBack does not go below step 0", () => {
    mockStep = 0;
    const { result } = renderHook(() => useBuilderWizard());

    act(() => {
      result.current.goBack();
    });

    expect(result.current.currentStep).toBe(0);
  });

  it("direction is 1 after goNext", () => {
    const { result } = renderHook(() => useBuilderWizard());

    act(() => {
      result.current.goNext();
    });

    expect(result.current.direction).toBe(1);
  });

  it("direction is -1 after goBack", () => {
    mockStep = 2;
    const { result } = renderHook(() => useBuilderWizard());

    act(() => {
      result.current.goBack();
    });

    expect(result.current.direction).toBe(-1);
  });

  it("isFirst is true at step 0", () => {
    mockStep = 0;
    const { result } = renderHook(() => useBuilderWizard());

    expect(result.current.isFirst).toBe(true);
  });

  it("isLast is true at step 3", () => {
    mockStep = 3;
    const { result } = renderHook(() => useBuilderWizard());

    expect(result.current.isLast).toBe(true);
  });

  it("totalSteps is 4", () => {
    const { result } = renderHook(() => useBuilderWizard());

    expect(result.current.totalSteps).toBe(4);
  });

  it("fires trackEvent('Wizard Step Navigated') on goNext", () => {
    const { result } = renderHook(() => useBuilderWizard());

    act(() => {
      result.current.goNext();
    });

    expect(trackEvent).toHaveBeenCalledWith(
      "Wizard Step Navigated",
      expect.objectContaining({
        from: 0,
        to: 1,
        direction: "forward",
      }),
    );
  });

  it("fires trackEvent('Wizard Step Navigated') on goBack", () => {
    mockStep = 2;
    const { result } = renderHook(() => useBuilderWizard());

    act(() => {
      result.current.goBack();
    });

    expect(trackEvent).toHaveBeenCalledWith(
      "Wizard Step Navigated",
      expect.objectContaining({
        from: 2,
        to: 1,
        direction: "backward",
      }),
    );
  });

  it("STEP_LABELS has exactly 4 entries", () => {
    expect(STEP_LABELS).toHaveLength(4);
    expect(STEP_LABELS).toEqual([
      "Context",
      "Architecture",
      "Scenarios",
      "Credentials",
    ]);
  });
});
