import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ──────────────────────────────────────────────────────────

const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics/events", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: React.forwardRef(({ ...props }: any, ref: any) => (
    <input ref={ref} {...props} />
  )),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

// ── Imports ────────────────────────────────────────────────────────

import {
  needsRehydration,
  rehydratePrompts,
  RehydrationModal,
} from "./rehydration-modal";
import type { CompiledPrompt } from "@/lib/compiler/types";

// ── Helpers ────────────────────────────────────────────────────────

function makePrompt(text: string): CompiledPrompt {
  return {
    stepNumber: 1,
    title: "Step",
    expectedOutput: "output",
    promptText: text,
  };
}

// ── Pure-function tests ────────────────────────────────────────────

describe("needsRehydration", () => {
  it("returns true when prompts contain YOUR_* placeholders", () => {
    const prompts = [makePrompt("Use YOUR_SEGMENT_WRITE_KEY here")];
    expect(needsRehydration(prompts)).toBe(true);
  });

  it("returns false when no placeholders present", () => {
    const prompts = [makePrompt("No placeholders in this text")];
    expect(needsRehydration(prompts)).toBe(false);
  });
});

describe("rehydratePrompts", () => {
  it("replaces placeholders with real keys", () => {
    const prompts = [
      makePrompt("key=YOUR_SEGMENT_WRITE_KEY url=YOUR_SUPABASE_URL"),
    ];
    const keys = {
      segmentWriteFrontend: "real-write-key",
      segmentWriteBackend: "",
      segmentWorkspace: "",
      segmentProfileToken: "",
      supabaseUrl: "https://real.supabase.co",
      supabaseAnon: "",
    };
    const result = rehydratePrompts(prompts, keys);
    expect(result[0].promptText).toBe(
      "key=real-write-key url=https://real.supabase.co"
    );
  });

  it("does not mutate the original prompts array", () => {
    const original = [makePrompt("YOUR_SEGMENT_WRITE_KEY")];
    const originalText = original[0].promptText;
    const keys = {
      segmentWriteFrontend: "replaced",
      segmentWriteBackend: "",
      segmentWorkspace: "",
      segmentProfileToken: "",
      supabaseUrl: "",
      supabaseAnon: "",
    };
    rehydratePrompts(original, keys);
    expect(original[0].promptText).toBe(originalText);
  });
});

// ── Component tests ────────────────────────────────────────────────

describe("RehydrationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog when open=true", () => {
    render(
      <RehydrationModal
        open={true}
        onSubmit={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render dialog when open=false", () => {
    render(
      <RehydrationModal
        open={false}
        onSubmit={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onDismiss when Skip button clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <RehydrationModal
        open={true}
        onSubmit={vi.fn()}
        onDismiss={onDismiss}
      />
    );

    await user.click(screen.getByText(/Skip/));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('fires "Rehydration Skipped" event on skip', async () => {
    const user = userEvent.setup();
    render(
      <RehydrationModal
        open={true}
        onSubmit={vi.fn()}
        onDismiss={vi.fn()}
      />
    );

    await user.click(screen.getByText(/Skip/));
    expect(mockTrackEvent).toHaveBeenCalledWith("Rehydration Skipped", {});
  });
});
