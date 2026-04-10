import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

// ── Mocks ──────────────────────────────────────────────────────────

const mockSignOut = vi.fn(() => Promise.resolve({ error: null }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: { signOut: mockSignOut },
  })),
}));

const mockTrackEvent = vi.fn();
const mockResetAnalytics = vi.fn();
vi.mock("@/lib/analytics/events", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
  resetAnalytics: (...args: unknown[]) => mockResetAnalytics(...args),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, render }: any) => (
    <div>{render}{children}</div>
  ),
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock("lucide-react", () => ({
  LogOutIcon: () => null,
  LayoutDashboardIcon: () => null,
}));

// ── Imports ────────────────────────────────────────────────────────

import { UserMenu } from "./user-menu";

// ── Tests ──────────────────────────────────────────────────────────

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user initial from email (first char, uppercase)", () => {
    render(<UserMenu email="alice@example.com" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders email text", () => {
    render(<UserMenu email="alice@example.com" />);
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it('calls trackEvent("Signed Out") on logout click', async () => {
    const user = userEvent.setup();
    render(<UserMenu email="alice@example.com" />);

    await user.click(screen.getByText("Log out"));
    expect(mockTrackEvent).toHaveBeenCalledWith("Signed Out", {
      method: "manual",
    });
  });

  it("calls resetAnalytics on logout click", async () => {
    const user = userEvent.setup();
    render(<UserMenu email="alice@example.com" />);

    await user.click(screen.getByText("Log out"));
    expect(mockResetAnalytics).toHaveBeenCalledOnce();
  });

  it("navigates to /login after logout", async () => {
    const user = userEvent.setup();
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    });

    render(<UserMenu email="alice@example.com" />);
    await user.click(screen.getByText("Log out"));

    // signOut is async, so wait for the push call
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
