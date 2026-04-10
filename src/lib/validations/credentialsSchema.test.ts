import { describe, it, expect } from "vitest";
import {
  baseCredentialsSchema,
  createCredentialsSchema,
} from "@/lib/validations/credentialsSchema";
import { mockKeys } from "@/__test-utils__/fixtures";

function validData() {
  return mockKeys();
}

describe("baseCredentialsSchema", () => {
  describe("segmentWriteFrontend", () => {
    it("accepts a string with 10+ characters", () => {
      const result = baseCredentialsSchema.safeParse(validData());
      expect(result.success).toBe(true);
    });

    it("rejects a string shorter than 10 characters", () => {
      const result = baseCredentialsSchema.safeParse(
        validData().segmentWriteFrontend
          ? { ...validData(), segmentWriteFrontend: "short" }
          : validData()
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "segmentWriteFrontend"
        );
        expect(issue?.message).toBe(
          "Write key must be at least 10 characters"
        );
      }
    });

    it("rejects an empty string", () => {
      const result = baseCredentialsSchema.safeParse({
        ...validData(),
        segmentWriteFrontend: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("segmentWriteBackend", () => {
    it("accepts a valid string", () => {
      const result = baseCredentialsSchema.safeParse(validData());
      expect(result.success).toBe(true);
    });

    it("accepts an empty string", () => {
      const result = baseCredentialsSchema.safeParse({
        ...validData(),
        segmentWriteBackend: "",
      });
      expect(result.success).toBe(true);
    });

    it("accepts undefined (optional)", () => {
      const data = validData();
      delete (data as Record<string, unknown>).segmentWriteBackend;
      const result = baseCredentialsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("segmentWorkspace", () => {
    it("rejects a string shorter than 10 characters", () => {
      const result = baseCredentialsSchema.safeParse({
        ...validData(),
        segmentWorkspace: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "segmentWorkspace"
        );
        expect(issue?.message).toBe(
          "Workspace token must be at least 10 characters"
        );
      }
    });
  });

  describe("segmentProfileToken", () => {
    it("accepts an empty string", () => {
      const result = baseCredentialsSchema.safeParse({
        ...validData(),
        segmentProfileToken: "",
      });
      expect(result.success).toBe(true);
    });

    it("accepts undefined (optional)", () => {
      const data = validData();
      delete (data as Record<string, unknown>).segmentProfileToken;
      const result = baseCredentialsSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("supabaseUrl", () => {
    it("accepts a valid Supabase URL", () => {
      const result = baseCredentialsSchema.safeParse(validData());
      expect(result.success).toBe(true);
    });

    it("rejects a non-URL string", () => {
      const result = baseCredentialsSchema.safeParse({
        ...validData(),
        supabaseUrl: "not-a-url",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "supabaseUrl"
        );
        expect(issue?.message).toBe("Must be a valid URL");
      }
    });

    it("rejects a valid URL that is not a Supabase URL", () => {
      const result = baseCredentialsSchema.safeParse({
        ...validData(),
        supabaseUrl: "https://example.com",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "supabaseUrl"
        );
        expect(issue?.message).toBe(
          "Must be a Supabase URL (containing .supabase.co)"
        );
      }
    });
  });

  describe("supabaseAnon", () => {
    it("accepts a string starting with eyJ", () => {
      const result = baseCredentialsSchema.safeParse(validData());
      expect(result.success).toBe(true);
    });

    it("rejects a string not starting with eyJ", () => {
      const result = baseCredentialsSchema.safeParse({
        ...validData(),
        supabaseAnon: "invalid_jwt_token",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => i.path[0] === "supabaseAnon"
        );
        expect(issue?.message).toBe(
          "Must be a valid JWT (starts with eyJ)"
        );
      }
    });

    it("rejects an empty string", () => {
      const result = baseCredentialsSchema.safeParse({
        ...validData(),
        supabaseAnon: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("createCredentialsSchema", () => {
  it("passes when Profile API is disabled and token is empty", () => {
    const schema = createCredentialsSchema(false);
    const result = schema.safeParse({
      ...validData(),
      segmentProfileToken: "",
    });
    expect(result.success).toBe(true);
  });

  it("passes when Profile API is disabled and token is missing", () => {
    const schema = createCredentialsSchema(false);
    const data = validData();
    delete (data as Record<string, unknown>).segmentProfileToken;
    const result = schema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("passes when Profile API is enabled and token is long enough", () => {
    const schema = createCredentialsSchema(true);
    const result = schema.safeParse({
      ...validData(),
      segmentProfileToken: "ptok_profile_jkl012mno",
    });
    expect(result.success).toBe(true);
  });

  it("fails when Profile API is enabled and token is empty", () => {
    const schema = createCredentialsSchema(true);
    const result = schema.safeParse({
      ...validData(),
      segmentProfileToken: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path[0] === "segmentProfileToken"
      );
      expect(issue?.message).toBe(
        "Profile token is required when Profile API is enabled (min 10 characters)"
      );
    }
  });

  it("fails when Profile API is enabled and token is too short", () => {
    const schema = createCredentialsSchema(true);
    const result = schema.safeParse({
      ...validData(),
      segmentProfileToken: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path[0] === "segmentProfileToken"
      );
      expect(issue?.message).toBe(
        "Profile token is required when Profile API is enabled (min 10 characters)"
      );
    }
  });

  it("fails when Profile API is enabled and token is undefined", () => {
    const schema = createCredentialsSchema(true);
    const data = validData();
    delete (data as Record<string, unknown>).segmentProfileToken;
    const result = schema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
