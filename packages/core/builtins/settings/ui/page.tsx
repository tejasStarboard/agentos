import { Separator } from '@agentos/ui/components/separator';

/**
 * Platform settings page — app/product preferences (theme, branding, extension
 * prefs later). Distinct from Auth secondary Activity Bar (account / session).
 * Opened from the Activity Bar secondary gear via `setActiveView('settings')`.
 */
export default function SettingsPage() {
  return (
    <div
      className="flex h-full min-h-full flex-col gap-4 bg-background p-6 text-foreground"
      data-slot="settings-page"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          App and platform preferences. Account and session live under Auth.
        </p>
      </div>
      <Separator />
      <p className="max-w-prose text-sm text-muted-foreground">
        Placeholders for theme, branding readouts, and extension preferences.
        More controls land in later tickets.
      </p>
    </div>
  );
}
