import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DatabaseProvider, AuthProvider } from "@/lib/compiler/providers";
import { buildInitialKeys } from "@/lib/compiler/providers";

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

  // Provider Selection (Persisted)
  databaseProvider: DatabaseProvider;
  authProvider: AuthProvider;

  // Credentials (IN-MEMORY ONLY — NEVER PERSISTED)
  keys: Record<string, string>;

  // State Setters
  setStep: (step: number) => void;
  updateContext: (
    context: Partial<
      Omit<
        BuilderState,
        | "architecture"
        | "keys"
        | "databaseProvider"
        | "authProvider"
        | "setStep"
        | "updateContext"
        | "updateArchitecture"
        | "updateKeys"
        | "updateProviders"
        | "resetStore"
      >
    >
  ) => void;
  updateArchitecture: (config: Partial<DemoArchitecture>) => void;
  updateKeys: (keys: Record<string, string>) => void;
  updateProviders: (providers: {
    databaseProvider?: DatabaseProvider;
    authProvider?: AuthProvider;
  }) => void;
  resetStore: () => void;
}

const initialKeys = buildInitialKeys("supabase", "none");

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
  databaseProvider: "supabase" as DatabaseProvider,
  authProvider: "none" as AuthProvider,
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

      updateProviders: (providers) =>
        set((state) => {
          const nextDb = providers.databaseProvider ?? state.databaseProvider;
          const nextAuth = providers.authProvider ?? state.authProvider;
          return {
            ...state,
            databaseProvider: nextDb,
            authProvider: nextAuth,
            keys: buildInitialKeys(nextDb, nextAuth),
          };
        }),

      resetStore: () => set({ ...initialState, keys: { ...initialKeys } }),
    }),
    {
      name: "builder-store",
      version: 4,
      partialize: (state) => ({
        currentStep: state.currentStep,
        customerName: state.customerName,
        industry: state.industry,
        persona: state.persona,
        architecture: state.architecture,
        selectedScenarios: state.selectedScenarios,
        databaseProvider: state.databaseProvider,
        authProvider: state.authProvider,
        // keys is intentionally excluded — credentials stay in-memory only
      }),
      migrate: (persisted, version) => {
        try {
          const prev = persisted as Record<string, unknown>;
          if (version === 0 || version === 1) {
            // v1→v2: selectedScenarios changed from slugs to demo_feature UUIDs.
            return { ...initialState, ...prev, selectedScenarios: [] };
          }
          if (version === 2) {
            // v2→v3: added databaseProvider + authProvider.
            return {
              ...initialState,
              ...prev,
              databaseProvider: "supabase" as DatabaseProvider,
              authProvider: "none" as AuthProvider,
            };
          }
          if (version === 3) {
            // v3→v4: auth providers now have credential fields. No structural change needed.
            return { ...initialState, ...prev };
          }
          return persisted as BuilderState;
        } catch {
          return { ...initialState };
        }
      },
    }
  )
);
