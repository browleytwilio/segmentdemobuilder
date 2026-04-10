import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts by keeping the last value", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("resolves Tailwind color conflicts", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles falsy values gracefully", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("handles empty arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles conditional class objects", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("handles arrays of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});
