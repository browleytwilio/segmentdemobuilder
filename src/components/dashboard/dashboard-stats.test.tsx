import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Mocks ──────────────────────────────────────────────────────────

const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics/events", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardDescription: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  BookOpenIcon: () => null,
  PencilLineIcon: () => null,
  CircleCheckIcon: () => null,
}));

// ── Imports ────────────────────────────────────────────────────────

import { DashboardStats } from "./dashboard-stats";
import type { PlaybookSummary } from "@/lib/compiler/types";

// ── Fixtures ───────────────────────────────────────────────────────

const playbooks: PlaybookSummary[] = [
  {
    id: "1",
    customer_name: "A",
    industry: "B2B SaaS",
    status: "draft",
    updated_at: "2026-01-01",
  },
  {
    id: "2",
    customer_name: "B",
    industry: "FinTech",
    status: "completed",
    updated_at: "2026-01-02",
  },
  {
    id: "3",
    customer_name: "C",
    industry: "B2B SaaS",
    status: "draft",
    updated_at: "2026-01-03",
  },
];

// ── Tests ──────────────────────────────────────────────────────────

describe("DashboardStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders total count", () => {
    render(<DashboardStats playbooks={playbooks} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Total Playbooks")).toBeInTheDocument();
  });

  it("renders draft count", () => {
    render(<DashboardStats playbooks={playbooks} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
  });

  it("renders completed count", () => {
    render(<DashboardStats playbooks={playbooks} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it('fires "Dashboard Viewed" analytics event once on mount', () => {
    render(<DashboardStats playbooks={playbooks} />);
    expect(mockTrackEvent).toHaveBeenCalledOnce();
    expect(mockTrackEvent).toHaveBeenCalledWith("Dashboard Viewed", {
      total_playbooks: 3,
      drafts: 2,
      completed: 1,
    });
  });

  it("does not fire event on re-render", () => {
    const { rerender } = render(<DashboardStats playbooks={playbooks} />);
    expect(mockTrackEvent).toHaveBeenCalledOnce();

    rerender(<DashboardStats playbooks={playbooks} />);
    expect(mockTrackEvent).toHaveBeenCalledOnce();
  });
});
