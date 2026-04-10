import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────

const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics/events", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

const mockUpdateContext = vi.fn();
const mockUpdateArchitecture = vi.fn();
let storeState = {
  industry: "E-commerce / Retail",
  customerName: "Acme Corp",
  persona: "CMO",
  architecture: {
    enableSESidebar: true,
    enableSeededProfiles: true,
    enableProfileAPI: false,
    enableIntentPredictions: false,
    enableSecondPagePers: false,
  },
  selectedScenarios: [] as string[],
  updateContext: mockUpdateContext,
  updateArchitecture: mockUpdateArchitecture,
};

vi.mock("@/lib/stores/builder-store", () => ({
  useBuilderStore: () => storeState,
}));

// Server action mock
const mockGetDemoFeatures = vi.fn();
vi.mock("@/app/(app)/builder/actions", () => ({
  getDemoFeaturesForWizard: (...args: unknown[]) =>
    mockGetDemoFeatures(...args),
}));

// Stub the ScenarioRecommendations component (it makes fetch calls)
vi.mock("@/components/builder/scenario-recommendations", () => ({
  ScenarioRecommendations: () => (
    <div data-testid="scenario-recommendations">AI Recommendations</div>
  ),
}));

// Validation schemas — passthrough (zod needs the real schema for react-hook-form)
// Use real schema to keep form behavior intact
vi.mock("@/lib/validations/builderSchemas", async () => {
  const z = await import("zod");
  return {
    scenariosSchema: z.z.object({
      selectedScenarios: z.z.array(z.z.string()),
    }),
  };
});

import { StepScenarios } from "./step-scenarios";

const mockOnNext = vi.fn();
const mockOnBack = vi.fn();

const sampleFeatures = [
  {
    id: "feat-1",
    slug: "second-page-personalization",
    label: "Second-Page Personalization",
    description: "Swap hero banner based on prior Product Viewed event",
  },
  {
    id: "feat-2",
    slug: "authenticated-vip-state",
    label: "Authenticated VIP State",
    description: "Instantly remove shipping costs via identify trait",
  },
];

beforeEach(() => {
  storeState = {
    industry: "E-commerce / Retail",
    customerName: "Acme Corp",
    persona: "CMO",
    architecture: {
      enableSESidebar: true,
      enableSeededProfiles: true,
      enableProfileAPI: false,
      enableIntentPredictions: false,
      enableSecondPagePers: false,
    },
    selectedScenarios: [],
    updateContext: mockUpdateContext,
    updateArchitecture: mockUpdateArchitecture,
  };
  mockOnNext.mockClear();
  mockOnBack.mockClear();
  mockTrackEvent.mockClear();
  mockUpdateContext.mockClear();
  mockUpdateArchitecture.mockClear();
  mockGetDemoFeatures.mockClear();
  // Default: return features after async call
  mockGetDemoFeatures.mockResolvedValue({ data: sampleFeatures });
});

describe("StepScenarios", () => {
  it("renders loading skeleton state while features load", () => {
    // Make the server action hang so loading state persists
    mockGetDemoFeatures.mockReturnValue(new Promise(() => {}));
    render(<StepScenarios onNext={mockOnNext} onBack={mockOnBack} />);
    // Loading shows animated pulse placeholders
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders feature labels after features load", async () => {
    render(<StepScenarios onNext={mockOnNext} onBack={mockOnBack} />);
    await waitFor(() => {
      expect(
        screen.getByText("Second-Page Personalization"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Authenticated VIP State"),
      ).toBeInTheDocument();
    });
  });

  it("renders the Back button", async () => {
    render(<StepScenarios onNext={mockOnNext} onBack={mockOnBack} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Back" }),
      ).toBeInTheDocument();
    });
  });

  it("renders the Next button", async () => {
    render(<StepScenarios onNext={mockOnNext} onBack={mockOnBack} />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Next" }),
      ).toBeInTheDocument();
    });
  });

  it("shows empty state message when no features returned", async () => {
    mockGetDemoFeatures.mockResolvedValue({ data: [] });
    render(<StepScenarios onNext={mockOnNext} onBack={mockOnBack} />);
    await waitFor(() => {
      expect(
        screen.getByText(
          /No scenarios available/,
        ),
      ).toBeInTheDocument();
    });
  });
});
