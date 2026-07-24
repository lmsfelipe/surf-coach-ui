import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { IconCloud } from '@/components/icons';

/**
 * Router-wide fallback for unmatched URLs. Without this TanStack renders a bare
 * "Not Found" string, which is what a stale link or a mistyped deep link lands
 * on once the SPA fallback has served index.html.
 */
export function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={<IconCloud />}
        title="Essa página não existe."
        subtitle="O link pode estar quebrado ou a página saiu do ar."
        cta={
          <Button asChild variant="outline" size="sm">
            <Link to="/sessions">Voltar ao início</Link>
          </Button>
        }
      />
    </div>
  );
}
