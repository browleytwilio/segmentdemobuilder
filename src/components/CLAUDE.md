# Component Conventions

## RSC by Default

All components are React Server Components unless they need:
- Event handlers (`onClick`, `onSubmit`, form interactions)
- React hooks (`useState`, `useEffect`, `useRef`)
- Browser APIs (`window`, `document`, `localStorage`)
- Third-party client libraries (Framer Motion, react-hook-form)

Add `"use client"` directive only for these cases.

## shadcn/ui

Base components live in `components/ui/`. Do NOT edit these directly — they are managed by the shadcn CLI (`npx shadcn add <component>`). This project uses the `base-nova` theme with CSS variables.

## Builder Components (`builder/`)

4-step wizard flow: `StepContext` -> `StepArchitecture` -> `StepScenarios` -> `StepCredentials`
- Orchestrated by `BuilderWizard` with Framer Motion directional transitions
- Each step validates via react-hook-form + Zod schema, then calls `updateContext()` / `updateArchitecture()` on the Zustand store
- `NLBuilderEntry` — alternative AI-powered entry that parses free-form text into structured config
- `TemplatePicker` — pre-built template selection

## Playbook Components (`playbook/`)

- `PlaybookViewer` — main viewer, manages prompt state, auto-rehydrates keys from Zustand store on SPA navigation
- `PromptCard` — individual prompt display with copy, edit, regenerate, mark-complete actions
- `RehydrationModal` — collects credentials when keys aren't in memory (direct URL access)
- `AIScriptGenerator` — streaming chat UI for AI demo script generation via `useChat()`
- `PresentationMode` — full-screen presentation overlay
- `ProfileInspector` — Segment Profile API lookup UI

## Analytics Integration

All user-facing events use the typed `trackEvent()` helper:
```typescript
trackEvent("Event Name", { prop: value });
```
The `SegmentEventMap` in `lib/analytics/types.ts` is a discriminated union — adding a new event requires adding its type there first. The compiler will catch mismatched event names or missing properties.

## Form Pattern

Forms use `react-hook-form` + `zodResolver`:
```typescript
const { register, control, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema) as any,  // as any needed for zod compat
  defaultValues: { ... },
});
```
Select dropdowns use `<Controller>` wrapper. Text inputs use `{...register("field")}`.
