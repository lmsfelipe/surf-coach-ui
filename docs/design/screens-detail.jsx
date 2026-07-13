// ─────────────────────────────────────────────────────────────
// SurfRise — Session Detail (Option A hub) — 2 variations + states
// ─────────────────────────────────────────────────────────────

function HeroCard({ compact }) {
  return (
    <div style={{ background: 'linear-gradient(160deg, #1A2236 0%, #141B2E 60%, #0B1020 100%)', color: '#fff',
      borderRadius: 'var(--radius-lg)', padding: '20px 22px', position: 'relative', overflow: 'hidden',
      border: '1px solid var(--color-line)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 999,
        background: 'radial-gradient(circle, rgba(61,91,255,0.45) 0%, rgba(61,91,255,0) 65%)', filter: 'blur(8px)' }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'rgba(255,255,255,0.92)', marginBottom: 2 }}>Canal 1 · Santos/SP</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>25 mai 2026 · 06:42 · Glass-off</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 16, position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 64, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.05em' }}>6<span style={{ color: 'var(--accent)' }}>.</span>7</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: '15px' }}>nota geral<br/>4 manobras analisadas</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, position: 'relative', flexWrap: 'wrap' }}>
        <Pill tone="muted"><IconWave size={12}/> 0.9m</Pill>
        <Pill tone="muted"><IconBoard size={12}/> Pranchinha</Pill>
        <Pill tone="muted"><IconClock size={12}/> 1h22</Pill>
      </div>
    </div>
  );
}

// ── Variation A — stacked hub (spec Option A) ──
function DetailScreenA() {
  return (
    <div style={SCR}>
      <AppHeader onBack title="Sessão"/>
      <div style={{ padding: '4px 20px 0' }}>
        <HeroCard/>
        <div style={{ marginTop: 22 }}>
          <Eyebrow>Mídia</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <MediaThumb video/><MediaThumb/><MediaThumb/><MediaThumb dashed/>
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <Eyebrow>Análise</Eyebrow>
          <SummaryRow icon={<IconSparkle size={18}/>} title="Nota 6.7 · 6 aspectos" sub="Boa escolha de ondas, postura abre no bottom-turn"/>
        </div>
        <div style={{ marginTop: 22 }}>
          <Eyebrow>Treino</Eyebrow>
          <SummaryRow icon={<IconBarbell size={18}/>} title="3 treinos · postura &amp; bottom-turn" sub="9 exercícios · ~22 min"/>
        </div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <Button variant="danger" size="sm" leadingIcon={<IconTrash size={15}/>}>Excluir sessão</Button>
        </div>
      </div>
    </div>
  );
}

// ── Variation B — dashboard tiles ──
function DetailScreenB() {
  const ring = 'conic-gradient(var(--accent) 0% 67%, rgba(255,255,255,0.08) 67% 100%)';
  return (
    <div style={SCR}>
      <AppHeader onBack title="Sessão"/>
      <div style={{ padding: '4px 20px 0' }}>
        {/* hero: score ring + meta */}
        <div style={{ background: 'linear-gradient(160deg, #1A2236, #0B1020)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--color-line)', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -40, width: 180, height: 180, borderRadius: 999, background: 'radial-gradient(circle, rgba(61,91,255,0.4), transparent 65%)' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
            <div style={{ width: 92, height: 92, borderRadius: 999, background: ring, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 74, height: 74, borderRadius: 999, background: '#10172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 34, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>6.7</span>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: '#fff' }}>Canal 1 · Santos/SP</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>25 mai 2026 · 06:42</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <Pill tone="muted" size="sm"><IconWave size={11}/> 0.9m</Pill>
                <Pill tone="muted" size="sm"><IconBoard size={11}/> Pranchinha</Pill>
              </div>
            </div>
          </div>
        </div>
        {/* media filmstrip */}
        <div style={{ marginTop: 20 }}>
          <Eyebrow>Mídia · 3</Eyebrow>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 88, flexShrink: 0 }}><MediaThumb video/></div>
            <div style={{ width: 88, flexShrink: 0 }}><MediaThumb/></div>
            <div style={{ width: 88, flexShrink: 0 }}><MediaThumb/></div>
            <div style={{ width: 88, flexShrink: 0 }}><MediaThumb dashed/></div>
          </div>
        </div>
        {/* two action tiles */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(61,91,255,0.14)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><IconSparkle size={18}/></div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Análise</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 3, marginBottom: 10 }}>6 aspectos avaliados</div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Ver análise →</span>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(61,91,255,0.14)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><IconBarbell size={18}/></div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Treino</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 3, marginBottom: 10 }}>3 treinos · 9 exerc.</div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Ver treino →</span>
          </div>
        </div>
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
          <Button variant="danger" size="sm" leadingIcon={<IconTrash size={15}/>}>Excluir sessão</Button>
        </div>
      </div>
    </div>
  );
}

// ── Detail: loading skeleton ──
function DetailLoading() {
  return (
    <div style={SCR}>
      <AppHeader onBack title="Sessão"/>
      <div style={{ padding: '4px 20px 0' }}>
        <Skel h={150} r={18} mb={22}/>
        <Skel w="30%" h={10} mb={12}/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 22 }}>
          {[0,1,2,3].map(i => <Skel key={i} h={74} r={12}/>)}
        </div>
        <Skel w="30%" h={10} mb={12}/>
        <Skel h={64} r={18} mb={22}/>
        <Skel w="30%" h={10} mb={12}/>
        <Skel h={64} r={18}/>
      </div>
    </div>
  );
}

// ── Detail: fresh session (no media / no review / no plan) ──
function DetailEmpty() {
  return (
    <div style={SCR}>
      <AppHeader onBack title="Sessão"/>
      <div style={{ padding: '4px 20px 0' }}>
        <div style={{ background: 'linear-gradient(160deg, #1A2236, #0B1020)', borderRadius: 'var(--radius-lg)', padding: '20px 22px', border: '1px solid var(--color-line)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: '#fff' }}>Maresias · S. Sebastião/SP</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>28 mai 2026</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Pill tone="muted"><IconWave size={12}/> 1.1m</Pill>
            <Pill tone="muted"><IconBoard size={12}/> Funboard</Pill>
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <Eyebrow>Mídia</Eyebrow>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ borderRadius: 12, border: '1.5px dashed var(--border)', background: 'var(--color-surface-2)', color: 'var(--text-muted)', padding: '22px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <IconImage size={26}/>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-soft)' }}>Adicionar mídia</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>1 vídeo ou até 3 fotos</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <Eyebrow>Análise</Eyebrow>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--text-faint)', display: 'flex' }}><IconInfo size={17}/></span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: '18px' }}>Adicione mídia para analisar com a IA.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail: delete confirm dialog ──
function DetailDelete() {
  return (
    <div style={SCR}>
      <AppHeader onBack title="Sessão"/>
      <div style={{ padding: '4px 20px 0', filter: 'blur(1.5px)', opacity: 0.5 }}>
        <HeroCard/>
      </div>
      <AlertDialog title="Excluir sessão?" body="Isso remove a mídia e a análise dessa sessão. Não dá pra desfazer." confirmLabel="Excluir" danger/>
    </div>
  );
}

Object.assign(window, { HeroCard, DetailScreenA, DetailScreenB, DetailLoading, DetailEmpty, DetailDelete });
