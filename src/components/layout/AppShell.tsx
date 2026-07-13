import { Outlet, useLocation } from '@tanstack/react-router';
import { FloatingNav } from './FloatingNav';
import { NavRail } from './NavRail';

/**
 * Authenticated wrapper: desktop side rail (≥md) or mobile bottom nav + FAB,
 * with a centered scrollable content column. Onboarding renders bare (no nav).
 */
const SESSION_FLOW_RE = /^\/sessions\/(new|[^/]+\/(upload|review|plan))$/;

export function AppShell() {
  const { pathname } = useLocation();
  const bare = pathname.startsWith('/onboarding');
  const hideNav = SESSION_FLOW_RE.test(pathname);

  if (bare) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-[560px]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <NavRail />
      <div className="flex-1">
        <main className={`mx-auto w-full max-w-[1120px] pt-[max(env(safe-area-inset-top),16px)] md:pt-4 ${hideNav ? '' : 'pb-[180px] md:pb-12'}`}>
          <Outlet />
        </main>
      </div>
      {!hideNav && <FloatingNav />}
    </div>
  );
}
