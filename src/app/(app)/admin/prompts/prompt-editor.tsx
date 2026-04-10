"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import { savePromptTemplate, createPromptTemplate } from "../actions";
import { validateTemplateVariables } from "@/lib/admin/validate-variables";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { trackEvent } from "@/lib/analytics/events";
import { AITemplateAssistant } from "@/components/admin/ai-template-assistant";

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  version: number;
  is_active: boolean;
}

const CATEGORIES = ["foundation", "architecture", "scenario"] as const;

const SYSTEM_VARIABLES = [
  "{{CUSTOMER_NAME}}",
  "{{INDUSTRY}}",
  "{{SEGMENT_WRITE_KEY}}",
  "{{SEGMENT_BACKEND_WRITE_KEY}}",
  "{{SEGMENT_WORKSPACE_TOKEN}}",
  "{{SEGMENT_PROFILE_TOKEN}}",
  "{{SUPABASE_URL}}",
  "{{SUPABASE_ANON_KEY}}",
  "{{NPM_NEXT_VERSION}}",
  "{{NPM_REACT_VERSION}}",
  "{{NPM_REACT_DOM_VERSION}}",
  "{{NPM_TAILWINDCSS_VERSION}}",
  "{{NPM_FRAMER_MOTION_VERSION}}",
  "{{NPM_ANALYTICS_NEXT_VERSION}}",
  "{{NPM_SUPABASE_JS_VERSION}}",
  "{{NPM_LUCIDE_REACT_VERSION}}",
  "{{NPM_SSR_VERSION}}",
];

const CODE_MANAGED_CATEGORIES = ["foundation", "architecture"];

export function PromptEditor({
  templates,
}: {
  templates: PromptTemplate[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    templates[0]?.id ?? null
  );
  const [editorContent, setEditorContent] = useState(
    templates[0]?.content ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string>("foundation");
  const [creating, setCreating] = useState(false);

  const selected = templates.find((t) => t.id === selectedId);

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = templates.filter((t) => t.category === cat);
      return acc;
    },
    {} as Record<string, PromptTemplate[]>
  );

  function handleSelect(template: PromptTemplate) {
    trackEvent("Template Selected", { template_id: template.id, category: template.category });
    setSelectedId(template.id);
    setEditorContent(template.content);
  }

  const handleEditorChange = useCallback((value: string | undefined) => {
    setEditorContent(value ?? "");
  }, []);

  async function handleSave() {
    if (!selectedId || !selected) return;

    const invalidVars = validateTemplateVariables(editorContent);
    if (invalidVars.length > 0) {
      toast.error(
        `Invalid variables: ${invalidVars.map((v) => `{{${v}}}`).join(", ")}. The compiler cannot inject these.`
      );
      return;
    }

    setSaving(true);
    const result = await savePromptTemplate(selectedId, editorContent);
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Template Saved", { template_id: selectedId, new_version: result.newVersion ?? 0 });
      toast.success(`Template saved (v${result.newVersion})`);
    }
    setSaving(false);
  }

  async function handleCreate() {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }

    setCreating(true);
    const result = await createPromptTemplate(
      newName.trim(),
      newCategory,
      "# New Template\n\nEnter your prompt content here.\n"
    );
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Template Created", { category: newCategory });
      toast.success("Template created");
      setCreateOpen(false);
      setNewName("");
    }
    setCreating(false);
  }

  const isCodeManaged =
    selected != null &&
    CODE_MANAGED_CATEGORIES.includes(selected.category);
  const hasChanges = selected && editorContent !== selected.content;

  return (
    <div className="flex gap-4" style={{ height: "calc(100vh - 240px)" }}>
      {/* Left sidebar — template list */}
      <div className="w-64 shrink-0 overflow-y-auto rounded-lg border p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Templates
          </span>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={<Button variant="ghost" size="sm" className="h-6 text-xs" />}
            >
              + New
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Prompt Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Template name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat} className="mb-3">
            <p className="mb-1 text-xs font-medium capitalize text-muted-foreground">
              {cat}
            </p>
            {grouped[cat]?.length === 0 && (
              <p className="text-xs text-muted-foreground/60 italic">
                No templates
              </p>
            )}
            {grouped[cat]?.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className={`mb-0.5 w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                  selectedId === t.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <span className="line-clamp-1">{t.name}</span>
                <span className="text-[0.65rem] text-muted-foreground">
                  v{t.version}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Right pane — editor + toolbar */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
        {selected ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-3 border-b px-4 py-2">
              <span className="text-sm font-medium">{selected.name}</span>
              <Badge variant="outline" className="text-[0.65rem]">
                {selected.category}
              </Badge>
              <Badge variant="secondary" className="text-[0.65rem]">
                v{selected.version}
              </Badge>
              {isCodeManaged && (
                <Badge variant="outline" className="text-[0.65rem] border-amber-500/50 text-amber-600">
                  Code-Managed
                </Badge>
              )}
              {hasChanges && !isCodeManaged && (
                <Badge variant="destructive" className="text-[0.65rem]">
                  Unsaved
                </Badge>
              )}
              <div className="ml-auto">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !hasChanges || isCodeManaged}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            {/* Monaco editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language="markdown"
                theme="vs-dark"
                value={editorContent}
                onChange={handleEditorChange}
                options={{
                  wordWrap: "on",
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  readOnly: isCodeManaged,
                }}
              />
            </div>

            {/* Variable reference */}
            <div className="border-t px-4 py-2">
              <p className="mb-1 text-[0.65rem] font-medium uppercase text-muted-foreground">
                Available Variables
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SYSTEM_VARIABLES.map((v) => (
                  <code
                    key={v}
                    className="rounded bg-muted px-1.5 py-0.5 text-[0.65rem]"
                  >
                    {v}
                  </code>
                ))}
              </div>
            </div>

            {/* AI Template Assistant */}
            {!isCodeManaged && (
              <AITemplateAssistant
                templateId={selected.id}
                templateContent={editorContent}
                onAccept={(refined) => setEditorContent(refined)}
              />
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            {templates.length === 0
              ? "No templates yet. Create one to get started."
              : "Select a template from the sidebar."}
          </div>
        )}
      </div>
    </div>
  );
}
