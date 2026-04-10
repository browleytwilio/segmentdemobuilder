# **Context & Vision Document: The Segment Demo Builder**

## **1\. Executive Summary**

The Segment Demo Builder is an internal sales-enablement application designed to drastically reduce the time and technical friction required to build bespoke, enterprise-grade demonstrations of the Segment Customer Data Platform (CDP).

Crucially, **this tool does not write code.** Instead, it is an **Intelligent Prompt Compiler**. It acts as a configuration wizard that gathers prospect context, desired architectural features, and required API credentials, and translates them into a strict, highly sequenced playbook of prompts. A Solutions Engineer (SE) then feeds these prompts into **Claude Code** (an autonomous AI coding agent), which reliably builds a fully functional, highly tailored Next.js web application in minutes.

## **2\. The Problem It Solves**

Selling an enterprise CDP like Segment requires showing, not just telling. Prospects need to see their data flowing, identity resolution working in real-time, and downstream personalization happening before their eyes.

* **The Time Sink:** Building a custom demo app (Next.js, Auth, Segment SDKs, real-time database) tailored to a specific prospect's industry takes a Solutions Engineer days of development work.  
* **The "Boilerplate" Trap:** Maintaining static "demo repos" is a nightmare. They suffer from dependency rot, become outdated quickly, and lack the hyper-personalization needed to "wow" a specific prospect.  
* **The AI Failure Mode:** Generic AI coding tools fail at complex, multi-layered architectures. If an SE simply asks an AI to "build a Segment demo," the AI will inevitably hallucinate package versions, create peer-dependency conflicts, or misconfigure the Segment tracking plan.

## **3\. The Solution**

The Demo Builder solves this by acting as a highly opinionated architect. It removes the guesswork for both the SE and the AI. By dynamically injecting the absolute latest stable NPM package versions, strict architectural constraints, and specific industry tracking plans into pre-tested prompt templates, it guarantees Claude Code successfully builds a robust, conflict-free application every single time.

## **4\. Target Personas**

1. **The Solutions Engineer (The Operator):** Uses the builder to configure the prospect’s context, input API keys, and copy/paste the generated playbook into Claude Code.  
2. **The Account Executive (The Presenter):** Uses the generated "SE Demo Script" (the non-technical output) to actually present the custom-built demo to the prospect.  
3. **The Super-Admin (The Maintainer):** Uses the hidden CMS to update prompt templates, add new "WOW" features, and manage user access without needing to push code changes to the Next.js repository.

## **5\. Core Mechanics (The User Journey)**

1. **Context Ingestion:** The SE completes a progressive UI stepper, inputting the customer’s name, industry, desired features (e.g., E-commerce Cart Abandonment vs. B2B Intent Up-selling), and required API keys (Segment, Supabase).  
2. **Compilation & Security:** The engine pulls the required prompt templates from the database, fetches the latest package versions via the NPM registry API, and merges them. *Security constraint: Real API keys are injected directly into the user's browser for copying but are masked before the playbook is saved to the database.*  
3. **Execution (The Playbook):** The SE is presented with a sequential UI. They copy Prompt 1, paste it into their terminal running Claude Code, wait for success, and click "Mark Done." They repeat this for the 4-5 prompts in the sequence.  
4. **Handoff:** The tool concurrently generates a human-readable Markdown script detailing exactly how to present the newly built app, which can be exported to PDF or shared via a secure link.

## **6\. Key Features & Architecture**

* **Dual-Compilation Security Model:** Guarantees that sensitive Segment Write Keys and Supabase credentials are never persisted to the database. They exist only in local browser memory during the active session.  
* **NPM Version Resolver:** A backend service that pings the NPM registry at runtime to hardcode the absolute latest GA package versions (Next.js, Tailwind, ShadCN) into the prompts, completely eliminating AI dependency hallucination.  
* **The "God Mode" SE Sidebar:** A core architectural feature injected into every demo. Claude Code is instructed to build a hidden control panel allowing the presenter to force identify traits, spoof audience memberships, and trigger custom events on the fly during the pitch.  
* **Dynamic SE Script Generator:** Translates the technical selections made during onboarding into a step-by-step presentation script, mapping exactly where the presenter should click and what they should say to highlight the CDP's value.  
* **Super-Admin Headless CMS:** A hidden, role-based module (/admin) utilizing a VS-Code-style editor. It allows admins to write, version, and manage the master Markdown prompt templates directly in the database, preventing "prompt rot" as AI models evolve.

## **7\. Expected Benefits & ROI**

