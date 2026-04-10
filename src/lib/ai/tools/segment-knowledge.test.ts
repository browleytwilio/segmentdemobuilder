// @vitest-environment node
import { describe, it, expect } from "vitest";
import { segmentKnowledgeTool } from "./segment-knowledge";

describe("segmentKnowledgeTool", () => {
  it("has description and inputSchema properties", () => {
    expect(segmentKnowledgeTool.description).toBeTruthy();
    expect(segmentKnowledgeTool.inputSchema).toBeDefined();
  });

  it("returns found=true and content for an exact match", async () => {
    const result = await segmentKnowledgeTool.execute(
      { topic: "protocols" },
      { toolCallId: "test", messages: [], abortSignal: new AbortController().signal }
    );
    expect(result.found).toBe(true);
    expect(result.content).toContain("Tracking Plans");
  });

  it("is case-insensitive", async () => {
    const result = await segmentKnowledgeTool.execute(
      { topic: "PROTOCOLS" },
      { toolCallId: "test", messages: [], abortSignal: new AbortController().signal }
    );
    expect(result.found).toBe(true);
  });

  it("returns found=true for a partial match", async () => {
    const result = await segmentKnowledgeTool.execute(
      { topic: "profile" },
      { toolCallId: "test", messages: [], abortSignal: new AbortController().signal }
    );
    expect(result.found).toBe(true);
    expect(result.content).toContain("Profile API");
  });

  it("returns found=false for an unknown topic", async () => {
    const result = await segmentKnowledgeTool.execute(
      { topic: "quantum computing" },
      { toolCallId: "test", messages: [], abortSignal: new AbortController().signal }
    );
    expect(result.found).toBe(false);
    expect(result.content).toContain("No specific knowledge base entry");
  });
});
