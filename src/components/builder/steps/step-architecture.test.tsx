import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ──────────────────────────────────────────────────────────────

const mockUpdateArchitecture = vi.fn();

const mockUpdateProviders = vi.fn();

vi.mock("@/lib/stores/builder-store", () => ({
  useBuilderStore: () => ({
    architecture: {
      enableSESidebar: true,
      enableSeededProfiles: false,
      enableProfileAPI: false,
      enableIntentPredictions: false,
    },
    databaseProvider: "supabase" as const,
    authProvider: "none" as const,
    updateArchitecture: mockUpdateArchitecture,
    updateProviders: mockUpdateProviders,
  }),
}));

vi.mock("@/lib/analytics/events", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/components/ui/button", () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement> & {
    children: React.ReactNode;
  }) => <label {...props}>{children}</label>,
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked?: boolean;
    onCheckedChange?: (v: boolean) => void;
  }) => (
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => {
  const handler = { get: () => () => null };
  return new Proxy({} as Record<string, unknown>, handler);
});

// ── Import under test ──────────────────────────────────────────────────

import { StepArchitecture } from "./step-architecture";

// ── Tests ──────────────────────────────────────────────────────────────

describe("StepArchitecture", () => {
  const defaultProps = { onNext: vi.fn(), onBack: vi.fn() };

  it("renders toggle labels for all architecture features", () => {
    render(<StepArchitecture {...defaultProps} />);

    expect(screen.getByText("Source Engine Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Seeded Profiles")).toBeInTheDocument();
    expect(screen.getByText("Profile API")).toBeInTheDocument();
    expect(screen.getByText("Intent Predictions")).toBeInTheDocument();
  });

  it("renders switch elements for each toggle", () => {
    render(<StepArchitecture {...defaultProps} />);

    const switches = screen.getAllByRole("switch");
    expect(switches).toHaveLength(4);
  });

  it("pre-fills switch state from store values", () => {
    render(<StepArchitecture {...defaultProps} />);

    const switches = screen.getAllByRole("switch");
    // enableSESidebar is true in our mock
    expect(switches[0]).toBeChecked();
    // enableSeededProfiles is false
    expect(switches[1]).not.toBeChecked();
  });

  it("renders back and next buttons", () => {
    render(<StepArchitecture {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: "Back" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next" })
    ).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<StepArchitecture onNext={vi.fn()} onBack={onBack} />);

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});