* **Velocity:** Reduces custom demo creation time from 2-3 days to under 20 minutes.  
* **Higher Win Rates:** Hyper-personalized demos (e.g., matching the prospect's exact industry and use cases) dramatically increase the perceived value of the product.  
* **Scalability of Expertise:** Junior SEs or even Account Executives can spin up incredibly complex architectural demos without needing to write a single line of React or Next.js code themselves.  
* **Zero Maintenance Demos:** Because the demo is generated fresh via AI using live NPM versions, there are no aging GitHub repositories to maintain, patch, or secure.

# **PRD 1: Core Foundation, Infrastructure, & Global State Architecture**

## **1\. Objective**

Establish the secure, scalable, and highly structured foundation for the Segment Demo Builder application. This phase dictates the underlying infrastructure, user authentication flows, strict database schemas, and a robust client-side state management system capable of handling complex demo configuration objects.

**Critical Directive:** This application processes highly sensitive third-party API keys (Segment Write/Workspace keys, Supabase credentials). Under no circumstances are these keys to be persisted to the database. They must exist entirely in local client memory and be injected at runtime.

## **2\. Technology Stack Baseline**

The engineering team must initialize the repository using the latest Generally Available (GA) versions of the following stack:

* **Framework:** Next.js (App Router)  
* **Language:** TypeScript (Strict mode enabled)  
* **Styling:** Tailwind CSS  
* **UI Components:** ShadCN UI (Out-of-the-box theme) & baseUI (for accessible primitives)  
* **Animations:** Framer Motion  
* **State Management:** Zustand (with selective localStorage persistence)  
* **Backend / BaaS:** Supabase (PostgreSQL, Auth, Edge Functions/pg\_cron)  
* **Rate Limiting:** Upstash Redis (via Vercel Edge)  
* **Hosting:** Vercel  
* **LLM**: OpenAI API Platform

## **3\. Infrastructure & Environments**

As a solo-developer project optimized for speed and safety, we will maintain a strict two-environment setup.

* **Local/Development:** \* Developer runs npm run dev.  
  * Connected to a dedicated "Dev" Supabase project via .env.local.  
* **Production:**  
  * Hosted on Vercel.  
  * Connected to a dedicated "Prod" Supabase project via Vercel Environment Variables.  
  * CI/CD via GitHub integration: Pushes to the main branch automatically trigger production deployments.  
* **Rate Limiting:** Initialize an Upstash Redis database. Implement middleware/edge logic for future Next.js API routes with a generous limit (e.g., 100 requests per 10 minutes per IP) to prevent malicious spamming of the compilation engine.

## **4\. Authentication & Security (Supabase Auth)**

The application is strictly gated. Users cannot generate, view, or configure playbooks without an authenticated session.

* **Supported Providers:** 1\. Email / Password  
  2\. Google OAuth  
  3\. GitHub OAuth  
* **Implementation:** Use @supabase/ssr to configure server-side authentication rendering, session management, and secure cookie handling.  
* **Next.js Middleware:** Implement middleware.ts to intercept unauthenticated requests. Routes /builder, /dashboard, and /playbooks/\* must redirect to /login.  
* **Row Level Security (RLS):** RLS must be enabled on all Supabase tables immediately upon creation.  
  * Policy: (user\_id \= auth.uid()) for SELECT, INSERT, UPDATE, and DELETE.

## **5\. Data Modeling (Supabase PostgreSQL Schema)**

The database will store user profiles and the complex JSON payloads that represent a saved demo configuration.

### **Table: profiles**

Automatically populated via Supabase Auth triggers upon user signup.

* id (UUID, Primary Key, references auth.users, cascading delete)  
* email (Text, Unique, Not Null)  
* created\_at (Timestampz, default now())  
* updated\_at (Timestampz, default now())

### **Table: playbooks**

Stores the configuration state and final output of the builder.

* id (UUID, Primary Key, default uuid\_generate\_v4())  
* user\_id (UUID, Foreign Key referencing profiles.id, Not Null)  
* customer\_name (Text, Not Null)  
* industry (Text, Not Null)  
* status (Enum: 'draft', 'completed', Not Null, default 'draft')  
* demo\_config (JSONB, Not Null) \- *Stores the complex configuration of enabled features.*  
* generated\_prompts (JSONB, Nullable) \- *Stores the compiled text strings (populated in Phase 5).*  
* created\_at (Timestampz, default now())  
* updated\_at (Timestampz, default now())

### **Database Lifecycle & Maintenance**

* **30-Day Draft Pruning:** Implement a Supabase pg\_cron job (or scheduled Edge Function) to automatically purge abandoned drafts.  
  * SQL Logic: DELETE FROM playbooks WHERE status \= 'draft' AND updated\_at \< NOW() \- INTERVAL '30 days';

## **6\. Global State Management (Zustand)**

Due to the massive configuration payload spanning multiple UI steps, React Context is unsuitable due to re-render costs. Zustand will act as the central brain.

* **Persistence:** Use Zustand's persist middleware to save generic configuration state to localStorage. This prevents data loss during accidental browser refreshes.  
* **Data Sanitization:** The persist configuration **must** use the partialize option to strictly omit the keys object from being written to localStorage.

**TypeScript State Interfaces:**

TypeScript

```

interface DemoArchitecture {
  enableSESidebar: boolean;         // Toggles the "God Mode" SE control panel
  enableSeededProfiles: boolean;    // Toggles mock user data generation
  enableProfileAPI: boolean;        // Toggles real/mocked Segment Profile API
  enableIntentPredictions: boolean; // Toggles ML intent score UI components
  enableSecondPagePers: boolean;    // Toggles downstream UI reaction rules
}

interface BuilderState {
  // Navigation State
  currentStep: number;
  
  // Base Context (Persisted)
  customerName: string;
  industry: string;
  persona: string;
  
  // Advanced Config (Persisted)
  architecture: DemoArchitecture;
  selectedScenarios: string[]; 
  
  // Credentials (IN-MEMORY ONLY - NEVER PERSISTED)
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
  updateContext: (context: Partial<Omit<BuilderState, 'architecture' | 'keys' | 'setStep' | 'updateContext' | 'updateArchitecture' | 'updateKeys' | 'resetStore'>>) => void;
  updateArchitecture: (config: Partial<DemoArchitecture>) => void;
  updateKeys: (keys: Partial<BuilderState['keys']>) => void;
  resetStore: () => void;
}

```

## **7\. UI/UX Foundation & Theming**

* **App Shell:** Configure app/layout.tsx with standard metadata, system font stack (e.g., Inter or Geist), and the Tailwind base.  
* **Component Library Init:** Run npx shadcn-ui@latest init.  
  * Style: Default/New York.  
  * Base Color: Slate/Neutral.  
  * CSS Variables: Enabled.  
* **Dark Mode:** Implement next-themes wrapping the layout, providing a standard Light/Dark/System toggle to ensure the builder itself looks like a premium developer tool.

## **8\. Definition of Done (Acceptance Criteria)**

* \[ \] Next.js repository is initialized, successfully builds locally, and deploys to Vercel upon main branch push.  
* \[ \] Supabase 'Dev' and 'Prod' projects are provisioned.  
* \[ \] profiles and playbooks tables are created with strict RLS policies enabled.  
* \[ \] The 30-day draft pruning cron job is successfully scheduled in Supabase.  
* \[ \] User authentication (Email/Password, Google, GitHub) is fully functional.  
* \[ \] Next.js Middleware successfully redirects unauthenticated traffic away from protected routes.  
* \[ \] Zustand useBuilderStore is fully typed and operational.  
* \[ \] Zustand selectively persists context and architecture to localStorage, while definitively verifying that the keys object remains exclusively in memory.

# **PRD 2: The Onboarding Wizard (Architecture, Scenarios, & Credentials)**

## **1\. Objective**

Build a fluid, highly technical, multi-step onboarding wizard. This interface acts as the configuration panel for a Senior Solutions Engineer. It collects base context, architectural feature toggles, industry-specific scenarios, and API credentials. This data feeds directly into the Zustand store defined in PRD 1, acting as the dynamic variables for the prompt compilation engine.

## **2\. Core Technologies & Libraries**

* **Form State Management:** react-hook-form  
* **Validation:** zod schema validation (paired with @hookform/resolvers/zod)  
* **UI Components:** ShadCN UI (Card, Form, Input, Select, Switch, Checkbox, Button, Dialog)  
* **Animations:** Framer Motion (AnimatePresence for step transitions)  
* **State Binding:** Zustand (hydrating the form on mount and updating the store on step progression)

## **3\. UI/UX Architecture: The Stepper**

The UI must use progressive disclosure to avoid overwhelming the user with a massive configuration payload.

* **Layout Structure:** A centered, constrained width card interface on the /builder route.  
* **Progress Indicator:** A visual breadcrumb or numbered stepper fixed to the top of the card (e.g., 1\. Context \-\> 2\. Architecture \-\> 3\. Scenarios \-\> 4\. Credentials).  
* **Framer Motion Transitions:** Implement directional sliding variants. Advancing to the next step slides the current view out to the left and brings the new step in from the right. Reversing goes the opposite direction.  
* **Hydration:** On component mount, the wizard must read currentStep and the persisted configuration from the Zustand store to instantly restore the user's progress if they reload the page.

## **4\. Step 1: Base Context & Persona**

This step establishes the narrative flavor of the demo and dictates the conditional rendering in Step 3\.

**Form Fields & Zod Validation:**

* **Customer Name:** z.string().min(2) (Text Input).  
* **Target Persona:** z.enum(\['CMO', 'CTO / Engineering', 'Product Manager', 'Data Team'\]) (Select Dropdown).  
* **Industry:** z.enum(\['E-commerce / Retail', 'B2B SaaS', 'FinTech', 'Media & Entertainment'\]) (Select Dropdown). *Crucial: react-hook-form must watch() this field to drive Step 3\.*

## **5\. Step 2: Core Demo Architecture (The "God Mode" Setup)**

This step configures the structural components and "wow" features that Claude Code will be instructed to build.

**Form Fields & Zod Validation:**

* **SE Demo Sidebar:** z.boolean().default(true) (Switch Toggle). Instructs Claude to build a fixed UI panel for forcing traits and events.  
* **Seeded Profile Data:** z.boolean().default(true) (Switch Toggle). Generates a mockData.ts file with robust dummy user profiles.  
* **Segment Profile API Integration:** z.boolean().default(false) (Switch Toggle). Determines whether the demo hits the real Segment API or relies purely on mocked local state.  
* **Intent Predictions:** z.boolean().default(false) (Switch Toggle). Instructs Claude to build UI blocks simulating Machine Learning intent scores.

## **6\. Step 3: Actionable Personalization Scenarios**

This step conditionally renders checkbox lists based strictly on the Industry selected in Step 1\.

**Dynamic Rendering Logic (Zod: z.array(z.string())):**

* **If E-commerce / Retail:**  
  * Option A: "Second-Page Personalization (Swap hero banner based on prior Product Viewed event)"  
  * Option B: "Authenticated VIP State (Instantly remove shipping costs via identify trait)"  
  * Option C: "Cart Abandonment Recovery (Simulate a push notification based on stale cart state)"  
* **If B2B SaaS:**  
  * Option A: "Intent Prediction Up-sell (Inject 'Talk to Sales' modal based on high usage traits)"  
  * Option B: "Group Level Context (Render Admin tabs only if group() call registers an Enterprise tier)"  
* **If FinTech:**  
  * Option A: "Edge-based PII Masking (Demonstrate client-side payload scrubbing before data reaches Segment)"  
  * Option B: "Risk Profile Gating (Restrict loan UI components based on real-time credit trait updates)"  
* **If Media & Entertainment:**  
  * Option A: "Content Affinity Engine (Dynamically reorder homepage categories based on computed content affinity scores)"  
  * Option B: "Paywall Thresholds (Trigger a subscription block after exactly 3 anonymous article views)"

## **7\. Step 4: Credential Ingestion & Validation**

This is the final step. These fields are highly sensitive, must be strictly validated, and explicitly written **only** to the in-memory Zustand store variables (never persisted).

**Form Fields & Zod Validation:**

* **Segment Frontend Write Key:** z.string().min(10) (Password Input).  
* **Segment Backend Write Key:** z.string().optional() (Password Input).  
* **Segment Workspace Token:** z.string().min(10) (Password Input).  
* **Segment Profile Token:** Conditionally required. If enableProfileAPI is true in Step 2, this is z.string().min(10). Otherwise, z.string().optional().  
* **Supabase URL:** z.string().url().includes('.supabase.co') (Text Input). Fails immediately if not a valid Supabase domain.  
* **Supabase Anon Key:** z.string().startsWith('eyJ') (Password Input). Validates standard JWT prefix.

**Helper UI:** Next to each credential input, implement a ShadCN Dialog component (info icon) containing exact screenshots and text explaining where to find the key in the respective platforms.

## **8\. Logic & State Integration**

* **Progression Blockers:** The "Next" button must be disabled or trigger immediate inline error messages if the current step's Zod schema fails.  
* **State Commits:** On a successful "Next" click, the local react-hook-form data is passed to the corresponding Zustand setter (updateContext, updateArchitecture, or updateKeys).  
* **Final Submission:** On the Step 4 "Generate Playbook" click:  
  1. Validate all credentials.  
  2. Commit credentials to the in-memory Zustand store.  
  3. Trigger a backend API call to Supabase to create a new playbook row with status: 'draft', saving the context and architecture (but specifically omitting keys).  
  4. Redirect the user to /builder/compile/\[playbook\_id\].

## **9\. Definition of Done**

* \[ \] The /builder route successfully orchestrates a 4-step wizard with smooth Framer Motion transitions.  
* \[ \] Step 3 dynamically and accurately renders options based exclusively on the Industry selected in Step 1\.  
* \[ \] Form validation strictly enforces all rules, highlighting erroneous fields before allowing progression.  
* \[ \] Step 4 credential validation successfully catches malformed URLs or missing tokens, heavily relying on conditional logic tied to Step 2\.  
* \[ \] Clicking "Generate Playbook" successfully writes safe configuration data to the Supabase database, retains keys strictly in client memory, and redirects to the compilation phase.

# **PRD 3: The Logic Engine, NPM Resolver, & Prompt Compilation**

## **1\. Objective**

Build the "brain" of the Demo Builder. This phase takes the complex configuration object from the Zustand store (PRD 2\) and synthesizes it into a strictly ordered, dependency-safe sequence of Markdown prompts designed specifically for Claude Code. It ensures Claude uses the exact GA package versions to prevent hallucinated dependency conflicts and safely manages the injection of sensitive API credentials.

## **2\. Core Technologies & Architecture**

* **Backend Runtime:** Next.js Route Handlers (app/api/...) running on Vercel Edge/Serverless.  
* **Caching & Rate Limiting:** Upstash Redis.  
* **Templating:** Pure TypeScript template literals encapsulated in strongly-typed factory functions (avoiding heavy external libraries like Handlebars).  
* **Package Registry:** Official NPM Registry API (https://registry.npmjs.org).  
* **Database Sync:** @supabase/ssr for authenticated database updates.

## **3\. The NPM Version Resolver API**

To prevent Claude Code from failing due to mismatched peer dependencies (a common AI agent failure mode), we must explicitly instruct it to install exact versions.

* **API Route:** GET /api/dependencies/versions  
* **Target Packages:** next, react, react-dom, tailwindcss, framer-motion, @segment/analytics-next, @supabase/supabase-js, lucide-react.  
* **Logic:**  
  1. The Next.js API route fetches the latest dist-tags.latest from the NPM registry for each package.  
  2. **Caching:** Implement standard Next.js revalidate caching (e.g., cache the response for 1 hour) to prevent hammering the NPM API and to ensure fast compilation.  
  3. **Rate Limiting:** Protect this route using the Upstash Redis rate limiter configured in PRD 1\.

## **4\. Prompt Templating Architecture**

The system must generate an array of prompt objects, structured sequentially. Each prompt is generated by a TypeScript factory function that accepts the Zustand state and NPM versions as arguments.

**Output Data Structure:**

TypeScript

```

interface CompiledPrompt {
  stepNumber: number;
  title: string;
  expectedOutput: string; // Human-readable instructions for the UI
  promptText: string;     // The actual copy-paste block for Claude
}

```

**Prompt Sequence Logic:**

* **Prompt 1: Scaffolding & Dependencies.**  
  * *Template Logic:* Instructs Claude to run npx create-next-app@latest, followed by installing the exact package versions fetched from the Resolver API. Includes strict commands to use \--legacy-peer-deps if necessary and to initialize ShadCN UI.  
* **Prompt 2: Environment & Core Providers.**  
  * *Template Logic:* Instructs Claude to create .env.local. Inject instructions to wrap the Next.js RootLayout with the @segment/analytics-next provider and Supabase Auth provider.  
* **Prompt 3: Demo Architecture (The "God Mode" Setup).**  
  * *Template Logic:* Evaluates the DemoArchitecture object from Zustand. If enableSESidebar is true, inject the prompt block to build the fixed SE control panel. If enableSeededProfiles is true, inject the exact JSON structure Claude should use to generate mockData.ts.  
* **Prompt 4+: Actionable Scenarios.**  
  * *Template Logic:* Iterate through the selectedScenarios array. For each scenario (e.g., "Second-Page Personalization"), append a specific prompt detailing exactly which Segment track() event to listen for and how to mutate the UI in response.

## **5\. Security & Data Sanitization (The Dual-Compilation Strategy)**

Because we must never save API keys to the database, but the user needs them in their immediate clipboard prompts, the compilation engine must generate two variants of the promptText.

* **Variant A (Client-Side / In-Memory):** The frontend compiler injects the raw segmentWriteKey, supabaseUrl, etc., directly from the Zustand keys store into the prompt strings. This variant is rendered strictly to the user's browser.  
* **Variant B (Database Safe):** Before sending the compiled data to Supabase, a utility function strips the real keys and replaces them with obvious placeholders (e.g., YOUR\_SEGMENT\_WRITE\_KEY).

## **6\. The Compilation Workflow (Step-by-Step Execution)**

When the user clicks "Generate Playbook" at the end of Step 4 (from PRD 2):

1. **Client Action:** The /builder/compile/\[playbook\_id\] page mounts. It immediately displays a loading skeleton UI ("Compiling prompts...").  
2. **Fetch Versions:** The client calls GET /api/dependencies/versions.  
3. **Compile In-Memory:** The client-side utility passes the Zustand state and the NPM versions into the Prompt Factory functions, generating **Variant A** (with keys).  
4. **Sanitize:** The client duplicates the array and runs the sanitization utility to create **Variant B** (keys masked).  
5. **Database Sync:** The client makes an authenticated PATCH request to /api/playbooks/\[playbook\_id\] sending the **Variant B** JSON to update the generated\_prompts column and change the row status to 'completed'.  
6. **Render UI:** Once the DB returns a success 200, the loading skeleton is removed, and the UI transitions to displaying the **Variant A** prompts (PRD 4 will cover this UI).

## **7\. Edge Cases & Fallbacks**

* **NPM Registry Timeout:** If the NPM registry fails or times out, the GET /api/dependencies/versions route must fall back to a hardcoded "safe" dictionary of stable versions (e.g., Next 14/15, React 18/19) to ensure the user is not blocked.  
* **Missing Keys:** Even though PRD 2 has validation, the compiler must have null checks. If a key is missing, it automatically injects a placeholder and appends a warning to the expectedOutput string alerting the user.

## **8\. Definition of Done**

* \[ \] The GET /api/dependencies/versions route is live, successfully fetches from NPM, implements 1-hour caching, and handles fallback errors.  
* \[ \] TypeScript Prompt Factory functions are written and strictly typed to accept the Zustand BuilderState.  
* \[ \] The compilation logic correctly generates highly specific instructions based conditionally on the selectedScenarios array.  
* \[ \] The **Dual-Compilation Strategy** is fully implemented: the database receives safely masked strings (Variant B), while the client retains the actionable prompts (Variant A).  
* \[ \] The database PATCH route successfully updates the playbooks table and transitions the status from draft to completed.

# **PRD 4: The Playbook Interface, Execution UX, & Dashboard**

## **1\. Objective**

Build the final execution interface—the "Playbook Viewer"—and the user dashboard. The Playbook Viewer is a highly interactive, flight-manual-style UI where the user sequentially copies the compiled prompts and pastes them into Claude Code. It must track their progress, provide expected outputs for verification, and handle error recovery. Additionally, this phase introduces the Dashboard where users can manage their saved playbooks.

## **2\. Core Technologies & Libraries**

* **UI Components:** ShadCN UI (Accordion, Card, Button, Badge, Toast notifications, Progress Bar).  
* **Clipboard Interaction:** Standard Web Clipboard API (navigator.clipboard) wrapped in a custom React hook for visual feedback.  
* **Syntax/Code Highlighting:** Use a lightweight highlighter (e.g., react-syntax-highlighter or standard Tailwind typography with \<pre\>\<code\> tags) to make the prompt blocks visually distinct and readable.  
* **Data Fetching:** @supabase/ssr (Server Components for dashboard fetching, Client Components for interactive playbook viewing).

## **3\. UI/UX Architecture: The Playbook Viewer**

Located at /playbooks/\[playbook\_id\]. This is the core operating screen.

* **Layout:** A two-column layout on desktop (or stacked on mobile/split-screen).  
  * **Left Column (The Index):** A sticky vertical stepper showing the title of each prompt (e.g., "1. Scaffolding", "2. Auth Setup") with visual checkmarks for completed steps.  
  * **Right Column (The Active Prompt):** A large, focused view of the currently selected prompt.  
* **The Prompt Block:** A stylized terminal-like window containing the massive text block.  
  * **Primary Action:** A massive, unmissable "Copy Prompt to Clipboard" button attached to the block.  
  * **Feedback:** Clicking copy triggers a success state on the button (e.g., changing from a Copy icon to a Check icon for 3 seconds) and fires a ShadCN Toast notification.

## **4\. Feature: Verification & Troubleshooting**

Claude Code is autonomous, but it needs supervision. Underneath every prompt block, the UI must render helper sections.

* **Expected Output Panel:** A standard text block outlining what the user should verify before proceeding.  
  * *Example:* "Claude should have successfully started the dev server. Open localhost:3000. You should see a blank Next.js screen with no terminal errors. If yes, mark as done and proceed."  
* **Troubleshooting Accordion:** A ShadCN Accordion containing pre-written "Fix It" prompts if Claude hallucinates.  
  * *Example Accordion Item:* "Did Claude fail on a peer dependency?" \-\> *Hidden prompt:* "Stop. Please run the installation again using \--legacy-peer-deps and ensure you are using the exact version numbers provided."

## **5\. Feature: State Tracking & Progression**

* **"Mark as Complete" Button:** Below the expected output, the user clicks to confirm the step worked.  
* **Visual Progression:** Clicking this updates the Left Column index (turns the step green), updates a master progress bar at the top of the page, and automatically scrolls/transitions to the next prompt.  
* **Local Persistence:** The array of "completed step IDs" should be saved to localStorage linked to the playbook\_id. If the user closes their laptop halfway through the build, returning to the page should immediately focus them on the step they left off on.

## **6\. Feature: The User Dashboard & Rehydration**

Located at /dashboard. This is the user's landing page after logging in.

* **Dashboard UI:** A data table or grid of cards listing all playbooks tied to user\_id \= auth.uid().  
  * Columns/Data: Customer Name, Industry, Status (Draft/Completed), Last Updated Date.  
  * Actions: View Playbook, Delete Playbook.  
* **The "Rehydration" Edge Case (CRITICAL):**  
  * *The Problem:* As dictated in PRD 3, the database only stores "Variant B" prompts (keys masked with YOUR\_SEGMENT\_WRITE\_KEY).  
  * *The Solution:* If a user clicks into a previously saved, completed playbook from their dashboard, intercept the page load with a Modal/Dialog: *"To execute this playbook, please provide your API keys for this session. We will inject them into the prompts locally."*  
  * *Execution:* The user pastes their keys into this temporary modal, the client-side utility does a regex find-and-replace to swap the placeholders with the real keys, and *then* renders the Playbook Viewer (Variant A).

## **7\. Edge Cases & Error Handling**

* **Clipboard Permissions:** Ensure graceful fallbacks (e.g., standard manual selection instructions) if the browser blocks the navigator.clipboard API.  
* **Playbook Not Found:** Standard 404 routing if the playbook\_id does not exist or the RLS policy blocks access (meaning it belongs to another user).  
* **Empty Keys in Rehydration:** If the user skips the Rehydration modal, the Playbook Viewer must clearly highlight the YOUR\_KEY\_HERE placeholders in red text so the user knows they have to manually replace them before sending to Claude.

## **8\. Definition of Done (Acceptance Criteria)**

* \[ \] The /dashboard route accurately lists the authenticated user's playbooks (fetching via Supabase server components).  
* \[ \] Users can successfully delete playbooks from the dashboard, removing the row from the Supabase database.  
* \[ \] The /playbooks/\[id\] route renders the two-column interactive viewer.  
* \[ \] The "Copy to Clipboard" functionality works flawlessly and provides clear visual/toast feedback.  
* \[ \] Step progression (marking a prompt as done) accurately tracks progress and persists locally across page reloads.  
* \[ \] The Rehydration Modal successfully intercepts saved playbooks, captures temporary keys, and correctly injects them into the prompt text in the browser's memory without saving them back to the database.

# **PRD 5: The Master Prompt Library, SE Demo Script, & Handoff**

## **1\. Objective**

Finalize the content payload and export capabilities of the builder. This phase shifts focus from the application's infrastructure to the actual qualitative outputs: establishing a scalable architecture for the Claude Code Prompt Library, dynamically generating the "Sales Engineer (SE) Demo Script," and providing tools to export and share these assets seamlessly.

## **2\. Core Technologies & Architecture**

* **Prompt Storage:** A dedicated lib/prompts/ directory within the Next.js repository containing .mdx or .ts template files, keeping prompt logic decoupled from component/API logic.  
* **Markdown Rendering:** react-markdown paired with remark-gfm to render the SE Demo Script cleanly in the UI.  
* **Export Utilities:** Standard browser Print API styled via Tailwind print: modifiers (for PDF generation) and standard Blob/File APIs for Markdown export.

## **3\. The Prompt Library Architecture (The Blueprints)**

To prevent prompt drift and ensure Claude Code builds exactly what is required, the engineering team must adhere to a strict prompt architecture.

**Anatomy of a Builder Prompt:**

Every generated prompt must structurally enforce constraints on the AI.

1. **Context/Persona:** (e.g., "You are an expert Next.js and Segment developer...")  
2. **Current State:** (e.g., "You have just initialized the app. We are now building the Layout.")  
3. **The Task:** Explicit step-by-step instructions.  
4. **Hardcoded Injections:** (e.g., The exact NPM versions from PRD 3, the exact trackingPlan.json structure to implement).  
5. **Strict Constraints:** (e.g., "DO NOT use React Context for this, use Zustand. DO NOT modify the Tailwind config.").

**Library Structure:**

Plaintext

```

/lib
  /prompts
    /base
      - 01_scaffolding.ts
      - 02_providers_and_auth.ts
    /architecture
      - se_sidebar.ts
      - profile_api_mock.ts
    /scenarios
      - ecommerce_abandoned_cart.ts
      - b2b_intent_upsell.ts

```

*Logic:* The compiler built in PRD 3 will dynamically import and concatenate these specific files based on the DemoArchitecture Zustand state.

## **4\. The SE Demo Flow Generator (The Sales Script)**

The tool does not just generate code; it generates the playbook on *how to present the demo*. This fulfills the critical requirement of mapping the selected WOW factors to an actionable script.

* **UI Integration:** In the Playbook Viewer (from PRD 4), add a toggle/tab at the top: \[ View Build Prompts \] | \[ View SE Demo Script \].  
* **Script Generation Logic:** Similar to the code prompts, the backend compiles a human-readable markdown script based on the selectedScenarios.  
* **Script Anatomy:**  
  * **Setup Checklist:** Reminds the SE to ensure the local dev server is running and their Segment workspace is open.  
  * **The Narrative:** (e.g., "Start by telling the prospect we are acting as a CMO at {{CustomerName}}...")  
  * **The Click Path:** Explicit, bolded instructions.  
    * *Example (If B2B Intent Upsell is selected):* "1. Open the SE Sidebar. 2\. Click 'Inject High Intent Score'. 3\. Point out how the 'Talk to Sales' modal instantly appears without a page refresh via Supabase real-time sync."  
  * **The 'Aha\!' Moment:** Instructions to open the Segment Debugger/Live Event Stream to prove the data flowed correctly.

## **5\. Export & Sharing (The Handoff)**

The person compiling the demo (e.g., a Solutions Architect) needs to hand the finished product off to the presenter (e.g., an Account Executive or SE).

* **Export to Markdown:** A button that generates a .md file containing both the Build Prompts and the SE Demo Script. Uses URL.createObjectURL(new Blob(...)) for immediate local download.  
* **Print to PDF:** A button that triggers window.print().  
  * *Engineering Constraint:* Must use Tailwind print classes (e.g., print:hidden, print:block) to hide the site navigation, buttons, and sidebars, outputting a clean, branded PDF of the playbooks and scripts.  
* **Read-Only Shareable Link:** \* Add a "Share Script" button that generates a URL (e.g., /playbooks/\[id\]/script).  
  * *Security Constraint:* This specific route bypasses the Rehydration requirement from PRD 4 because it **only** renders the human-readable SE Demo Script and strictly excludes the code prompts (which might contain API key placeholders).

## **6\. Edge Cases & Risk Mitigation**

* **Prompt Versioning:** As Claude Code updates its underlying models (e.g., moving from Claude 3.5 to Claude 3.7), standard prompt behaviors might change. The Prompt Library must be version-controlled in Git, and prompts should be written defensively (assuming the AI might try to take shortcuts).  
* **Markdown Rendering Security:** When rendering the generated SE Demo Script via react-markdown, ensure HTML processing is strictly disabled to prevent XSS attacks if a malicious user manages to inject a script tag into the customerName field during onboarding.

## **7\. Definition of Done (Acceptance Criteria)**

* \[ \] The lib/prompts directory is established with a strict factory pattern for generating the string templates.  
* \[ \] The Playbook Viewer UI successfully implements a tabbed interface separating "Build Prompts" and the "SE Demo Script".  
* \[ \] The SE Demo Script correctly generates a human-readable, step-by-step presentation narrative based *only* on the scenarios selected in Step 3 of the onboarding wizard.  
* \[ \] The "Export to Markdown" button successfully downloads a formatted .md file.  
* \[ \] The "Print to PDF" functionality produces a clean document using Tailwind print media queries, hiding unnecessary UI elements.  
* \[ \] The Read-Only shareable link successfully displays the presentation script while securely hiding all code prompts and API placeholders.

# **PRD 6: Telemetry, Observability, & Prompt Validation Architecture**

## **1\. Objective**

Establish robust monitoring, usage analytics, and quality assurance pipelines for the Demo Builder. This phase ensures that the engineering and go-to-market teams understand exactly how the tool is being used, catches application crashes before users report them, and most importantly, establishes a protocol to test the generated AI prompts against real-world library updates to prevent "prompt rot."

## **2\. Core Technologies & Architecture**

* **Internal Analytics:** @segment/analytics-next (Tracking the Builder's usage itself).  
* **Error Monitoring & Performance:** Sentry (Next.js SDK).  
* **Feature Flagging:** Vercel Edge Config or Supabase Remote Config (for rolling out new Prompt/WOW features to specific users).  
* **CI/CD Validation:** GitHub Actions (for scheduling prompt validation testing).

## **3\. Internal Telemetry ("Eating Our Own Dog Food")**

To prove the value of the tool and justify its maintenance, we must track user behavior within the Builder.

* **Implementation:** Initialize a new Segment Workspace specifically for the "Demo Builder Internal App." Wrap the Next.js app/layout.tsx in the Segment Analytics provider.  
* **Identify Call:** \* Trigger analytics.identify(user.id, { email: user.email, role: 'SE' }) upon successful Supabase Auth login.  
* **Core Tracking Plan:**  
  * Playbook Draft Started: Fired on Step 1\.  
  * Wizard Step Completed: Fired on "Next" clicks (Properties: step\_name, step\_number).  
  * Playbook Generated: Fired on final submission. (Properties: industry, demo\_goal, included\_features: \[\], time\_to\_complete\_wizard).  
  * Prompt Copied: Fired in the Playbook Viewer (Properties: prompt\_step, prompt\_title). *Crucial metric to see where SEs drop off during the build.*  
  * Demo Script Exported: Fired when PDF/Markdown is generated.

## **4\. Application Observability & Error Tracking**

Because the tool relies on external APIs (NPM Registry) and heavy client-side state manipulation, standard logging is insufficient.

* **Sentry Integration:** Install @sentry/nextjs.  
* **Key Monitored Zones:**  
  * **The NPM Resolver API:** Alert the team immediately if the registry fails to return GA versions (which would halt all prompt generation).  
  * **Zustand State Hydration:** Catch edge cases where corrupted localStorage data breaks the UI on load.  
  * **Supabase API Limits:** Monitor database query performance on the /dashboard route.  
* **Sanitization:** Strictly configure Sentry to **scrub all API keys** from error payloads before transmission to prevent credential leaking in error logs.

## **5\. Prompt Validation Pipeline (Preventing "Prompt Rot")**

The biggest risk to an AI-scaffolding tool is that libraries update (e.g., Next.js 16 releases) or Claude Code's underlying model changes, causing previously perfect prompts to generate broken code.

* **The Validation Sandbox:** The engineering team must maintain a standard test environment.  
* **Automated Weekly Dry-Runs:** Implement a GitHub Action scheduled via cron (e.g., every Monday at 3 AM).  
  * *Process:* The action pulls the latest master templates, fetches current NPM versions via the API route, and compiles a "Golden Path" test prompt string.  
  * *Output:* It saves this string as an artifact.  
* **Manual Verification Protocol:** Because Claude Code is an interactive, agentic CLI, fully headless CI/CD testing is difficult. Once a week, a designated engineer must copy the "Golden Path" string into a clean directory with Claude Code to ensure the app still builds successfully without hallucinated dependencies.

## **6\. Feature Flagging (Safe Rollouts)**

As the Solutions Architecture team invents new "WOW" factors (e.g., integrating a new warehouse destination), we need a way to test them without breaking the main tool.

* **Architecture:** Utilize Supabase database flags or standard environment variables to gate experimental features.  
* **Implementation in Step 2/3:** The UI dynamically reads the user's profile. If is\_beta\_tester: true, the UI reveals experimental checkboxes in the "Actionable Personalization Scenarios" step.

## **7\. Definition of Done (Acceptance Criteria)**

* \[ \] The Segment Analytics Next.js SDK is installed, and the internal tracking plan (Identify \+ 5 core Track events) is firing successfully to a live workspace.  
* \[ \] Sentry is integrated for both client and server components, with explicit data scrubbing rules to block API key transmission.  
* \[ \] A GitHub Action is configured to successfully compile and export a "Golden Path" prompt block on a weekly schedule for QA review.  
* \[ \] Feature flagging logic is established, allowing the safe, conditional rendering of experimental prompt scenarios in the UI based on user ID or environment variables.

Here is the comprehensive, engineering-ready Product Requirements Document (PRD) for Phase 7\.

*(Internal Context: This PRD represents a major architectural upgrade. It transitions the application from a static, code-bound prompt generator into a dynamic, headless CMS for AI prompts. It introduces strict Role-Based Access Control (RBAC) and refactors how the Next.js API routes compile the final output.)*

---

# **PRD 7: Super-Admin CMS, RBAC, & Dynamic Prompt Engine**

## **1\. Objective**

Transform the Demo Builder from a hardcoded utility into a dynamically managed platform. This phase builds a hidden "Super-Admin" portal directly into the existing application. It allows authorized users (Solutions Architects/Admins) to edit Claude Code prompt templates, configure industry WOW factors, and manage user roles via a GUI, entirely eliminating the need for code deployments to update the demo narrative.

## **2\. Core Technologies & Architecture**

* **Rich Text/Code Editor:** @monaco-editor/react (Provides VS-Code-like editing, syntax highlighting, and variable auto-completion for markdown prompts).  
* **Access Control:** Supabase Auth paired with Custom JWT Claims and Row Level Security (RLS).  
* **Routing:** Next.js Route Groups (e.g., (admin)/admin/...) protected by Next.js Middleware.  
* **Database Sync:** @supabase/ssr for CRUD operations on prompt templates and users.

## **3\. Database Schema Upgrades (Supabase)**

To support the CMS and RBAC, we must modify existing tables and introduce new ones.

### **3.1. Role-Based Access Control (RBAC)**

* **Modify profiles Table:**  
  * Add column: role (Enum: 'user', 'super\_admin', Default: 'user').  
* **The "Prime Admin" Trigger:**  
  * Write a Supabase Postgres function triggered on auth.users creation.  
  * *Logic:* IF NEW.email \= 'browley@twilio.com' THEN INSERT INTO profiles (id, email, role) VALUES (NEW.id, NEW.email, 'super\_admin');

### **3.2. The Dynamic Prompt & Feature Tables**

Move prompt definitions from local .ts files (from PRD 5\) into the database.

* **Table: prompt\_templates**  
  * id (UUID, Primary Key)  
  * name (Text) \- e.g., "E-commerce Cart Abandonment"  
  * category (Enum: 'foundation', 'architecture', 'scenario')  
  * content (Text) \- The actual prompt markdown containing {{VARIABLES}}.  
  * version (Integer, Default 1\)  
  * is\_active (Boolean, Default false)  
  * updated\_by (UUID, Foreign Key to profiles.id)  
  * updated\_at (Timestampz)  
* **Table: demo\_features** (Powers the Stepper UI dynamically)  
  * id (UUID, Primary Key)  
  * industry (Text) \- Maps to Step 1 dropdown.  
  * feature\_name (Text) \- e.g., "Second-Page Personalization"  
  * description (Text) \- Renders in the Stepper UI.  
  * prompt\_template\_id (UUID, Foreign Key) \- Links the UI choice to the exact prompt.  
  * is\_active (Boolean, Default true)

## **4\. Security & Route Protection**

The Super-Admin interface must be a ghost town to unauthorized users.

* **Next.js Middleware (middleware.ts):**  
  * Intercept any request to /admin\*.  
  * Fetch the user's session. If session.user.role \!== 'super\_admin', immediately redirect to /dashboard (or a generic 404 page to mask the route's existence).  
* **Row Level Security (RLS) Policies:**  
  * prompt\_templates & demo\_features: SELECT is public (authenticated users need to read them for compiling), but INSERT, UPDATE, DELETE strictly require (SELECT role FROM profiles WHERE id \= auth.uid()) \= 'super\_admin'.  
* **UI Visibility:** Navigation links to the /admin portal in the app shell must be conditionally wrapped: {userRole \=== 'super\_admin' && \<Link href="/admin"\>Admin\</Link\>}.

## **5\. Super-Admin Module A: User Management**

A dedicated dashboard located at /admin/users.

* **Functionality:** A data table listing all registered profiles.  
* **The "Browley" Rule:** Only existing Super-Admins can manage roles.  
  * *Action:* A dropdown on each user row: \[ Revoke Access | Make User | Make Super-Admin \].  
  * *Edge Case Constraint:* Hardcode a backend validation rule preventing the role of browley@twilio.com from ever being changed or deleted, ensuring the system can never be locked out.  
* **Usage Stats:** Display a column showing the total number of playbooks generated by each user (joining data from the playbooks table).

## **6\. Super-Admin Module B: The Prompt CMS**

Located at /admin/prompts. This is the core operating system for Demo Architects.

* **Layout:** A split-pane view. Left sidebar lists all prompt\_templates grouped by category. The right pane is the Editor.  
* **The Editor (@monaco-editor/react):**  
  * Loads the content of the selected prompt.  
  * **Variable Interpolation Helper:** A sidebar/floating panel listing all available system variables (e.g., {{CUSTOMER\_NAME}}, {{INDUSTRY}}, {{SEGMENT\_WRITE\_KEY}}, {{NPM\_NEXT\_VERSION}}).  
  * **Validation:** Before saving, the UI runs a regex check on the Monaco editor's content. If the admin typed {{FAAAKE\_VAR}}, block the save and alert them that the compiler will fail to inject that variable.  
* **Versioning:** When an admin clicks "Save", do not overwrite the row immediately. Standard practice: increment the version, archive the old content (or save to a prompt\_versions audit table), and set the new one as is\_active.

## **7\. Super-Admin Module C: UI Configurator**

Located at /admin/config. This allows admins to change the onboarding wizard without touching React code.

* **Functionality:** A GUI to manage the demo\_features table.  
* **Flow:** An admin wants to add a new FinTech feature.  
  1. They go to /admin/config.  
  2. Click "Add Scenario".  
  3. Select Industry: "FinTech".  
  4. Name: "Loan Approval Webhook".  
  5. Description: "Demonstrates backend identity stitching."  
  6. Link to Prompt: They select the prompt template they just built in Module B.  
* **Client Impact:** The Stepper UI (from PRD 2\) must be refactored to query SELECT \* FROM demo\_features WHERE is\_active \= true on mount, dynamically rendering the checkboxes based on this database state rather than hardcoded arrays.

## **8\. Compiler Engine Refactoring**

Because PRD 3 assumed prompts were local files, the GET /api/compile (or the frontend utility) must be updated.

* **New Compilation Flow:**  
  1. User clicks "Generate" in the wizard.  
  2. The API fetches the user's selectedScenarios (which are now IDs mapping to prompt\_templates).  
  3. The API runs a SELECT content FROM prompt\_templates WHERE id IN (...) AND is\_active \= true.  
  4. The string replacement engine injects the Zustand state (Keys, Name, Versions) into the dynamic {{VARIABLES}} fetched from the database.  
  5. Output is compiled into Variant A (client) and Variant B (database) as established in PRD 3\.

## **9\. Definition of Done (Acceptance Criteria)**

* \[ \] The Supabase Postgres trigger successfully promotes browley@twilio.com to Super-Admin upon signup.  
* \[ \] Next.js middleware and Supabase RLS strictly block standard users from accessing /admin routes or mutating template tables.  
* \[ \] The /admin/users UI allows existing Super-Admins to successfully promote or demote other users.  
* \[ \] The /admin/prompts interface utilizes Monaco Editor, accurately saves markdown strings to the database, and validates system variables.  
* \[ \] The UI Configurator successfully creates and maps demo\_features to prompt\_templates.  
* \[ \] The Onboarding Wizard (Step 3\) is refactored to hydrate its UI options entirely from the demo\_features database table.  
* \[ \] The Prompt Compilation engine successfully fetches templates from the database instead of the local filesystem and correctly maps user inputs into the dynamically fetched strings.

# **PRD 8: Execution Hardening, Claude Interop, & Handoff Polish**

## **1\. Objective**

Solve the physical constraints and edge cases of operating an AI agent via a web application. Terminals have clipboard limits, AI models suffer from context degradation over long builds, and browser PDF generators break code blocks. This phase hardens the Playbook UI and Prompt Compilation engine to ensure flawless execution and professional handoff, utilizing native browser and Node.js capabilities.

## **2\. Core Technologies & Architecture**

* **File Export:** Standard Web API Blob and URL.createObjectURL (Zero dependencies).  
* **Print Styling:** Tailwind CSS @media print utilities.  
* **AI Guardrails:** Dynamic prompt injection logic (enhancing the engine built in PRD 3/7).

## **3\. Feature A: Bypassing Terminal Clipboard Limits**

**The Problem:** Terminal emulators (like iTerm2 or VS Code Terminal) often truncate pastes exceeding a certain character count or mangle whitespace, which instantly breaks a complex Claude Code prompt.

**The Solution:** Provide a native file-download alternative to the clipboard.

* **UI Updates (Playbook Viewer):**  
  * Next to the massive "Copy Prompt" button on each step, add a secondary button: "Download as .md file".  
  * Add a global button at the top of the Playbook Viewer: "Download All Steps (.zip / Folder)". *(Engineering note: To avoid client-side zip libraries, implement this as a Next.js API route that uses Node's native zlib module to stream a zip file containing step-1.md, step-2.md, etc., back to the client).*  
* **Execution UX (Expected Output Panel):**  
  * Update the instructional text to explain this workflow: *"If your terminal truncates the paste, click Download. Move step-1.md into your Next.js directory and simply type claude @step-1.md in your terminal."*

## **4\. Feature B: AI Context Refreshes & The "Nuke & Pave"**

**The Problem:** By Step 4, Claude Code's context window is cluttered. It will attempt to modify app/layout.tsx based on what it *thinks* it looks like, rather than reading the actual file, leading to syntax errors. Furthermore, if a step fails completely, users need a standardized way to roll back.

**The Solution:** Build explicit guardrails into the prompt engine and the UI.

* **Context Refresh Injection (Backend Logic):**  
  * Update the prompt compilation engine. For any step \> 2, automatically append a strict "Context Verification" block to the top of the prompt.  
  * *Example String Injection:* "CRITICAL INSTRUCTION: Before writing any code for this step, you MUST read the current state of app/layout.tsxandcomponents/ui/ to refresh your context. Do not assume their state."  
* **The "Nuke & Pave" Recovery Accordion (UI):**  
  * Enhance the Troubleshooting Accordion from PRD 4\.  
  * Add a distinct, red-outlined section titled: **"Abort & Reset Step"**.  
  * *Action:* Provide a copyable terminal command and a prompt to revert state.  
  * *Command:* git clean \-fd && git checkout \-- . (Assuming Claude initialized git).  
  * *Prompt:* "Stop your current task. The previous step failed. Discard all uncommitted changes, delete any files you just created for this step, and await my next instruction."

## **5\. Feature C: Handoff Polish (Flawless PDF Export)**

**The Problem:** Generating the "SE Demo Script" (from PRD 5\) as a PDF via the browser's native window.print() results in horrific formatting—specifically, code snippets and markdown tables being sliced in half horizontally across page breaks.

**The Solution:** Strict implementation of Tailwind print modifiers on the rendering components.

* **Tailwind Print Configuration:**  
  * Ensure the tailwind.config.ts has no overrides blocking the print: variant.  
* **Component-Level Fixes (PlaybookViewer.tsx):**  
  * **Hide the App Shell:** Apply print:hidden to the global navbar, the left-column stepper UI, and all "Copy/Download" buttons. The PDF should purely be the document.  
  * **Page Breaks:** Apply print:break-inside-avoid to all \<pre\>, \<code\>, \<blockquote\>, and \<table\> elements rendered by react-markdown.  
  * **Typography Scaling:** Apply print:text-sm or print:text-black to ensure syntax highlighting colors (which might be optimized for Dark Mode) print legibly in black-and-white or grayscale environments.  
  * **Page Margins:** Wrap the printable area in a print:m-8 container to ensure standard 1-inch margins on US Letter/A4 paper.

## **6\. Edge Cases & Risk Mitigation**

* **Git Status Requirement:** The "Nuke & Pave" recovery step assumes a Git repository exists. The compiler must ensure that Prompt 1 explicitly instructs Claude Code to run git init and make an initial commit *after* scaffolding the Next.js app, otherwise the rollback commands will fail.  
* **Zip Route Memory Limits:** If the playbook gets massive, generating a zip file in a serverless function (Vercel Edge) might hit memory limits. The Node API route should use streams (fs.createReadStream piped to the zlib archiver and directly to the ServerResponse) rather than holding the entire zip buffer in memory.

## **7\. Definition of Done (Acceptance Criteria)**

* \[ \] The UI provides a "Download as .md" button for individual prompts using the native browser Blob API.  
* \[ \] A Next.js API route successfully generates and streams a .zip file of all prompt steps using Node native modules, without requiring third-party NPM packages.  
* \[ \] The prompt compiler automatically injects "Context Verification" instructions into Step 3 and beyond.  
* \[ \] The Troubleshooting Accordion includes a functional "Nuke & Pave" rollback prompt and Git commands.  
* \[ \] Prompt 1 templates are updated to ensure git init and an initial commit are explicitly performed by Claude.  
* \[ \] Triggering window.print() produces a perfectly formatted PDF where code blocks and tables do not break across pages, and all non-essential UI elements are hidden.

# **PRD 9: Data Integrity, Security, & State Migrations**

## **1\. Objective**

Ensure the Demo Builder is resilient to future updates, schema changes, and CMS alterations. This phase patches invisible vulnerabilities in how data moves through the application over time. It guarantees that updating the app's state interface will not crash returning users' browsers, ensures that previously generated playbooks remain permanently intact even if underlying templates are deleted, and hardens the security of the Rehydration workflow.

## **2\. Core Technologies & Architecture**

* **State Migrations:** Zustand persist middleware native features (version, migrate).  
* **Validation Centralization:** zod schemas extracted as shared utilities.  
* **Database Immutability:** Supabase PostgreSQL JSONB payload locking.

## **3\. Feature A: Zustand State Migration (Preventing LocalStorage Poisoning)**

**The Problem:** The app heavily relies on Zustand to persist complex objects (like the DemoArchitecture interface) to localStorage to prevent data loss on refresh. If the engineering team deploys a new feature (e.g., adding a hasDataWarehouse boolean to the state) and a returning user opens the app, Next.js will attempt to hydrate the UI with an outdated localStorage object, causing an immediate React runtime crash.

**The Solution:** Implement strict versioning and migration logic within the Zustand store setup.

* **Implementation Logic:**  
  * Update the useBuilderStore persist configuration to include a version: 1 property.  
  * Implement the migrate function.  
  * *Logic:* migrate: (persistedState: any, version: number) \=\> { ... }  
  * If version \=== 0 (or undefined), safely map the old persistedState keys to the new BuilderState schema, injecting default values for any new fields (e.g., hasDataWarehouse: false).  
* **Failsafe:** Wrap the migration logic in a try/catch. If the migration completely fails due to severely corrupted local data, the catch block must trigger the store's resetStore() action. It is better to clear a user's progress than to present a white screen of death.

## **4\. Feature B: Playbook Immutability (The Snapshot Rule)**

**The Problem:** In Phase 7, we introduced a Super-Admin Headless CMS that allows admins to write, version, and manage the master Markdown prompt templates directly in the database. If a Super-Admin alters or deletes the "B2B Intent Up-selling" template, any historical playbooks referencing that template ID would either break or dynamically change, ruining the historical record.

**The Solution:** Enforce compile-time stamping on the database level.

* **Architecture Update:**  
  * When a playbook transitions from draft to completed via the PATCH /api/playbooks/\[id\] route, the backend compilation engine must output the absolute, final string values.  
  * These strings are saved into the generated\_prompts JSONB column.  
* **The Disconnect Rule:** Once status \=== 'completed', the Playbook Viewer UI must **never** perform a join or fetch against the prompt\_templates or demo\_features CMS tables. It must strictly render exactly what is inside the generated\_prompts JSONB array. This guarantees that a playbook generated in 2026 will look exactly the same in 2028, regardless of CMS changes.  
* **Draft Edge Case:** If a playbook is still in status \=== 'draft' and the user loads it, the API *will* attempt to fetch the live CMS templates. If the API returns a 404 for a selected template ID (because an admin deleted it), the UI must catch this, display a warning toast ("A selected scenario is no longer available"), and drop the invalid ID from the user's selectedScenarios array.

## **5\. Feature C: Rehydration Validation & Security**

**The Problem:** The dual-compilation security model guarantees that sensitive Segment Write Keys and Supabase credentials are never persisted to the database. Therefore, returning users must "rehydrate" their session by pasting keys into a modal. If the user pastes a Supabase Anon Key into the Segment Workspace field during rehydration, the compiler will blindly inject it, the user will paste it into Claude, and the build will fail—triggering the exact AI Failure Mode we are trying to prevent.

**The Solution:** Centralize and reuse the onboarding Zod validation schemas.

* **Code Refactoring:**  
  * Extract the Zod schema used in Step 4 of the onboarding wizard (from PRD 2\) into a dedicated shared file: lib/validations/credentialsSchema.ts.  
* **Rehydration Modal Implementation:**  
  * The Rehydration Modal (triggered on the /playbooks/\[id\] route when keys are missing from memory) must use react-hook-form paired with the exact same @hookform/resolvers/zod utilizing credentialsSchema.ts.  
  * It must fail fast, highlighting inputs in red if a URL lacks https:// or .supabase.co, or if a JWT token lacks the eyJ prefix.  
  * Only upon successful validation does the modal close and commit the keys to the volatile Zustand keys state.

## **6\. Definition of Done (Acceptance Criteria)**

* \[ \] The Zustand store utilizes the version property, and a test migration successfully updates an outdated mock localStorage object without crashing the application.  
* \[ \] A failsafe try/catch is active in the Zustand store to clear state if migration fails.  
* \[ \] Playbooks with status \=== 'completed' load their text exclusively from the generated\_prompts payload, demonstrating complete immunity to modifications or deletions made in the Super-Admin CMS.  
* \[ \] Draft playbooks gracefully handle deleted template IDs by removing them from state and alerting the user.  
* \[ \] The Rehydration Modal strictly enforces credential formatting using a centralized Zod schema, preventing progression if invalid keys are entered.

# **PRD 10: Workflow Enhancements & Headless QA Pipeline**

## **1\. Objective**

Transform the Demo Builder from a single-use scaffolding utility into a scalable daily operating system for the Solutions Engineering team. This final phase introduces two critical operational features: **Playbook Cloning** (allowing SEs to duplicate and rapidly re-skin complex configurations) and an **Automated Headless QA Pipeline** (ensuring prompt templates do not degrade as NPM packages update or Claude models evolve).

## **2\. Core Technologies & Architecture**

* **Cloning Engine:** Next.js Route Handlers (POST /api/playbooks/\[id\]/clone) and Supabase PostgreSQL.  
* **QA CI/CD Pipeline:** GitHub Actions (cron-scheduled).  
* **Headless Execution Script:** Native Node.js standard libraries (child\_process, fs) paired with @anthropic-ai/sdk to programmatically simulate the Claude Code CLI experience within the test runner.

## **3\. Feature A: Playbook Cloning (The Forking Workflow)**

**The Problem:** The primary ROI of this tool is velocity. If an SE spends 10 minutes configuring a highly complex B2B SaaS playbook for a prospect, they should not have to manually re-click every toggle and feature flag to build a nearly identical demo for a different prospect tomorrow.

**The Solution:** Implement a 1-click duplication pipeline.

* **Dashboard UI Updates (/dashboard):**  
  * Add a "Duplicate" action to the dropdown menu for each row in the Playbook data table.  
  * Triggering this action opens a small ShadCN Modal: *"Duplicate Playbook. Enter new Customer Name:"* (with the input defaulting to \[Original Name\] (Copy)).  
* **Backend Implementation (POST /api/playbooks/\[id\]/clone):**  
  * Fetch the demo\_config, industry, and demo\_goal from the source playbook.  
  * Create a new row in the playbooks table with the new customer\_name.  
  * **Crucial Reset:** Set the new row's status strictly to 'draft' and explicitly set generated\_prompts to null. (We only clone the configuration, not the final immutable snapshot).  
* **Routing:** Upon success, immediately redirect the user to /builder with the Zustand store hydrated with the cloned configuration, landing them on Step 1\.

## **4\. Feature B: Headless QA & Automated Prompt Validation**

**The Problem:** The AI Failure Mode states that generic prompts break due to package updates or peer dependency conflicts. We solved this via the NPM Resolver API. However, if Claude introduces a breaking behavior in how it parses files, we need to know *before* an SE discovers it live on a sales call. Manual testing is unsustainable.

**The Solution:** Build a Node script that runs weekly in GitHub Actions, utilizing the Anthropic API to simulate a human executing the playbook.

* **The Validation Script (scripts/qa-runner.ts):**  
  * **Step 1 (Setup):** The script dynamically generates the heaviest possible "Golden Path" payload (all WOW factors enabled, all complex integrations turned on).  
  * **Step 2 (Compilation):** It pings the local compilation engine to fetch live NPM versions and outputs the concatenated markdown prompt strings.  
  * **Step 3 (Execution Sandbox):** The script uses Node's child\_process.execSync to create a temporary directory (/tmp/demo-test).  
  * **Step 4 (AI Simulation):** Using the Anthropic SDK, it passes the compiled markdown to Claude, intercepting the exact bash commands Claude *wants* to run (e.g., npx create-next-app), and executing them in the temporary directory.  
  * **Step 5 (Assertion):** After all prompts are executed, the script runs npm run build inside the temporary Next.js directory. If the build succeeds without fatal Next.js errors, the QA passes.  
* **GitHub Actions Integration (.github/workflows/weekly-qa.yml):**  
  * Set a cron schedule: cron: '0 3 \* \* 1' (Every Monday at 3 AM).  
  * Inject ANTHROPIC\_API\_KEY via GitHub Secrets.  
  * Output a Slack or email notification to the engineering team upon failure, containing the exact stdout logs of where Claude got stuck.

## **5\. Edge Cases & Risk Mitigation**

* **Zustand Stale Clones:** If a user clones a playbook created three months ago, the copied demo\_config JSONB might use an outdated schema. The client-side Zustand migrate function (built in PRD 9\) must successfully intercept and update this cloned payload exactly as it would for localStorage.  
* **CI/CD Timeout Limits:** A heavy Next.js build orchestrated via an LLM API can take 10+ minutes. The GitHub Action must have its timeout-minutes explicitly set to 30 to prevent premature failures.  
* **Anthropic API Costs:** To prevent runaway usage costs in the CI/CD pipeline, the script must implement a strict token limit or step-iteration cap (e.g., "If Claude attempts to rewrite the same file more than 3 times, abort and fail the test").

## **6\. Definition of Done (Acceptance Criteria)**

* \[ \] The /dashboard UI successfully exposes a "Duplicate" button that prompts for a new Customer Name.  
* \[ \] The backend API securely duplicates the config JSONB to a new draft row, strips previous generated outputs, and reassigns ownership to the acting user.  
* \[ \] The scripts/qa-runner.ts file is implemented and successfully compiles a full test playbook using live NPM registry tags.  
* \[ \] The QA script orchestrates a successful headless Next.js build using the Anthropic API in a temporary directory.  
* \[ \] The GitHub Action runs on a weekly schedule, utilizing the stored API key secret, and properly flags a failed build if dependency errors occur.

