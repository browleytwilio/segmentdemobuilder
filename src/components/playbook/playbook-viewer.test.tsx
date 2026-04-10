import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { mockPlaybookRow, mockCompiledPrompt } from "@/__test-utils__/fixtures";

// ── Mocks ──────────────────────────────────────────────────────────────

vi.mock("@/hooks/use-clipboard", () => ({
  useClipboard: () => ({ copy: vi.fn() }),
}));

vi.mock("@/hooks/use-playbook-progress", () => ({
  usePlaybookProgress: () => ({
    completedSteps: [],
    markComplete: vi.fn(),
    isComplete: vi.fn(() => false),
  }),
}));

const trackEvent = vi.fn();
vi.mock("@/lib/analytics/events", () => ({
  trackEvent: (...args: unknown[]) => trackEvent(...args),
}));

vi.mock("@/lib/compiler/demo-script", () => ({
  generateDemoScript: vi.fn(() => "# Mock Script"),
}));

vi.mock("@/lib/export/download", () => ({
  downloadMarkdown: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock the rehydration-modal: keep the pure functions, stub the component
vi.mock("./rehydration-modal", async () => {
  const actual = await vi.importActual<typeof import("./rehydration-modal")>(
    "./rehydration-modal"
  );
  return {
    needsRehydration: actual.needsRehydration,
    rehydratePrompts: actual.rehydratePrompts,
    RehydrationModal: ({ open }: { open: boolean }) =>
      open ? (
        <div data-testid="rehydration-modal">Rehydration Modal</div>
      ) : null,
  };
});

vi.mock("./step-stepper", () => ({
  StepStepper: () => <div data-testid="stepper">Stepper</div>,
}));

vi.mock("./prompt-card", () => ({
  PromptCard: ({ prompt }: { prompt: { stepNumber: number; title: string } }) => (
    <div data-testid={`prompt-${prompt.stepNumber}`}>{prompt.title}</div>
  ),
}));

vi.mock("./demo-script-view", () => ({
  DemoScriptView: () => <div>Script View</div>,
}));

vi.mock("./ai-script-generator", () => ({
  AIScriptGenerator: () => null,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({
    children,
  }: {
    children: React.ReactNode;
    defaultValue?: string;
    onValueChange?: (v: string) => void;
  }) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TabsTrigger: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-testid={`tabcontent-${value}`}>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}));

vi.mock("lucide-react", () => ({
  DownloadIcon: () => null,
  PrinterIcon: () => null,
  ShareIcon: () => null,
}));

// ── Import under test (after all mocks) ────────────────────────────────

import { PlaybookViewer } from "./playbook-viewer";

// ── Tests ──────────────────────────────────────────────────────────────

describe("PlaybookViewer", () => {
  beforeEach(() => {
    trackEvent.mockClear();
  });

  it("renders customer name and industry", () => {
    const playbook = mockPlaybookRow();
    render(<PlaybookViewer playbook={playbook} />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(
      screen.getByText("E-commerce / Retail Playbook")
    ).toBeInTheDocument();
  });

  it("renders prompt cards for each prompt", () => {
    const playbook = mockPlaybookRow();
    render(<PlaybookViewer playbook={playbook} />);

    expect(screen.getByTestId("prompt-1")).toBeInTheDocument();
    expect(screen.getByTestId("prompt-2")).toBeInTheDocument();
    expect(screen.getByTestId("prompt-3")).toBeInTheDocument();
  });

  it("shows rehydration modal when prompts contain placeholders", () => {
    const playbook = mockPlaybookRow({
      generated_prompts: [
        mockCompiledPrompt({
          stepNumber: 1,
          title: "Setup",
          promptText:
            "Use write key YOUR_SEGMENT_WRITE_KEY in the analytics config",
        }),
      ],
    });
    render(<PlaybookViewer playbook={playbook} />);

    expect(screen.getByTestId("rehydration-modal")).toBeInTheDocument();
  });

  it("does not show rehydration modal when no placeholders", () => {
    const playbook = mockPlaybookRow({
      generated_prompts: [
        mockCompiledPrompt({
          stepNumber: 1,
          title: "Setup",
          promptText: "No placeholders here, just normal text.",
        }),
      ],
    });
    render(<PlaybookViewer playbook={playbook} />);

    expect(screen.queryByTestId("rehydration-modal")).not.toBeInTheDocument();
  });

  it('fires "Playbook Viewed" analytics on mount', () => {
    const playbook = mockPlaybookRow();
    render(<PlaybookViewer playbook={playbook} />);

    expect(trackEvent).toHaveBeenCalledWith(
      "Playbook Viewed",
      expect.objectContaining({
        playbook_id: playbook.id,
        industry: playbook.industry,
      })
    );
  });

  it("renders Build Prompts and SE Demo Script tab triggers", () => {
    const playbook = mockPlaybookRow();
    render(<PlaybookViewer playbook={playbook} />);

    expect(screen.getByTestId("tab-prompts")).toHaveTextContent(
      "Build Prompts"
    );
    expect(screen.getByTestId("tab-script")).toHaveTextContent(
      "SE Demo Script"
    );
  });

  it("renders export button", () => {
    const playbook = mockPlaybookRow();
    render(<PlaybookViewer playbook={playbook} />);

    expect(
      screen.getByText("Export Prompts as Markdown")
    ).toBeInTheDocument();
  });

  it("renders share and print buttons", () => {
    const playbook = mockPlaybookRow();
    render(<PlaybookViewer playbook={playbook} />);

    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });
});
