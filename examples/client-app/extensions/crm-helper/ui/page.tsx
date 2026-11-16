import { Separator } from '@agentos/ui/components/separator';

/** CRM Helper main canvas — placeholder so the extension appears in the Activity Bar. */
export default function Page() {
  return (
    <div
      className="flex h-full min-h-full flex-col gap-4 bg-background p-6 text-foreground"
      data-crm-helper-page
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">CRM Helper</h1>
        <p className="text-sm text-muted-foreground">
          Dummy page for the CRM Helper extension.
        </p>
      </div>
      <Separator />
      <p className="max-w-prose text-sm text-muted-foreground">
        Use the sidebar to search contacts. This page exists so CRM Helper
        registers a <code className="text-foreground">ui/page.tsx</code> and
        shows up in the Activity Bar.
      </p>
    </div>
  );
}
