import { auth } from "@clerk/nextjs/server";
import { getUserTraits, getUserAudiences } from "@/lib/segment/profile-api";
import { ProvisionButton } from "./provision-button";

export default async function SegmentAdminPage() {
  const { userId } = await auth();

  let traits: Record<string, unknown> = {};
  let audiences: Record<string, boolean> = {};
  let error: string | null = null;

  if (userId && process.env.SEGMENT_SPACE_ID) {
    try {
      [traits, audiences] = await Promise.all([
        getUserTraits(`user_id:${userId}`),
        getUserAudiences(`user_id:${userId}`),
      ]);
    } catch (err) {
      error = String(err);
    }
  } else if (!process.env.SEGMENT_SPACE_ID) {
    error = "SEGMENT_SPACE_ID is not configured. Add it to your environment variables.";
  }

  const computedTraitKeys = Object.keys(traits).filter(
    (k) =>
      k.startsWith("total_") ||
      k.startsWith("has_") ||
      k.startsWith("last_") ||
      k.startsWith("first_")
  );
  const identifyTraitKeys = Object.keys(traits).filter(
    (k) => !computedTraitKeys.includes(k)
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Segment CDP</h2>
          <p className="text-sm text-muted-foreground">
            Manage computed traits, audiences, and view your enriched profile.
          </p>
        </div>
        <ProvisionButton />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Identify Traits */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Identify Traits ({identifyTraitKeys.length})
        </h3>
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Trait</th>
                <th className="px-4 py-2 text-left font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {identifyTraitKeys.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-muted-foreground">
                    No identify traits found. Make sure you&apos;re signed in and have triggered events.
                  </td>
                </tr>
              ) : (
                identifyTraitKeys.map((key) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{key}</td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {formatValue(traits[key])}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Computed Traits */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Computed Traits ({computedTraitKeys.length})
        </h3>
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Trait</th>
                <th className="px-4 py-2 text-left font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {computedTraitKeys.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-muted-foreground">
                    No computed traits found. Run provisioning first, then wait for traits to compute.
                  </td>
                </tr>
              ) : (
                computedTraitKeys.map((key) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{key}</td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {formatValue(traits[key])}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Audience Memberships */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Audience Memberships ({Object.keys(audiences).length})
        </h3>
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Audience</th>
                <th className="px-4 py-2 text-left font-medium">Member</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(audiences).length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-muted-foreground">
                    No audience memberships found. Run provisioning first, then wait for audiences to compute.
                  </td>
                </tr>
              ) : (
                Object.entries(audiences).map(([key, value]) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{key}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          value
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {value ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return val.toLocaleString();
  if (typeof val === "string") return val;
  return JSON.stringify(val);
}
