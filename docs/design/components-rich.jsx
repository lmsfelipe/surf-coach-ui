// ─────────────────────────────────────────────────────────────
// SurfRise — Rich components (cards, states, nav, dialogs)
// ─────────────────────────────────────────────────────────────

// score → ramp color (0–4 danger · 4–7 warning · 7–10 success)
function scoreColor(v) {
  if (v == null) return 'var(--text-muted)';
  if (v < 4) return 'var(--danger)';
  if (v < 7) return 'var(--warning)';
  return 'var(--success)';
}

// --- Bottom tab bar (3 tabs) ---
function TabBar({ active = 'sessions' }) {
  const items = [
    { id: 'sessions', label: 'Sessões', icon: IconHome },
    { id: 'treinos', label: 'Treinos', icon: IconBarbell },
    { id: 'profile', label: 'Perfil', icon: IconUser },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, height: 78,
      background: 'rgba(11,16,32,0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--color-line-soft)', display: 'flex', paddingBottom: 18,
    }}>
      {items.map(it => {
        const isActive = active === it.id;
        const Ic = it.icon;
        return (
          <div key={it.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: isActive ? 'var(--accent)' : 'var(--text-muted)', position: 'relative' }}>
            {isActive && <div style={{ position: 'absolute', top: 0, width: 26, height: 2, background: 'var(--accent)', boxShadow: '0 0 12px rgba(61,91,255,0.7)' }}/>}
            <Ic size={22}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// --- Center FAB (raised above the bar) ---
function FAB() {
  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      width: 58, height: 58, borderRadius: 999, background: 'var(--accent)', color: '#fff',
      boxShadow: '0 12px 28px rgba(61,91,255,0.55), 0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20,
      border: '3px solid var(--bg)',
    }}><IconPlus size={26}/></div>
  );
}

// --- Sticky bottom submit bar ---
function SubmitBar({ children }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 26px',
      background: 'var(--bg)', boxShadow: '0 -16px 32px rgba(0,0,0,0.45)', zIndex: 15 }}>{children}</div>
  );
}

// --- Scrollable content region (visual only — clipped to frame) ---
function Scroll({ children, pad = '0 20px', bottom = 24 }) {
  return <div style={{ height: '100%', padding: pad, paddingBottom: bottom, boxSizing: 'border-box', overflow: 'hidden' }}>{children}</div>;
}

// --- Session card ---
function SessionCard({ s }) {
  const hasScore = s.score != null;
  return (
    <div style={{ width: '100%', textAlign: 'left', background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      padding: '14px 16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--font-body)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.location}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{s.date}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {hasScore ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 32, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.045em' }}>{s.score.toFixed(1)}</span>
            </div>
          ) : (
            <Pill tone="outline" size="sm">Sem análise</Pill>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}><IconWave size={17}/><span style={{ fontSize: 12, fontWeight: 500 }}>{s.waveSize}m</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', minWidth: 0 }}><IconBoard size={17}/><span style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.boardLabel || '—'}</span></div>
        </div>
      </div>
      <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}><IconChevronRight size={20}/></div>
    </div>
  );
}

