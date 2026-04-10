import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";
import { useClipboard } from "@/hooks/use-clipboard";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn() },
    writable: true,
    configurable: true,
  });
});

describe("useClipboard", () => {
  it("calls navigator.clipboard.writeText with the provided text", async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("hello world");
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello world");
  });

  it("shows success toast on successful copy", async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("test");
    });

    expect(toast.success).toHaveBeenCalledWith("Copied to clipboard");
  });

  it("shows error toast when clipboard API throws", async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Clipboard access denied"),
    );
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("test");
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Copy failed — select the text manually",
    );
  });

  it("returns an object with a copy function", () => {
    const { result } = renderHook(() => useClipboard());

    expect(result.current).toHaveProperty("copy");
    expect(typeof result.current.copy).toBe("function");
  });

  it("copy is a stable reference across re-renders", () => {
    const { result, rerender } = renderHook(() => useClipboard());
    const firstCopy = result.current.copy;

    rerender();

    expect(result.current.copy).toBe(firstCopy);
  });
});
