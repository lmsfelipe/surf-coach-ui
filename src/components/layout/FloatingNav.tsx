import { useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { IconBarbell, IconBoard, IconHome, IconPlus, IconUser } from '@/components/icons';

// --- cradle geometry (fixed radii; only the flat top segments flex with width)
const H = 66, R = 26, CRADLE = 37, FILLET = 12;
const SHOULDER = 45.6;
const TANGENT  = 34.4;
const LIP_Y    = 7.6;

function notchPath(w: number): string {
  const cx = w / 2;
  return [
    `M ${R} 0`,
    `L ${cx - SHOULDER} 0`,
    `A ${FILLET} ${FILLET} 0 0 1 ${cx - TANGENT} ${LIP_Y}`,
    `A ${CRADLE} ${CRADLE} 0 0 0 ${cx + TANGENT} ${LIP_Y}`,
    `A ${FILLET} ${FILLET} 0 0 1 ${cx + SHOULDER} 0`,
    `L ${w - R} 0`,
    `A ${R} ${R} 0 0 1 ${w} ${R}`,
    `L ${w} ${H - R}`,
    `A ${R} ${R} 0 0 1 ${w - R} ${H}`,
    `L ${R} ${H}`,
    `A ${R} ${R} 0 0 1 0 ${H - R}`,
    `L 0 ${R}`,
    `A ${R} ${R} 0 0 1 ${R} 0`,
    'Z',
  ].join(' ');
}

type TabId = 'sessions' | 'boards' | 'training-plans' | 'profile';

interface Tab {
  id: TabId;
  to: string;
  icon: React.ComponentType<{ size?: number }>;
  x: number;
}

// 4 tabs split evenly either side of the centre notch (~38% usable per side)
const TABS: Tab[] = [
  { id: 'sessions',       to: '/sessions',       icon: IconHome,    x: 0.12 },
  { id: 'boards',         to: '/boards',         icon: IconBoard,   x: 0.28 },
  { id: 'training-plans', to: '/training-plans', icon: IconBarbell, x: 0.72 },
  { id: 'profile',        to: '/profile',        icon: IconUser,    x: 0.88 },
];

function activeTabFromPath(pathname: string): TabId {
  if (pathname.startsWith('/training-plans')) return 'training-plans';
  if (pathname.startsWith('/boards'))         return 'boards';
  if (pathname.startsWith('/profile'))        return 'profile';
  return 'sessions';
}

/** Floating notched bottom nav with integrated FAB. Mobile only (hidden ≥md). */
export function FloatingNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = activeTabFromPath(pathname);

  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(360);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center md:hidden"
      style={{
        pointerEvents: 'none',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
      }}
    >
      <div
        ref={ref}
        style={{
          position: 'relative', width: '100%', maxWidth: 430, height: H,
          margin: '0 14px', pointerEvents: 'auto',
        }}
      >
        {/* pill shape — drop-shadow follows the notched silhouette */}
        <svg
          viewBox={`0 0 ${w} ${H}`}
          width={w}
          height={H}
          style={{
            position: 'absolute', inset: 0, display: 'block',
            filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.5))',
          }}
        >
          <path
            d={notchPath(w)}
            fill="var(--surface)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        </svg>

        {TABS.map(({ id, to, icon: Icon, x }) => {
          const isActive = active === id;
          return (
            <div
              key={id}
              style={{
                position: 'absolute', left: `${x * 100}%`, top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <button
                onClick={() => navigate({ to })}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  background: 'none', border: 'none', padding: 8, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'color 160ms',
                }}
              >
                <Icon size={22} />
                <span
                  style={{
                    width: 5, height: 5, borderRadius: 999,
                    background: isActive ? 'var(--accent)' : 'transparent',
                    boxShadow: isActive ? '0 0 8px rgba(61,91,255,0.8)' : 'none',
                    display: 'block',
                  }}
                />
              </button>
            </div>
          );
        })}

        {/* raised FAB nested in the cradle */}
        <button
          onClick={() => navigate({ to: '/sessions/new' })}
          aria-label="Nova sessão"
          style={{
            position: 'absolute', left: '50%', top: -35, transform: 'translateX(-50%)',
            width: 58, height: 58, borderRadius: 999, border: 'none', cursor: 'pointer',
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(61,91,255,0.4), 0 2px 5px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.32)',
          }}
        >
          <IconPlus size={26} />
        </button>
      </div>
    </div>
  );
}
