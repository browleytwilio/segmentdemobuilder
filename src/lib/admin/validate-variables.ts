const VALID_VARIABLES = [
  "CUSTOMER_NAME",
  "INDUSTRY",
  "SEGMENT_WRITE_KEY",
  "SEGMENT_BACKEND_WRITE_KEY",
  "SEGMENT_WORKSPACE_TOKEN",
  "SEGMENT_PROFILE_TOKEN",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "NPM_NEXT_VERSION",
  "NPM_REACT_VERSION",
  "NPM_SUPABASE_SSR_VERSION",
  "NPM_SUPABASE_JS_VERSION",
  "NPM_ANALYTICS_NEXT_VERSION",
  "NPM_SEGMENT_NODE_VERSION",
  "NPM_TAILWINDCSS_VERSION",
  "NPM_SHADCN_VERSION",
];

/**
 * Returns an array of invalid variable names found in the template content.
 * Empty array means all variables are valid.
 */
export function validateTemplateVariables(content: string): string[] {
  const found = content.match(/\{\{(\w+)\}\}/g) ?? [];
  return found
    .map((v) => v.replace(/[{}]/g, ""))
    .filter((v) => !VALID_VARIABLES.includes(v));
}
