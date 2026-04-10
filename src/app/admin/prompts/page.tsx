import { getActivePromptTemplates } from "../actions";
import { PromptEditor } from "./prompt-editor";

export default async function AdminPromptsPage() {
  const { data: templates, error } = await getActivePromptTemplates();

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load templates: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Prompt Templates</h2>
      <PromptEditor templates={templates ?? []} />
    </div>
  );
}
