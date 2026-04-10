import type { DemoArchitecture, BuilderState } from "@/lib/stores/builder-store";
import type {
  CompilerInput,
  CompiledPrompt,
  PlaybookRow,
  DemoConfig,
  VersionMap,
} from "@/lib/compiler/types";

export function mockKeys(
  overrides?: Partial<BuilderState["keys"]>
): BuilderState["keys"] {
  return {
    segmentWriteFrontend: "wk_frontend_abc123xyz",
    segmentWriteBackend: "wk_backend_def456uvw",
    segmentWorkspace: "tok_workspace_ghi789rst",
    segmentProfileToken: "ptok_profile_jkl012mno",
    supabaseUrl: "https://testproject.supabase.co",
    supabaseAnon:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoidHJ1ZSJ9.abc",
    ...overrides,
  };
}

export function mockArchitecture(
  overrides?: Partial<DemoArchitecture>
): DemoArchitecture {
  return {
    enableSESidebar: true,
    enableSeededProfiles: true,
    enableProfileAPI: false,
    enableIntentPredictions: false,
    enableSecondPagePers: false,
    ...overrides,
  };
}

export function mockVersionMap(
  overrides?: Partial<VersionMap>
): VersionMap {
  return {
    next: "16.2.3",
    react: "19.2.4",
    "react-dom": "19.2.4",
    tailwindcss: "4.0.0",
    "framer-motion": "12.38.0",
    "@segment/analytics-next": "1.76.0",
    "@supabase/supabase-js": "2.103.0",
    "lucide-react": "1.8.0",
    "@supabase/ssr": "0.10.2",
    ...overrides,
  };
}

export function mockCompilerInput(
  overrides?: Partial<CompilerInput>
): CompilerInput {
  return {
    customerName: "Acme Corp",
    industry: "E-commerce / Retail",
    persona: "CMO",
    architecture: mockArchitecture(),
    selectedScenarios: ["second-page-personalization"],
    keys: mockKeys(),
    versions: mockVersionMap(),
    ...overrides,
  };
}

export function mockCompiledPrompt(
  overrides?: Partial<CompiledPrompt>
): CompiledPrompt {
  return {
    stepNumber: 1,
    title: "Test Prompt",
    expectedOutput: "Expected output here",
    promptText: "Prompt text content here",
    ...overrides,
  };
}

export function mockDemoConfig(
  overrides?: Partial<DemoConfig>
): DemoConfig {
  return {
    persona: "CMO",
    architecture: mockArchitecture(),
    selectedScenarios: ["second-page-personalization"],
    ...overrides,
  };
}

export function mockPlaybookRow(
  overrides?: Partial<PlaybookRow>
): PlaybookRow {
  return {
    id: "pb_test_123",
    customer_name: "Acme Corp",
    industry: "E-commerce / Retail",
    status: "completed",
    demo_config: mockDemoConfig(),
    generated_prompts: [
      mockCompiledPrompt({ stepNumber: 1, title: "Scaffolding & Dependencies" }),
      mockCompiledPrompt({ stepNumber: 2, title: "Environment & Core Providers" }),
      mockCompiledPrompt({ stepNumber: 3, title: "Demo Architecture Setup" }),
    ],
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-04-01T12:00:00Z",
    ...overrides,
  };
}

export function mockDBTemplate(overrides?: Partial<{
  featureId: string;
  slug: string;
  templateName: string;
  content: string;
}>) {
  return {
    featureId: "feat_123",
    slug: "second-page-personalization",
    templateName: "Second Page Personalization",
    content:
      "Implement personalization for {{CUSTOMER_NAME}} in the {{INDUSTRY}} space.",
    ...overrides,
  };
}
