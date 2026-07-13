import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@/components/icons';
import { NAV_ITEMS } from './nav-items';
import { Wordmark } from './Wordmark';

/** Desktop left side rail (≥md): logo, vertical tabs, "Nova sessão" button. */
export function NavRail() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[240px] shrink-0 flex-col border-r border-border px-4 py-6 md:flex">
      <div className="px-2">
        <Wordmark />
      </div>
      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: 'bg-secondary text-primary' }}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">
        <Button asChild className="w-full">
          <Link to="/sessions/new">
            <IconPlus size={18} />
            Nova sessão
          </Link>
        </Button>
      </div>
    </aside>
  );
}
