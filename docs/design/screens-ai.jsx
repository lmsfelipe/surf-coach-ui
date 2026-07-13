// ─────────────────────────────────────────────────────────────
// SurfRise — Upload · AI Review · Training Plan (+ states)
// ─────────────────────────────────────────────────────────────

const SCORES = [
  { label: 'Take-off & pop-up', value: 7.5 },
  { label: 'Postura & equilíbrio', value: 6.2 },
  { label: 'Escolha da onda', value: 8.1, best: true },
  { label: 'Manobras', value: 5.4 },
  { label: 'Fluxo (flow)', value: 6.8 },
  { label: 'Braços', value: 7.0 },
];

const WORKOUTS = [
  { n: 1, title: 'Lower body', focus: 'Postura & bottom-turn', open: true, exercises: [
    { name: 'Bottom-turn drill (em terra)', sets: 3, reps: '10 cada lado', video: true, desc: 'Joelhos pra dentro, gira o tronco mantendo o olhar pra fora.' },
    { name: 'Single-leg squat com pausa', sets: 3, reps: '6 cada perna', video: false, desc: 'Estabiliza o joelho e o glúteo médio — base do bottom-turn limpo.' },
  ]},
  { n: 2, title: 'Core', focus: 'Estabilidade no drop' },
  { n: 3, title: 'Mobility', focus: 'Quadril & tornozelo' },
];

// ── Upload row ──
function FileRow({ name, size, progress, error }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-surface-2)', borderRadius: 12, padding: '11px 13px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 9, background: 'var(--mn-62)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconVideo size={18}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12.5, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{size}</span>
        </div>
        {error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--danger)', fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500 }}><IconAlertCircle size={12}/>{error}</div>
        ) : (
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)' }}/></div>
        )}
      </div>
      <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}><IconX size={16}/></div>
    </div>
  );
}

function Dropzone() {
  return (
    <div style={{ borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--border)', background: 'var(--surface)', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(61,91,255,0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconUpload size={24}/></div>
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Arraste ou toque pra escolher</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: '17px' }}>1 vídeo ou até 3 fotos · ≤100MB<br/>vídeo ≤120s</div>
    </div>
  );
}

function UploadScreen({ state = 'idle' }) {
  return (
    <div style={{ ...SCR, display: 'flex', flexDirection: 'column' }}>
      <AppHeader onBack title="Adicionar mídia" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ flex: 1, padding: '6px 20px 104px' }}>
        <Dropzone/>
        {state === 'uploading' && (
          <div style={{ marginTop: 22 }}>
            <Eyebrow>Selecionados</Eyebrow>
            <FileRow name="clip-canal1.mp4" size="12 MB" progress={75}/>
          </div>
        )}
        {state === 'error' && (
          <div style={{ marginTop: 22 }}>
            <Eyebrow>Selecionados</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FileRow name="drop-aereo.mov" size="138 MB" error="Arquivo muito grande (máx 100MB)"/>
              <FileRow name="sequencia.mp4" size="44 MB" error="Vídeo acima de 120s"/>
            </div>
          </div>
        )}
        <div style={{ marginTop: 22 }}>
          <Eyebrow>Na sessão</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <MediaThumb video onDelete/><MediaThumb onDelete/>
          </div>
        </div>
      </div>
      <SubmitBar><Button variant="primary" full size="lg" disabled={state === 'error'}>{state === 'idle' ? 'Enviar' : state === 'error' ? 'Corrija os arquivos' : 'Enviando…'}</Button></SubmitBar>
    </div>
  );
}

