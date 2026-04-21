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
  // Auth — success
  "Sign Up Started": { method: "email" };
  "Signed Up": { method: "email" };
  "Signed In": {
    method: "email" | "magic_link" | "oauth";
    provider?: string;
  };
  "Magic Link Requested": { email_domain: string };
  "OAuth Started": { provider: string };
  "Signed Out": { method: "manual" };
  "Profile Updated": { field: string };

  // Auth — failure
  "Sign Up Failed": { method: "email"; error: string };
  "Sign In Failed": {
    method: "email" | "magic_link" | "oauth";
    error: string;
    provider?: string;
  };
  "Magic Link Failed": { error: string };
  "OAuth Failed": { provider: string; error: string };

  // Landing & Navigation
  "CTA Clicked": { cta: string; location: string };
  "Theme Toggled": { theme: "dark" | "light" };
  "Marketing Interaction": {
    component: string;
    interaction: string;
    properties?: Record<string, string | number | boolean>;
  };

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
    | { step: 1; customer_name_length: number; persona: string; industry: string; has_brand_details?: boolean }
    | {
        step: 2;
        enable_se_sidebar: boolean;
        enable_seeded_profiles: boolean;
        enable_profile_api: boolean;
        enable_intent_predictions: boolean;
        database_provider: string;
        auth_provider: string;
      }
    | { step: 3; scenario_count: number; industry: string }
    | { step: 4; fields_provided_count: number; database_provider: string };
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
  "Compilation Retried": { playbook_id: string; resume_from?: string };

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
  "Auto-Rehydrated": { playbook_id: string };
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

  // AI Features
  "AI Chat Sent": { message_length: number; has_playbook_context: boolean };
  "AI Chat Response Received": { response_time_ms: number };
  "AI Script Generated": { playbook_id: string; industry: string; persona: string };
  "AI Enrichment Completed": { playbook_id: string; prompt_count: number };
  "AI Scenarios Recommended": { industry: string; persona: string; count: number };
  "NL Builder Used": { description_length: number };
  "AI Template Refined": { template_id: string };
  "Prompt Regenerated": { playbook_id: string; step_number: number };

  // Signup restriction
  "Signup Rejected": { email_domain: string };

  // Dashboard search & organization
  "Dashboard Tab Switched": { tab: "mine" | "shared" };
  "Dashboard Filtered": { filter_type: string; filter_value: string };
  "Dashboard Searched": { query_length: number; result_count: number };
  "Playbook Favorited": { playbook_id: string; is_favorite: boolean };
  "Tag Created": { tag_name: string; color: string };
  "Tag Applied": { playbook_id: string; tag_id: string };
  "Tag Removed": { playbook_id: string; tag_id: string };

  // Cloning & templates
  "Playbook Cloned": { source_playbook_id: string; new_playbook_id: string; source: "dashboard" | "share" };
  "Template Used": { template_id: string; template_name: string; industry: string };
  "Shared Playbook Forked": { source_playbook_id: string; new_playbook_id: string };

  // Shared playbooks & comments
  "Playbook Visibility Changed": { playbook_id: string; visibility: string };
  "Comment Added": { playbook_id: string; comment_length: number };
  "Comment Deleted": { playbook_id: string; comment_id: string };
  "Shared Playbooks Viewed": { count: number };

  // Admin — new actions
  "Admin Playbook Deleted": { playbook_id: string; customer_name: string; owner_email: string };
  "Admin Playbook Visibility Changed": { playbook_id: string; visibility: string; owner_email: string };
  "Admin Playbooks Filtered": { filter_type: "industry" | "status" | "q"; filter_value: string };
  "Admin Playbook Opened": { playbook_id: string; industry: string; owner_email: string };

  // Notifications
  "Notification Viewed": { notification_id: string; type: string };
  "All Notifications Marked Read": { count: number };

  // Profile Inspector
  "Profile Lookup": { identifier_type: "user_id" | "email" | "anonymous_id"; playbook_id: string };
  "Profile Lookup Failed": { error: string; playbook_id: string };

  // UX Interactions
  "Mobile Nav Toggled": { action: "open" | "close" };
  "Quick Action Used": { action: string; playbook_id: string };
  "Playbook Card Hovered": { playbook_id: string; duration_ms: number };
  "Builder Mode Selected": { mode: "wizard" | "describe" | "templates" };
  "Admin Tab Navigated": { tab: string };

  // Command Palette
  "Command Palette Opened": { trigger: "keyboard" | "sidebar" };
  "Command Palette Action": { action: string };
}
