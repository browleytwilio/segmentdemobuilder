import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────

// Track analytics
const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics/events", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

// Builder store — expose a mutable state object so tests can toggle hydration
let storeState = {
  currentStep: 0,
  customerName: "",
  industry: "",
  persona: "",
  architecture: {
    enableSESidebar: true,
    enableSeededProfiles: true,
    enableProfileAPI: false,
    enableIntentPredictions: false,
    enableSecondPagePers: false,
  },
  selectedScenarios: [] as string[],
};

let hydrationCallback: (() => void) | null = null;
let hasHydrated = false;

vi.mock("@/lib/stores/builder-store", () => ({
  useBuilderStore: Object.assign(
    (selector?: (s: typeof storeState) => unknown) => {
      if (selector) return selector(storeState);
      return storeState;
    },
    {
      persist: {
        onFinishHydration: (cb: () => void) => {
          hydrationCallback = cb;
          return () => {};
        },
        hasHydrated: () => hasHydrated,
      },
    },
  ),
}));

// Wizard hook
const mockGoNext = vi.fn();
const mockGoBack = vi.fn();

vi.mock("@/lib/builder/use-builder-wizard", () => ({
  STEP_LABELS: ["Context", "Architecture", "Scenarios", "Credentials"],
  useBuilderWizard: () => ({
    currentStep: storeState.currentStep,
    direction: 0,
    goNext: mockGoNext,
    goBack: mockGoBack,
  }),
}));

// Server actions
vi.mock("@/app/(app)/builder/actions", () => ({
  createPlaybook: vi.fn(() => Promise.resolve({ id: "pb-1" })),
  getDemoFeaturesForWizard: vi.fn(() => Promise.resolve({ data: [] })),
}));

// framer-motion stubs
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { [key: string]: unknown }) => {
      // Filter out framer-motion-specific props that are not valid DOM attributes
      const {
        variants: _v,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        custom: _c,
        ...domProps
      } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
}));

// Step component stubs
vi.mock("./steps/step-context", () => ({
  StepContext: () => <div data-testid="step-context">Step Context</div>,
}));
vi.mock("./steps/step-architecture", () => ({
  StepArchitecture: () => (
    <div data-testid="step-architecture">Step Architecture</div>
  ),
}));
vi.mock("./steps/step-scenarios", () => ({
  StepScenarios: () => (
    <div data-testid="step-scenarios">Step Scenarios</div>
  ),
}));
vi.mock("./steps/step-credentials", () => ({
  StepCredentials: () => (
    <div data-testid="step-credentials">Step Credentials</div>
  ),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

import { BuilderWizard } from "./builder-wizard";

beforeEach(() => {
  storeState = {
    currentStep: 0,
    customerName: "",
    industry: "",
    persona: "",
    architecture: {
      enableSESidebar: true,
      enableSeededProfiles: true,
      enableProfileAPI: false,
      enableIntentPredictions: false,
      enableSecondPagePers: false,
    },
    selectedScenarios: [],
  };
  hasHydrated = false;
  hydrationCallback = null;
  mockTrackEvent.mockClear();
  mockGoNext.mockClear();
  mockGoBack.mockClear();
});

describe("BuilderWizard", () => {
  it("shows loading spinner before hydration", () => {
    hasHydrated = false;
    render(<BuilderWizard />);
    // The spinner uses animate-spin class
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
    // The stepper nav should NOT be visible
    expect(screen.queryByLabelText("Wizard progress")).not.toBeInTheDocument();
  });

  it("renders stepper with all step labels after hydration", () => {
    hasHydrated = true;
    render(<BuilderWizard />);
    expect(screen.getByLabelText("Wizard progress")).toBeInTheDocument();
    expect(screen.getByText("Context")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText("Scenarios")).toBeInTheDocument();
    expect(screen.getByText("Credentials")).toBeInTheDocument();
  });

  it("renders StepContext when currentStep is 0", () => {
    hasHydrated = true;
    storeState.currentStep = 0;
    render(<BuilderWizard />);
    expect(screen.getByTestId("step-context")).toBeInTheDocument();
  });

  it("renders StepArchitecture when currentStep is 1", () => {
    hasHydrated = true;
    storeState.currentStep = 1;
    render(<BuilderWizard />);
    expect(screen.getByTestId("step-architecture")).toBeInTheDocument();
  });

  it("renders StepScenarios when currentStep is 2", () => {
    hasHydrated = true;
    storeState.currentStep = 2;
    render(<BuilderWizard />);
    expect(screen.getByTestId("step-scenarios")).toBeInTheDocument();
  });

  it("fires trackEvent('Wizard Started') after hydration", () => {
    hasHydrated = true;
    render(<BuilderWizard />);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      "Wizard Started",
      expect.objectContaining({ has_persisted_state: false }),
    );
  });
});
