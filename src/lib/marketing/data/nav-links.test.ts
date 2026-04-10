import { describe, it, expect } from "vitest";
import { navLinks, isNavGroup } from "./nav-links";
import type { NavLink, NavGroup } from "./nav-links";

describe("isNavGroup", () => {
  it("returns true for a NavGroup", () => {
    const group: NavGroup = {
      label: "Product",
      links: [{ label: "Features", href: "/features" }],
    };
    expect(isNavGroup(group)).toBe(true);
  });

  it("returns false for a NavLink", () => {
    const link: NavLink = { label: "Pricing", href: "/pricing" };
    expect(isNavGroup(link)).toBe(false);
  });
});

describe("navLinks", () => {
  it("is a non-empty array", () => {
    expect(navLinks.length).toBeGreaterThan(0);
  });

  it("every entry has a label", () => {
    for (const item of navLinks) {
      expect(item.label).toBeDefined();
      expect(typeof item.label).toBe("string");
      expect(item.label.length).toBeGreaterThan(0);
    }
  });
});
