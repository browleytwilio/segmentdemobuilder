import { describe, it, expect } from "vitest";
import { wizardVariants, wizardTransition } from "./animation-variants";

describe("wizardVariants", () => {
  it("enter variant returns x=300 for positive direction, x=-300 for negative", () => {
    const enterFn = wizardVariants.enter as (direction: number) => { x: number; opacity: number };

    expect(enterFn(1)).toEqual({ x: 300, opacity: 0 });
    expect(enterFn(-1)).toEqual({ x: -300, opacity: 0 });
  });

  it("center has x=0 and opacity=1", () => {
    expect(wizardVariants.center).toEqual({ x: 0, opacity: 1 });
  });

  it("exit variant returns x=-300 for positive direction, x=300 for negative", () => {
    const exitFn = wizardVariants.exit as (direction: number) => { x: number; opacity: number };

    expect(exitFn(1)).toEqual({ x: -300, opacity: 0 });
    expect(exitFn(-1)).toEqual({ x: 300, opacity: 0 });
  });
});

describe("wizardTransition", () => {
  it("uses spring type with stiffness=300 and damping=30", () => {
    expect(wizardTransition).toEqual({
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
  });
});
