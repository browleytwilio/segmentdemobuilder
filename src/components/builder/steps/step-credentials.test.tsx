import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ──────────────────────────────────────────────────────────────

const mockUpdateKeys = vi.fn();

vi.mock("@/lib/stores/builder-store", () => ({
  useBuilderStore: () => ({
    keys: {
      segmentWriteFrontend: "",
      segmentWriteBackend: "",
      segmentWorkspace: "",
      segmentProfileToken: "",
      supabaseUrl: "",
      supabaseAnon: "",
    },
    architecture: {
      enableSESidebar: true,
      enableSeededProfiles: true,
      enableProfileAPI: false,
      enableIntentPredictions: false,
    },
    databaseProvider: "supabase" as const,
    authProvider: "none" as const,
    updateKeys: mockUpdateKeys,
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

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTrigger: ({
    children,
    render: renderProp,
  }: {
    children: React.ReactNode;
    render?: React.ReactNode;
  }) => (
    <button data-testid="help-trigger" type="button">
      {children}
    </button>
  ),
  DialogFooter: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("lucide-react", () => ({
  InfoIcon: () => null,
}));

// ── Import under test ──────────────────────────────────────────────────

import { StepCredentials } from "./step-credentials";

// ── Tests ──────────────────────────────────────────────────────────────

describe("StepCredentials", () => {
  const defaultProps = {
    onBack: vi.fn(),
    onSubmit: vi.fn(),
    isSubmitting: false,
  };

  it("renders credential input fields", () => {
    render(<StepCredentials {...defaultProps} />);

    expect(screen.getByLabelText("Frontend Write Key")).toBeInTheDocument();
    expect(screen.getByLabelText(/Backend Write Key/)).toBeInTheDocument();
    expect(
      screen.getByLabelText("Workspace API Token")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Supabase URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Supabase Anon Key")).toBeInTheDocument();
  });

  it("hides Profile API Token when enableProfileAPI is false", () => {
    render(<StepCredentials {...defaultProps} />);

    expect(
      screen.queryByLabelText("Profile API Token")
    ).not.toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<StepCredentials {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: "Back" })
    ).toBeInTheDocument();
  });

  it("renders submit button with correct text", () => {
    render(<StepCredentials {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: "Create Draft Playbook" })
    ).toBeInTheDocument();
  });

  it("renders help dialog trigger", () => {
    render(<StepCredentials {...defaultProps} />);

    expect(screen.getByTestId("help-trigger")).toBeInTheDocument();
  });
});