// --- Score row (label + bar + value, color-by-score) ---
function ScoreRow({ label, value, best }) {
  const col = best ? 'var(--accent)' : scoreColor(value);
  return (
    <div style={{ background: 'var(--color-surface-2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: col, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.025em' }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value * 10}%`, background: best ? 'var(--accent)' : col, borderRadius: 999 }}/>
      </div>
    </div>
  );
}

// --- Overall score band ---
function OverallBand({ value, sub }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 56, lineHeight: 1, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em' }}>
        {Math.floor(value)}<span style={{ color: 'var(--accent)' }}>.</span>{Math.round((value % 1) * 10)}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Nota geral</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

// --- Numbered tip item ---
function TipItem({ n, children, last }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--color-line-soft)' }}>
      <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 999, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12 }}>{n}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '19px', color: 'var(--color-text-soft)', flex: 1 }}>{children}</div>
    </div>
  );
}

// --- Card wrapper ---
function Card({ children, pad = 18, style = {} }) {
  return <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: pad, boxShadow: 'var(--shadow-sm)', ...style }}>{children}</div>;
}

// --- Summary row (detail hub link) ---
function SummaryRow({ icon, title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
      {icon && <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--color-surface-2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{title}</div>
        {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {action || <div style={{ color: 'var(--text-muted)' }}><IconChevronRight size={20}/></div>}
    </div>
  );
}

// --- Empty / Error / AI-pending states ---
function EmptyState({ icon, title, subtitle, cta }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 32px', gap: 4 }}>
      <div style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(61,91,255,0.10)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '19px', color: 'var(--text-muted)', maxWidth: 260, marginTop: 2 }}>{subtitle}</div>
      {cta && <div style={{ marginTop: 18 }}>{cta}</div>}
    </div>
  );
}

function ErrorState({ title = 'Algo não carregou.', subtitle = 'A culpa é nossa, não sua. Tenta de novo?', onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 32px', gap: 4 }}>
      <div style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(255,77,109,0.12)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><IconAlert size={28}/></div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '19px', color: 'var(--text-muted)', maxWidth: 250, marginTop: 2 }}>{subtitle}</div>
      <div style={{ marginTop: 18 }}><Button variant="outline" size="sm">Tentar de novo</Button></div>
    </div>
  );
}

function AIState({ title = 'Analisando sua sessão…', subtitle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '52px 32px', gap: 16 }}>
      <div style={{ width: 80, height: 80, borderRadius: 999, background: 'radial-gradient(circle, rgba(61,91,255,0.22), rgba(61,91,255,0.04) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DotPulser size={9} color="var(--accent)"/>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{title}</div>
        {subtitle && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6, maxWidth: 240 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// --- Skeletons ---
function Skel({ w = '100%', h = 12, r = 6, mb = 0, style = {} }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb,
      background: 'linear-gradient(90deg, var(--color-surface-2) 25%, rgba(255,255,255,0.07) 37%, var(--color-surface-2) 63%)',
      backgroundSize: '400% 100%', animation: 'srShimmer 1.4s ease infinite', ...style }}/>
  );
}
function SkelCard({ h = 76 }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)', height: h, boxSizing: 'border-box' }}>
      <Skel w="55%" h={12} mb={12}/>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Skel w={44} h={28} r={8}/><Skel w={50} h={12}/><Skel w={64} h={12}/>
      </div>
    </div>
  );
}

// --- Media thumbnail ---
function MediaThumb({ video, progress, onDelete, dashed, label }) {
  if (dashed) {
    return (
      <div style={{ aspectRatio: '1', borderRadius: 12, border: '1.5px dashed var(--border)', background: 'var(--color-surface-2)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <IconPlus size={20}/><span style={{ fontSize: 10, fontWeight: 600 }}>{label || 'Adicionar'}</span>
      </div>
    );
  }
  return (
    <div style={{ aspectRatio: '1', borderRadius: 12, background: 'linear-gradient(150deg, #243049, #161d30)', position: 'relative', overflow: 'hidden', border: '1px solid var(--color-line)' }}>
      {video && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)' }}><div style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconPlay size={14}/></div></div>}
      {video && <div style={{ position: 'absolute', bottom: 6, left: 6 }}><Pill tone="muted" size="sm">▷ vídeo</Pill></div>}
      {onDelete && <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconX size={13}/></div>}
      {progress != null && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,16,32,0.55)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', padding: 8 }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)' }}/></div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Board card ---
function BoardCard({ b }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '15px 16px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Pill tone="accent" size="sm">{b.type}</Pill>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--color-surface-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconPencil size={15}/></div>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--color-surface-2)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTrash size={15}/></div>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{b.label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>{b.size}</span>
        <span>·</span><span>{b.volume}L</span>
      </div>
    </div>
  );
}

// --- Training plan card ---
function PlanCard({ p }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '15px 16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{p.source}</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: 9 }}>{p.focus}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Pill tone="muted" size="sm">{p.workouts} treinos</Pill>
          <Pill tone="muted" size="sm">{p.exercises} exercícios</Pill>
        </div>
      </div>
      <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}><IconChevronRight size={20}/></div>
    </div>
  );
}

// --- Menu row (profile) ---
function MenuRow({ icon, label, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', borderBottom: last ? 'none' : '1px solid var(--color-line-soft)' }}>
      <div style={{ color: 'var(--accent)', display: 'flex' }}>{icon}</div>
      <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{label}</div>
      <div style={{ color: 'var(--text-muted)' }}><IconChevronRight size={18}/></div>
    </div>
  );
}

// --- Workout accordion item ---
function WorkoutAccordion({ n, title, focus, open, exercises }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px' }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-surface-2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>{n}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{focus}</div>
        </div>
        <div style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}><IconChevronDown size={18}/></div>
      </div>
      {open && exercises && (
        <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {exercises.map((ex, i) => (
            <div key={i} style={{ display: 'flex', gap: 13, background: 'var(--color-surface-2)', borderRadius: 12, padding: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, background: 'var(--mn-62)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(61,91,255,0.18)' }}>
                {ex.video ? <IconPlay size={20}/> : <IconBarbell size={20}/>}
                <div style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent)', color: '#fff', width: 20, height: 20, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10 }}>{i + 1}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--text)', marginBottom: 6 }}>{ex.name}</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
                  <Pill tone="muted" size="sm">{ex.sets} séries</Pill>
                  <Pill tone="muted" size="sm">{ex.reps}</Pill>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: '17px', color: 'var(--text-muted)' }}>{ex.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Alert dialog (confirm) ---
function AlertDialog({ title, body, confirmLabel = 'Confirmar', danger }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(4,6,15,0.7)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '22px 20px 28px', boxShadow: 'var(--shadow-lg)', borderTop: '1px solid var(--color-line)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--color-line)', margin: '0 auto 18px' }}/>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--text)', marginBottom: 8 }}>{title}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: '19px', color: 'var(--text-muted)', marginBottom: 20 }}>{body}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" full>Cancelar</Button>
          <Button variant={danger ? 'dangerSolid' : 'primary'} full>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

// --- Toast ---
function Toast({ children, tone = 'success' }) {
  const c = tone === 'success' ? 'var(--success)' : tone === 'error' ? 'var(--danger)' : 'var(--accent)';
  return (
    <div style={{ position: 'absolute', bottom: 96, left: 20, right: 20, zIndex: 30, background: 'var(--surface)', borderRadius: 12, padding: '13px 15px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-line)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ color: c, display: 'flex' }}><IconCheckCircle size={18}/></div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{children}</span>
    </div>
  );
}

// --- Offline banner ---
function OfflineBanner() {
  return (
    <div style={{ background: 'rgba(255,181,71,0.14)', borderBottom: '1px solid rgba(255,181,71,0.2)', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ color: 'var(--warning)', display: 'flex' }}><IconCloud size={15}/></span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--warning)' }}>Sem conexão.</span>
    </div>
  );
}

// shimmer keyframes (inject once)
if (typeof document !== 'undefined' && !document.getElementById('sr-shimmer')) {
  const st = document.createElement('style'); st.id = 'sr-shimmer';
  st.textContent = '@keyframes srShimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}';
  document.head.appendChild(st);
}

Object.assign(window, {
  scoreColor, TabBar, FAB, SubmitBar, Scroll, SessionCard, ScoreRow, OverallBand,
  TipItem, Card, SummaryRow, EmptyState, ErrorState, AIState, Skel, SkelCard,
  MediaThumb, BoardCard, PlanCard, MenuRow, WorkoutAccordion, AlertDialog, Toast, OfflineBanner,
});
