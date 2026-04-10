import type { VersionMap } from "./types";

export const FALLBACK_VERSIONS: VersionMap = {
  next: "16.2.3",
  react: "19.2.4",
  "react-dom": "19.2.4",
  tailwindcss: "4.0.0",
  "framer-motion": "12.38.0",
  "@segment/analytics-next": "1.76.0",
  "@supabase/supabase-js": "2.103.0",
  "lucide-react": "1.8.0",
  "@supabase/ssr": "0.10.2",
};

export const TARGET_PACKAGES = Object.keys(FALLBACK_VERSIONS);
