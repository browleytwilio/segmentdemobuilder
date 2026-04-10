import { getDemoFeatures, getActivePromptTemplates } from "../actions";
import { FeatureConfigurator } from "./feature-configurator";

export default async function AdminConfigPage() {
  const [featuresResult, templatesResult] = await Promise.all([
    getDemoFeatures(),
    getActivePromptTemplates(),
  ]);

  if (featuresResult.error || templatesResult.error) {
    return (
      <div className="text-sm text-destructive">
        {featuresResult.error
          ? `Failed to load features: ${featuresResult.error}`
          : `Failed to load templates: ${templatesResult.error}`}
      </div>
    );
  }

  const scenarioTemplates = (templatesResult.data ?? []).filter(
    (t) => t.category === "scenario"
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">UI Configurator</h2>
      <p className="text-sm text-muted-foreground">
        Manage demo features that appear in the onboarding wizard. Link each
        feature to a prompt template.
      </p>
      <FeatureConfigurator
        features={featuresResult.data ?? []}
        scenarioTemplates={scenarioTemplates}
      />
    </div>
  );
}
