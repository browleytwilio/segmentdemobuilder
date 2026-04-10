import type { CompilerInput, CompiledPrompt } from "../types";
import { SANITIZATION_MAP } from "../sanitizer";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildScaffoldPrompt(input: CompilerInput): CompiledPrompt {
  const { customerName, versions } = input;
  const projectName = slugify(customerName || "segment-demo") + "-demo";

  const deps = Object.entries(versions)
    .filter(([pkg]) => pkg !== "next") // next is installed via create-next-app
    .map(([pkg, ver]) => `${pkg}@${ver}`)
    .join(" \\\n    ");

  return {
    stepNumber: 0, // assigned by orchestrator
    title: "Scaffolding & Dependencies",
    expectedOutput:
      "A new Next.js project directory with all dependencies installed at exact versions and ShadCN UI initialized.",
    promptText: `# Step: Project Scaffolding & Dependencies

Create a new Next.js project and install all required dependencies at exact versions.

## 1. Scaffold the project

\`\`\`bash
npx create-next-app@${versions.next} ${projectName} \\
  --typescript --tailwind --eslint --app --src-dir --use-npm
cd ${projectName}
\`\`\`

## 2. Install exact dependency versions

\`\`\`bash
npm install --legacy-peer-deps --save-exact \\
    ${deps}
\`\`\`

## 3. Initialize ShadCN UI

\`\`\`bash
npx shadcn@latest init -d
\`\`\`

Accept the defaults (base-nova style). Then install the required components:

\`\`\`bash
npx shadcn@latest add button card input label select switch checkbox dialog -y
\`\`\`

## 4. Verify

Run \`npm run dev\` and confirm the app loads at http://localhost:3000 with no errors.
`,
  };
}
