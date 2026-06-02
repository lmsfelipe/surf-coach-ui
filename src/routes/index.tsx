import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

/**
 * Placeholder landing route. Real screens (auth, app shell, tabs) arrive with
 * the Claude Design layout export. This only proves the foundation boots.
 */
export const Route = createFileRoute('/')({
  component: FoundationReady,
});

function FoundationReady() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="t-eyebrow">SurfRise</span>
      <h1 className="t-display">
        Surf<span className="text-electric">Rise</span>
      </h1>
      <p className="t-body-l text-muted-foreground">
        Fundação pronta. As telas chegam com o layout exportado do Claude Design.
      </p>
      <Button>Componente de exemplo</Button>
    </main>
  );
}
