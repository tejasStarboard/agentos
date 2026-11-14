/** Main extension page slot (`ui/page.tsx` in later tickets). */
export function MainCanvas() {
  return (
    <section
      className="h-full w-full bg-background"
      data-slot="main"
      aria-label="Main canvas"
    >
      <div className="p-4 text-sm text-muted-foreground">Main canvas slot</div>
    </section>
  );
}
