/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Window augmentation for analytics.js
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    analytics: {
      identify(userId: string, traits?: Record<string, any>): void;
      track(event: string, properties?: Record<string, any>): void;
      page(name?: string, properties?: Record<string, any>): void;
      reset(): void;
      ready(cb: () => void): void;
      _loadOptions?: Record<string, any>;
      SNIPPET_VERSION?: string;
      invoked?: boolean;
      methods?: string[];
      factory?(method: string): (...args: any[]) => void;
      push?(args: any[]): void;
      load?(writeKey: string, options?: Record<string, any>): void;
    };
  }
}

// ---------------------------------------------------------------------------
// User traits sent with identify()
// ---------------------------------------------------------------------------
export interface SegmentUserTraits {
  email: string;
  role?: "user" | "super_admin";
  created_at?: string;
}

// ---------------------------------------------------------------------------
// Extra properties sent with page()
// ---------------------------------------------------------------------------
export interface SegmentPageProperties {
  playbook_id?: string;
  industry?: string;
  status?: string;
  total_playbooks?: number;
  drafts?: number;
  completed?: number;
}

// ---------------------------------------------------------------------------
// Discriminated event map — every trackEvent() call is compile-time checked
// ---------------------------------------------------------------------------
export interface SegmentEventMap {
  // Auth
  "Signed Up": { method: "email" };
  "Signed In": { method: "email" };
  "Magic Link Requested": Record<string, never>;
  "OAuth Started": { provider: string };
  "Auth Callback Completed": { method: "oauth" };
  "Signed Out": Record<string, never>;

  // Landing & Navigation
  "CTA Clicked": { cta: string; location: string };
  "Theme Toggled": { theme: "dark" | "light" };

  // Dashboard
  "Dashboard Viewed": {
    total_playbooks: number;
    drafts: number;
    completed: number;
  };
  "Playbook Opened": {
    playbook_id: string;
    industry?: string;
    status?: string;
  };
  "Playbook Deleted": { playbook_id: string };
  "New Playbook Clicked": { location: "header" | "empty_state" };

  // Builder Wizard
  "Wizard Started": { has_persisted_state: boolean };
  "Wizard Step Navigated": {
    from: number;
    to: number;
    direction: "forward" | "backward";
    time_on_step_ms?: number;
  };
  "Wizard Step Submitted":
    | { step: 1; customer_name_length: number; persona: string; industry: string }
    | {
        step: 2;
        enable_se_sidebar: boolean;
        enable_seeded_profiles: boolean;
        enable_profile_api: boolean;
        enable_intent_predictions: boolean;
      }
    | { step: 3; scenario_count: number; industry: string }
    | { step: 4; fields_provided_count: number };
  "Credentials Help Opened": Record<string, never>;
  "Playbook Created": { playbook_id: string };
  "Playbook Creation Failed": { error: string };

  // Compilation
  "Compilation Phase Changed": {
    playbook_id: string;
    phase: string;
    elapsed_ms: number;
  };
  "Compilation Completed": {
    playbook_id: string;
    total_ms: number;
    prompt_count: number;
  };
  "Compilation Failed": {
    playbook_id: string;
    error: string;
    failed_phase: string;
  };
  "Compilation Retried": { playbook_id: string };

  // Playbook Viewer
  "Playbook Viewed": {
    playbook_id: string;
    industry?: string;
    status?: string;
    prompt_count: number;
    needs_rehydration: boolean;
  };
  "Tab Switched": { playbook_id: string; tab: "prompts" | "script" };
  "Step Clicked": { playbook_id: string; step_number: number };
  "Prompt Copied": {
    playbook_id: string;
    step_number: number;
    prompt_title: string;
  };
  "Step Marked Complete": { playbook_id: string; step_number: number };
  "Troubleshooting Expanded": { playbook_id: string; step_number: number };
  "Keys Injected": { field_count: number };
  "Rehydration Skipped": Record<string, never>;
  "Prompts Exported": { playbook_id: string; format: "markdown" };
  "Demo Script Exported": { playbook_id: string; format: "markdown" };
  "Share Link Copied": { playbook_id: string };
  "Print Triggered": { playbook_id: string };

  // Share (anonymous)
  "Shared Playbook Viewed": { playbook_id: string; industry?: string };
  "Shared Demo Script Downloaded": { playbook_id: string };

  // Admin
  "User Role Changed": { target_user_id: string; new_role: string };
  "Template Selected": { template_id: string; category: string };
  "Template Saved": { template_id: string; new_version: number };
  "Template Created": { category: string };
  "Feature Created": { industry: string; slug: string };
  "Feature Toggled": { feature_id: string; is_active: boolean };
  "Industry Filter Changed": { industry: string };
}
