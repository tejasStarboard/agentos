import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@agentos/ui/components/card';

/** Home dashboard widget slot (`ui/widget.tsx` in later tickets). */
export function HomeDashboard() {
  return (
    <section
      className="h-full w-full bg-background"
      aria-label="Home dashboard"
    >
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 p-4"
        data-slot="widgets"
      >
        <Card size="sm">
          <CardHeader>
            <CardTitle>Widgets</CardTitle>
            <CardDescription>
              Widgets slot — extension cards land here later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  );
}
