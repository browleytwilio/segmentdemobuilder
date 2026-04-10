import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ──────────────────────────────────────────────────────────

const mockCopy = vi.fn();
vi.mock("@/hooks/use-clipboard", () => ({
  useClipboard: () => ({ copy: mockCopy }),
}));

const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics/events", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardDescription: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children }: any) => <div>{children}</div>,
  AccordionItem: ({ children }: any) => <div>{children}</div>,
  AccordionTrigger: ({ children }: any) => <div>{children}</div>,
  AccordionContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  CheckIcon: () => null,
  CopyIcon: () => null,
}));

// ── Imports ────────────────────────────────────────────────────────

import { PromptCard } from "./prompt-card";
import type { CompiledPrompt } from "@/lib/compiler/types";

// ── Helpers ────────────────────────────────────────────────────────

function makePrompt(overrides: Partial<CompiledPrompt> = {}): CompiledPrompt {
  return {
    stepNumber: 1,
    title: "Test Prompt",
    expectedOutput: "Expected result text",
    promptText: "Do something useful",
    ...overrides,
  };
}

const defaultProps = {
  playbookId: "pb-1",
  isComplete: false,
  onMarkComplete: vi.fn(),
};

// ── Tests ──────────────────────────────────────────────────────────

describe("PromptCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders step number and title", () => {
    render(<PromptCard prompt={makePrompt()} {...defaultProps} />);
    expect(screen.getByText(/Step 1: Test Prompt/)).toBeInTheDocument();
  });

  it("renders expected output text", () => {
    render(<PromptCard prompt={makePrompt()} {...defaultProps} />);
    // expectedOutput appears in both CardDescription and the "Expected Output" block
    const matches = screen.getAllByText("Expected result text");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders promptText in a pre element", () => {
    render(<PromptCard prompt={makePrompt()} {...defaultProps} />);
    const pre = screen.getByText("Do something useful").closest("pre");
    expect(pre).toBeInTheDocument();
  });

  it("highlights YOUR_* placeholder strings with <mark>", () => {
    const prompt = makePrompt({
      promptText: "Use key YOUR_SEGMENT_WRITE_KEY here",
    });
    const { container } = render(
      <PromptCard prompt={prompt} {...defaultProps} />
    );
    const mark = container.querySelector("mark");
    expect(mark).toBeInTheDocument();
    expect(mark!.textContent).toBe("YOUR_SEGMENT_WRITE_KEY");
  });

  it("does not highlight when no placeholders present", () => {
    const prompt = makePrompt({ promptText: "No placeholders here" });
    const { container } = render(
      <PromptCard prompt={prompt} {...defaultProps} />
    );
    expect(container.querySelector("mark")).toBeNull();
  });

  it("copy button calls clipboard copy with promptText on click", async () => {
    const user = userEvent.setup();
    const prompt = makePrompt({ promptText: "copy me" });
    render(<PromptCard prompt={prompt} {...defaultProps} />);

    const copyBtn = screen.getByText(/Copy Prompt to Clipboard/);
    await user.click(copyBtn);
    expect(mockCopy).toHaveBeenCalledWith("copy me");
  });

  it('fires "Prompt Copied" analytics event on copy click', async () => {
    const user = userEvent.setup();
    render(<PromptCard prompt={makePrompt()} {...defaultProps} />);

    await user.click(screen.getByText(/Copy Prompt to Clipboard/));
    expect(mockTrackEvent).toHaveBeenCalledWith("Prompt Copied", {
      playbook_id: "pb-1",
      step_number: 1,
      prompt_title: "Test Prompt",
    });
  });

  it('shows "Mark as Complete" button when isComplete=false', () => {
    render(
      <PromptCard
        prompt={makePrompt()}
        {...defaultProps}
        isComplete={false}
      />
    );
    expect(screen.getByText(/Mark as Complete/)).toBeInTheDocument();
  });

  it('shows "Step completed" text when isComplete=true', () => {
    render(
      <PromptCard prompt={makePrompt()} {...defaultProps} isComplete={true} />
    );
    expect(screen.getByText("Step completed")).toBeInTheDocument();
    expect(screen.queryByText(/Mark as Complete/)).not.toBeInTheDocument();
  });

  it('fires "Step Marked Complete" event and calls onMarkComplete when mark button clicked', async () => {
    const user = userEvent.setup();
    const onMarkComplete = vi.fn();
    render(
      <PromptCard
        prompt={makePrompt()}
        {...defaultProps}
        onMarkComplete={onMarkComplete}
      />
    );

    await user.click(screen.getByText(/Mark as Complete/));
    expect(mockTrackEvent).toHaveBeenCalledWith("Step Marked Complete", {
      playbook_id: "pb-1",
      step_number: 1,
    });
    expect(onMarkComplete).toHaveBeenCalledOnce();
  });
});
