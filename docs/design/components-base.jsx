// ─────────────────────────────────────────────────────────────
// SurfRise — Base components (DARK · Midnight Electric)
// PhoneFrame, header, nav, buttons, form controls, pills.
// ─────────────────────────────────────────────────────────────

// --- Device shell: status bar + full-height relative content area ---
function PhoneFrame({ children, statusDark }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', fontFamily: 'var(--font-body)',
      position: 'relative', overflow: 'hidden',
    }}>
      <StatusBar/>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{
      height: 44, flexShrink: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 22px 0 26px',
      color: 'var(--text)', userSelect: 'none',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
        letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
      }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4"/></svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.5 0 4.8 1 6.5 2.6l-1.4 1.5A7 7 0 0 0 8 4.3a7 7 0 0 0-5.1 2L1.5 4.8A9.4 9.4 0 0 1 8 2.2z"/><path d="M8 6.4c1.3 0 2.5.5 3.4 1.4L8 11.3 4.6 7.8A4.9 4.9 0 0 1 8 6.4z"/></svg>
        {/* battery */}
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.4"/><rect x="2.5" y="2.5" width="16" height="8" rx="1.5" fill="currentColor"/><rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.4"/></svg>
      </div>
    </div>
  );
}

// --- App header: logo (tabs) OR back button (sub-screens) + avatar/title/action ---
function AppHeader({ title, onBack, action, avatar = 'FL', noAvatar }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 20px 10px', minHeight: 44, gap: 12,
    }}>
      {onBack ? (
        <button style={{
          width: 36, height: 36, borderRadius: 999, border: 'none', flexShrink: 0,
          background: 'var(--color-surface-2)', color: 'var(--text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
        }}><IconChevronLeft size={20}/></button>
      ) : (
        <a href="#" onClick={(e) => e.preventDefault()} style={{
          display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none',
        }}>
          <img src="assets/logo-surfrise-mark.svg" width="26" height="26" alt=""/>
          <span style={{
            fontFamily: "'Pacifico', cursive", fontSize: 21,
            letterSpacing: '-0.005em', color: 'var(--text)', lineHeight: 1,
          }}>Surf<span style={{ color: 'var(--accent)' }}>Rise</span></span>
        </a>
      )}
      {title && (
        <div style={{
          flex: 1, textAlign: 'center', fontFamily: 'var(--font-heading)',
          fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em',
        }}>{title}</div>
      )}
      {action ? action : (noAvatar ? <div style={{ width: 36 }}/> : (
        <div style={{
          width: 36, height: 36, borderRadius: 999, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--eb-50), var(--eb-87))',
          color: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'var(--font-body)',
          fontWeight: 700, fontSize: 12, letterSpacing: '0.02em',
        }}>{avatar}</div>
      ))}
    </div>
  );
}

// --- Button ---
function Button({ variant = 'primary', onClick, children, full, leadingIcon, trailingIcon, disabled, size = 'md', style = {} }) {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 13 },
    md: { padding: '13px 20px', fontSize: 14 },
    lg: { padding: '15px 22px', fontSize: 15 },
  };
  const base = {
    fontFamily: 'var(--font-body)', fontWeight: 600, ...sizes[size],
    borderRadius: 12, border: 'none', cursor: disabled ? 'default' : 'pointer',
    letterSpacing: '-0.005em', transition: 'all 160ms var(--ease-out)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: full ? '100%' : 'auto', opacity: disabled ? 0.45 : 1, ...style,
  };
  const variants = {
    primary:   { background: 'var(--accent)', color: '#fff', boxShadow: '0 8px 20px rgba(61,91,255,0.32)' },
    secondary: { background: 'var(--color-surface-2)', color: '#fff' },
    outline:   { background: 'transparent', color: 'var(--accent)', border: '1px solid rgba(61,91,255,0.4)' },
    ghost:     { background: 'transparent', color: 'var(--color-text-soft)' },
    danger:    { background: 'rgba(255,77,109,0.12)', color: 'var(--danger)' },
    dangerSolid: { background: 'var(--danger)', color: '#fff' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {leadingIcon}{children}{trailingIcon}
    </button>
  );
}

// --- Dot pulser (used in pending button + AI state) ---
function DotPulser({ size = 7, color = '#fff' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
      <style>{`@keyframes srPulse{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}`}</style>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: size, height: size, borderRadius: 999, background: color,
          animation: `srPulse 1.1s ${i * 0.15}s infinite var(--ease-in-out)`,
        }}/>
      ))}
    </span>
  );
}

// --- Field wrapper ---
function Field({ label, children, hint, error, optional }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: 'flex', alignItems: 'baseline', gap: 6, fontFamily: 'var(--font-body)',
          fontWeight: 600, fontSize: 12, color: 'var(--text)', marginBottom: 8,
          letterSpacing: '-0.005em',
        }}>{label}{optional && <span style={{ fontWeight: 500, fontSize: 11, color: 'var(--text-faint)' }}>· opcional</span>}</label>
      )}
      {children}
      {error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--danger)', marginTop: 6 }}>
          <IconAlertCircle size={13}/>{error}
        </div>
      ) : hint && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

const FIELD_CSS = {
  width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-body)',
  fontSize: 14, padding: '12px 14px', borderRadius: 10,
  border: '1px solid var(--border)', background: 'var(--color-surface-2)',
  color: 'var(--text)', outline: 'none',
};