// ── AI Review ──
function ReviewScreen({ state = 'success' }) {
  if (state === 'pending') {
    return (<div style={SCR}><AppHeader onBack title="Análise" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ paddingTop: 30 }}><AIState title="Analisando sua sessão…" subtitle="A IA está assistindo seus take-offs. Leva menos de 30s."/></div></div>);
  }
  if (state === 'error') {
    return (<div style={SCR}><AppHeader onBack title="Análise" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ paddingTop: 36 }}><ErrorState title="Não conseguimos analisar agora." subtitle="A IA falhou ao processar a mídia. Tenta de novo?" onRetry/></div></div>);
  }
  if (state === 'nomedia') {
    return (<div style={SCR}><AppHeader onBack title="Análise" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ paddingTop: 36 }}><EmptyState icon={<IconImage size={28}/>} title="Sem mídia pra analisar" subtitle="Mande um vídeo curto e a gente analisa em menos de 30s." cta={<Button variant="primary" leadingIcon={<IconUpload size={16}/>}>Adicionar mídia</Button>}/></div></div>);
  }
  return (
    <div style={SCR}>
      <AppHeader onBack title="Análise" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ padding: '4px 20px 0' }}>
        <OverallBand value={6.7} sub="acima da sua média (6.1)"/>
        <div style={{ marginTop: 22 }}>
          <Eyebrow>Pontuação por aspecto</Eyebrow>
          <Card pad={14}>
            {SCORES.map(s => <ScoreRow key={s.label} label={s.label} value={s.value} best={s.best}/>)}
          </Card>
        </div>
        <div style={{ marginTop: 22 }}>
          <Eyebrow>Análise da IA · gemini-2.0</Eyebrow>
          <Card>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '21px', color: 'var(--color-text-soft)' }}>
              Você escolheu bem as ondas hoje — boa leitura do banco. O take-off ficou consistente nas quatro, mas a postura abre no bottom-turn: os joelhos saem da linha e você perde projeção pra próxima manobra. A onda de 6'42 foi a mais limpa: dropou centrado, comprometeu o rail.
            </p>
          </Card>
        </div>
        <div style={{ marginTop: 22 }}>
          <Eyebrow>3 ajustes pra próxima</Eyebrow>
          <Card pad="4px 16px">
            <TipItem n={1}>Mantenha o olhar para frente no drop, não pro pé da prancha.</TipItem>
            <TipItem n={2}>No bottom-turn, joelhos para dentro — gera projeção pro top.</TipItem>
            <TipItem n={3} last>Centralize mais no take-off; você está saindo levemente atrás.</TipItem>
          </Card>
        </div>
        <div style={{ marginTop: 22 }}>
          <Button variant="primary" full size="lg" leadingIcon={<IconBarbell size={18}/>}>Gerar plano de treino</Button>
        </div>
      </div>
    </div>
  );
}

// ── Training Plan ──
function PlanScreen({ state = 'success' }) {
  if (state === 'pending') {
    return (<div style={SCR}><AppHeader onBack title="Treino" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ paddingTop: 30 }}><AIState title="Montando seu treino…" subtitle="Transformando os ajustes da análise em exercícios. Leva ~20s."/></div></div>);
  }
  if (state === 'error') {
    return (<div style={SCR}><AppHeader onBack title="Treino" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ paddingTop: 36 }}><ErrorState title="Não conseguimos gerar o treino." subtitle="A IA falhou ao montar o plano. Tenta de novo?" onRetry/></div></div>);
  }
  return (
    <div style={{ ...SCR, display: 'flex', flexDirection: 'column' }}>
      <AppHeader onBack title="Treino" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ flex: 1, padding: '4px 20px 104px' }}>
        <Pill tone="action"><IconSparkle size={12}/> Gerado pela IA da sessão</Pill>
        <h1 style={{ margin: '12px 0 4px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 23, color: 'var(--text)', letterSpacing: '-0.025em' }}>Postura &amp; bottom-turn</h1>
        <p style={{ margin: '0 0 18px', fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: '18px' }}>3 treinos · 9 exercícios · ~22 min. Feito 2× por semana, rende em 3 sessões.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {WORKOUTS.map(w => <WorkoutAccordion key={w.n} {...w}/>)}
        </div>
      </div>
      <SubmitBar><Button variant="primary" full size="lg" leadingIcon={<IconCheck size={18}/>}>Comecei o treino</Button></SubmitBar>
    </div>
  );
}

Object.assign(window, { SCORES, WORKOUTS, FileRow, Dropzone, UploadScreen, ReviewScreen, PlanScreen });
