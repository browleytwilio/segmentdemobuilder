import { describe, it, expect, beforeEach } from "vitest";
import { useBuilderStore } from "./builder-store";

const initialArchitecture = {
  enableSESidebar: true,
  enableSeededProfiles: true,
  enableProfileAPI: false,
  enableIntentPredictions: false,
  enableSecondPagePers: false,
};

const initialKeys = {
  segmentWriteFrontend: "",
  segmentWriteBackend: "",
  segmentWorkspace: "",
  segmentProfileToken: "",
  supabaseUrl: "",
  supabaseAnon: "",
};

describe("useBuilderStore", () => {
  beforeEach(() => {
    useBuilderStore.getState().resetStore();
  });

  describe("initial state", () => {
    it("has currentStep set to 0", () => {
      expect(useBuilderStore.getState().currentStep).toBe(0);
    });

    it("has empty string fields", () => {
      const state = useBuilderStore.getState();
      expect(state.customerName).toBe("");
      expect(state.industry).toBe("");
      expect(state.persona).toBe("");
    });

    it("has correct architecture defaults", () => {
      expect(useBuilderStore.getState().architecture).toEqual(
        initialArchitecture,
      );
    });

    it("has empty selectedScenarios", () => {
      expect(useBuilderStore.getState().selectedScenarios).toEqual([]);
    });

    it("has empty keys", () => {
      expect(useBuilderStore.getState().keys).toEqual(initialKeys);
    });
  });

  describe("setStep", () => {
    it("updates currentStep", () => {
      useBuilderStore.getState().setStep(3);
      expect(useBuilderStore.getState().currentStep).toBe(3);
    });
  });

  describe("updateContext", () => {
    it("merges partial context", () => {
      useBuilderStore.getState().updateContext({ customerName: "Acme Corp" });
      expect(useBuilderStore.getState().customerName).toBe("Acme Corp");
    });

    it("preserves existing state when updating", () => {
      useBuilderStore
        .getState()
        .updateContext({ customerName: "Acme", industry: "SaaS" });
      useBuilderStore.getState().updateContext({ persona: "Engineer" });
      const state = useBuilderStore.getState();
      expect(state.customerName).toBe("Acme");
      expect(state.industry).toBe("SaaS");
      expect(state.persona).toBe("Engineer");
    });
  });

  describe("updateArchitecture", () => {
    it("merges partial architecture config", () => {
      useBuilderStore
        .getState()
        .updateArchitecture({ enableProfileAPI: true });
      expect(useBuilderStore.getState().architecture.enableProfileAPI).toBe(
        true,
      );
    });

    it("preserves existing architecture flags", () => {
      useBuilderStore
        .getState()
        .updateArchitecture({ enableProfileAPI: true });
      useBuilderStore
        .getState()
        .updateArchitecture({ enableIntentPredictions: true });
      const arch = useBuilderStore.getState().architecture;
      expect(arch.enableProfileAPI).toBe(true);
      expect(arch.enableIntentPredictions).toBe(true);
      expect(arch.enableSESidebar).toBe(true);
    });
  });

  describe("updateKeys", () => {
    it("merges partial keys", () => {
      useBuilderStore
        .getState()
        .updateKeys({ segmentWriteFrontend: "key-abc" });
      expect(useBuilderStore.getState().keys.segmentWriteFrontend).toBe(
        "key-abc",
      );
    });

    it("preserves existing keys", () => {
      useBuilderStore
        .getState()
        .updateKeys({ segmentWriteFrontend: "key-abc" });
      useBuilderStore
        .getState()
        .updateKeys({ supabaseUrl: "https://supabase.co" });
      const keys = useBuilderStore.getState().keys;
      expect(keys.segmentWriteFrontend).toBe("key-abc");
      expect(keys.supabaseUrl).toBe("https://supabase.co");
    });
  });

  describe("resetStore", () => {
    it("resets all state to initial values", () => {
      useBuilderStore.getState().setStep(4);
      useBuilderStore
        .getState()
        .updateContext({ customerName: "Test", industry: "Retail" });
      useBuilderStore
        .getState()
        .updateArchitecture({ enableProfileAPI: true });
      useBuilderStore
        .getState()
        .updateKeys({ segmentWriteFrontend: "secret" });

      useBuilderStore.getState().resetStore();

      const state = useBuilderStore.getState();
      expect(state.currentStep).toBe(0);
      expect(state.customerName).toBe("");
      expect(state.industry).toBe("");
      expect(state.architecture).toEqual(initialArchitecture);
    });

    it("resets keys to empty strings", () => {
      useBuilderStore
        .getState()
        .updateKeys({ segmentWriteFrontend: "secret" });
      useBuilderStore.getState().resetStore();
      expect(useBuilderStore.getState().keys).toEqual(initialKeys);
    });
  });

  describe("persist config", () => {
    it("partialize excludes keys from persisted state", () => {
      const options = useBuilderStore.persist.getOptions();
      const partialize = options.partialize!;
      useBuilderStore
        .getState()
        .updateKeys({ segmentWriteFrontend: "secret-key" });
      const persisted = partialize(useBuilderStore.getState());
      expect(persisted).not.toHaveProperty("keys");
      expect(persisted).toHaveProperty("customerName");
      expect(persisted).toHaveProperty("architecture");
      expect(persisted).toHaveProperty("selectedScenarios");
    });
  });

  describe("migration", () => {
    it("migrates version 0 state by clearing selectedScenarios", () => {
      const options = useBuilderStore.persist.getOptions();
      const migrate = options.migrate!;
      const oldState = {
        currentStep: 2,
        customerName: "Old Corp",
        selectedScenarios: ["old-slug-1", "old-slug-2"],
      };
      const result = migrate(oldState, 0) as Record<string, unknown>;
      expect(result.selectedScenarios).toEqual([]);
      expect(result.customerName).toBe("Old Corp");
    });

    it("migrates version 1 state by clearing selectedScenarios", () => {
      const options = useBuilderStore.persist.getOptions();
      const migrate = options.migrate!;
      const oldState = {
        currentStep: 1,
        selectedScenarios: ["slug-a"],
      };
      const result = migrate(oldState, 1) as Record<string, unknown>;
      expect(result.selectedScenarios).toEqual([]);
    });
  });
});
