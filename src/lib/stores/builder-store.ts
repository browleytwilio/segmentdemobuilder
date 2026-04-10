import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DemoArchitecture {
  enableSESidebar: boolean;
  enableSeededProfiles: boolean;
  enableProfileAPI: boolean;
  enableIntentPredictions: boolean;
  enableSecondPagePers: boolean;
}

export interface BuilderState {
  // Navigation State
  currentStep: number;

  // Base Context (Persisted)
  customerName: string;
  industry: string;
  persona: string;

  // Advanced Config (Persisted)
  architecture: DemoArchitecture;
  selectedScenarios: string[];

  // Credentials (IN-MEMORY ONLY — NEVER PERSISTED)
  keys: {
    segmentWriteFrontend: string;
    segmentWriteBackend: string;
    segmentWorkspace: string;
    segmentProfileToken: string;
    supabaseUrl: string;
    supabaseAnon: string;
  };

  // State Setters
  setStep: (step: number) => void;
  updateContext: (
    context: Partial<
      Omit<
        BuilderState,
        | "architecture"
        | "keys"
        | "setStep"
        | "updateContext"
        | "updateArchitecture"
        | "updateKeys"
        | "resetStore"
      >
    >
  ) => void;
  updateArchitecture: (config: Partial<DemoArchitecture>) => void;
  updateKeys: (keys: Partial<BuilderState["keys"]>) => void;
  resetStore: () => void;
}

const initialKeys: BuilderState["keys"] = {
  segmentWriteFrontend: "",
  segmentWriteBackend: "",
  segmentWorkspace: "",
  segmentProfileToken: "",
  supabaseUrl: "",
  supabaseAnon: "",
};

const initialArchitecture: DemoArchitecture = {
  enableSESidebar: true,
  enableSeededProfiles: true,
  enableProfileAPI: false,
  enableIntentPredictions: false,
  enableSecondPagePers: false,
};

const initialState = {
  currentStep: 0,
  customerName: "",
  industry: "",
  persona: "",
  architecture: initialArchitecture,
  selectedScenarios: [] as string[],
  keys: initialKeys,
};

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      updateContext: (context) => set((state) => ({ ...state, ...context })),

      updateArchitecture: (config) =>
        set((state) => ({
          architecture: { ...state.architecture, ...config },
        })),

      updateKeys: (keys) =>
        set((state) => ({
          keys: { ...state.keys, ...keys },
        })),

      resetStore: () => set({ ...initialState, keys: { ...initialKeys } }),
    }),
    {
      name: "builder-store",
      version: 2,
      partialize: (state) => ({
        currentStep: state.currentStep,
        customerName: state.customerName,
        industry: state.industry,
        persona: state.persona,
        architecture: state.architecture,
        selectedScenarios: state.selectedScenarios,
        // keys is intentionally excluded — credentials stay in-memory only
      }),
      migrate: (persisted, version) => {
        try {
          const prev = persisted as Record<string, unknown>;
          if (version === 0 || version === 1) {
            // v1→v2: selectedScenarios changed from slugs to demo_feature UUIDs.
            // Clear them so the user re-selects on Step 3.
            return { ...initialState, ...prev, selectedScenarios: [] };
          }
          return persisted as BuilderState;
        } catch {
          return { ...initialState };
        }
      },
    }
  )
);
