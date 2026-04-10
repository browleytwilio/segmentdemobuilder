import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ──────────────────────────────────────────────────────────────

const mockUpdateContext = vi.fn();

vi.mock("@/lib/stores/builder-store", () => ({
  useBuilderStore: () => ({
    customerName: "",
    industry: "",
    persona: "",
    updateContext: mockUpdateContext,
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

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
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

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string | null;
    onValueChange?: (v: string) => void;
  }) => (
    <div data-testid="select" data-value={value ?? undefined}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
}));

vi.mock("lucide-react", () => new Proxy({}, { get: () => () => null }));

// ── Import under test ──────────────────────────────────────────────────

import { StepContext } from "./step-context";

// ── Tests ──────────────────────────────────────────────────────────────

describe("StepContext", () => {
  const defaultProps = { onNext: vi.fn() };

  it("renders customer name input", () => {
    render(<StepContext {...defaultProps} />);

    expect(screen.getByLabelText("Customer Name")).toBeInTheDocument();
  });

  it("renders persona select with placeholder", () => {
    render(<StepContext {...defaultProps} />);

    expect(screen.getByText("Persona")).toBeInTheDocument();
    expect(screen.getByText("Select a persona")).toBeInTheDocument();
  });

  it("renders industry select with placeholder", () => {
    render(<StepContext {...defaultProps} />);

    expect(screen.getByText("Industry")).toBeInTheDocument();
    expect(screen.getByText("Select an industry")).toBeInTheDocument();
  });

  it("renders next button", () => {
    render(<StepContext {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: "Next" })
    ).toBeInTheDocument();
  });

  it("does not render a back button (first step)", () => {
    render(<StepContext {...defaultProps} />);

    expect(
      screen.queryByRole("button", { name: "Back" })
    ).not.toBeInTheDocument();
  });

  it("renders the step heading", () => {
    render(<StepContext {...defaultProps} />);

    expect(
      screen.getByText("Base Context & Persona")
    ).toBeInTheDocument();
  });

  it("renders the step description", () => {
    render(<StepContext {...defaultProps} />);

    expect(
      screen.getByText(
        "Who is this demo for? Set the customer context and target persona."
      )
    ).toBeInTheDocument();
  });
});