function TextInput({ value, onChange, placeholder, type = 'text', icon, invalid, focused }) {
  const box = { ...FIELD_CSS, paddingLeft: icon ? 42 : 14,
    borderColor: invalid ? 'var(--danger)' : (focused ? 'var(--accent)' : 'var(--border)'),
    boxShadow: focused ? 'var(--shadow-focus)' : 'none' };
  return (
    <div style={{ position: 'relative' }}>
      {icon && <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>{icon}</div>}
      <input type={type} defaultValue={value ?? ''} placeholder={placeholder} style={box}/>
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea defaultValue={value ?? ''} placeholder={placeholder} rows={rows}
      style={{ ...FIELD_CSS, resize: 'none', lineHeight: 1.5 }}/>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <select defaultValue={value ?? ''} style={{
        ...FIELD_CSS, appearance: 'none', paddingRight: 38,
        color: value ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer',
      }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', display: 'flex' }}><IconChevronDown size={16}/></div>
    </div>
  );
}

function NumberInput({ value, onChange, suffix, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <input type="text" defaultValue={value ?? ''} placeholder={placeholder}
        style={{ ...FIELD_CSS, fontFamily: 'var(--font-display)', fontWeight: 500, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}/>
      {suffix && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>{suffix}</span>}
    </div>
  );
}

// --- Wave-size slider ---
function Slider({ value = 9, onChange, min = 0, max = 40, step = 1, scale = 0.1, unit = 'm' }) {
  const [v, setV] = React.useState(value);
  const pct = ((v - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>Arraste para ajustar</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 26, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
          {(v * scale).toFixed(1)}<span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4, letterSpacing: 0 }}>{unit}</span>
        </span>
      </div>
      <input type="range" value={v} min={min} max={max} step={step} onChange={e => { setV(+e.target.value); onChange && onChange(e); }}
        style={{ width: '100%', WebkitAppearance: 'none', appearance: 'none', height: 6, borderRadius: 999, outline: 'none',
          background: `linear-gradient(to right, var(--accent) ${pct}%, var(--color-surface-2) ${pct}%)` }}/>
      <style>{`
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--accent);box-shadow:0 4px 12px rgba(61,91,255,0.5);cursor:pointer}
        input[type=range]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--accent);box-shadow:0 4px 12px rgba(61,91,255,0.5);cursor:pointer}
      `}</style>
    </div>
  );
}

// --- Pill / chip ---
function Pill({ children, tone = 'muted', size = 'md' }) {
  const tones = {
    brand:   { bg: 'var(--accent)', fg: '#fff' },
    accent:  { bg: 'rgba(61,91,255,0.16)', fg: '#9CABFF' },
    action:  { bg: 'rgba(61,91,255,0.14)', fg: '#9CABFF' },
    success: { bg: 'rgba(0,199,129,0.14)', fg: '#00C781' },
    warning: { bg: 'rgba(255,181,71,0.16)', fg: '#FFB547' },
    danger:  { bg: 'rgba(255,77,109,0.14)', fg: '#FF4D6D' },
    muted:   { bg: 'var(--color-surface-2)', fg: 'var(--color-text-soft)' },
    outline: { bg: 'transparent', fg: 'var(--text-muted)', border: '1px solid var(--border)' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, background: t.bg, color: t.fg,
      border: t.border || 'none', padding: size === 'sm' ? '3px 8px' : '5px 10px',
      borderRadius: 999, fontFamily: 'var(--font-body)', fontWeight: 600,
      fontSize: size === 'sm' ? 10 : 11, letterSpacing: '-0.005em', whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Eyebrow({ children, style = {} }) {
  return (
    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 10,
      letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, ...style }}>{children}</div>
  );
}

// --- Inline alert (auth errors etc.) ---
function Alert({ children, tone = 'danger', icon }) {
  const tones = {
    danger:  { bg: 'rgba(255,77,109,0.10)', fg: '#FF8095', bd: 'rgba(255,77,109,0.25)' },
    warning: { bg: 'rgba(255,181,71,0.10)', fg: '#FFC470', bd: 'rgba(255,181,71,0.25)' },
    info:    { bg: 'rgba(61,91,255,0.10)', fg: '#9CABFF', bd: 'rgba(61,91,255,0.25)' },
  };
  const t = tones[tone];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: t.bg, border: `1px solid ${t.bd}`,
      color: t.fg, borderRadius: 10, padding: '11px 13px', fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.4 }}>
      {icon || <IconAlertCircle size={16}/>}<span>{children}</span>
    </div>
  );
}

// --- Avatar ---
function Avatar({ initials = 'FL', size = 72, url }) {
  if (url) return <img src={url} width={size} height={size} alt="" style={{ borderRadius: 999, objectFit: 'cover' }}/>;
  return (
    <div style={{ width: size, height: size, borderRadius: 999,
      background: 'linear-gradient(135deg, var(--eb-50), var(--eb-87))', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: size * 0.34, letterSpacing: '0.01em',
      boxShadow: '0 8px 24px rgba(61,91,255,0.3)' }}>{initials}</div>
  );
}

Object.assign(window, {
  PhoneFrame, StatusBar, AppHeader, Button, DotPulser, Field, TextInput, Textarea,
  Select, NumberInput, Slider, Pill, Eyebrow, Alert, Avatar, FIELD_CSS,
});
