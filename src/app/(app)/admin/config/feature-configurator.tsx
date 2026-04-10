"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  createDemoFeature,
  updateDemoFeature,
  deactivateDemoFeature,
} from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics/events";

const INDUSTRIES = [
  "E-commerce / Retail",
  "B2B SaaS",
  "FinTech",
  "Media & Entertainment",
];

interface DemoFeature {
  id: string;
  industry: string;
  slug: string;
  label: string;
  description: string;
  display_order: number;
  is_active: boolean;
  prompt_templates: { id: string; name: string } | null;
}

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
}

export function FeatureConfigurator({
  features,
  scenarioTemplates,
}: {
  features: DemoFeature[];
  scenarioTemplates: PromptTemplate[];
}) {
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0]);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New feature form state
  const [newSlug, setNewSlug] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTemplateId, setNewTemplateId] = useState("");

  const filteredFeatures = features.filter(
    (f) => f.industry === selectedIndustry
  );

  async function handleCreate() {
    if (!newSlug.trim() || !newLabel.trim() || !newTemplateId) {
      toast.error("Slug, label, and template are required");
      return;
    }
    setSaving(true);
    const result = await createDemoFeature(
      selectedIndustry,
      newSlug.trim(),
      newLabel.trim(),
      newDescription.trim(),
      newTemplateId
    );
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Feature Created", { industry: selectedIndustry, slug: newSlug.trim() });
      toast.success("Feature created");
      setCreateOpen(false);
      setNewSlug("");
      setNewLabel("");
      setNewDescription("");
      setNewTemplateId("");
    }
    setSaving(false);
  }

  async function handleDeactivate(id: string) {
    const result = await deactivateDemoFeature(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Feature deactivated");
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    const result = await updateDemoFeature(id, { is_active: !currentActive });
    if (result.error) {
      toast.error(result.error);
    } else {
      trackEvent("Feature Toggled", { feature_id: id, is_active: !currentActive });
      toast.success(currentActive ? "Feature deactivated" : "Feature activated");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={selectedIndustry}
          onValueChange={(v) => {
            if (!v) return;
            trackEvent("Industry Filter Changed", { industry: v });
            setSelectedIndustry(v);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={<Button size="sm" />}
          >
            Add Feature
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Demo Feature</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Industry</Label>
                <Input value={selectedIndustry} disabled />
              </div>
              <div>
                <Label className="text-xs">Slug</Label>
                <Input
                  placeholder="e.g., loan-approval-webhook"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  placeholder="e.g., Loan Approval Webhook"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="Brief description for the wizard"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Linked Prompt Template</Label>
                <Select
                  value={newTemplateId}
                  onValueChange={(v) => v && setNewTemplateId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarioTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Linked Template</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFeatures.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-mono text-xs">{f.slug}</TableCell>
              <TableCell>{f.label}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {f.prompt_templates?.name ?? "—"}
              </TableCell>
              <TableCell>{f.display_order}</TableCell>
              <TableCell>
                <Badge variant={f.is_active ? "default" : "secondary"}>
                  {f.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(f.id, f.is_active)}
                >
                  {f.is_active ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filteredFeatures.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No features for this industry.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
