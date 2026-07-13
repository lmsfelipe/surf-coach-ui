// ─────────────────────────────────────────────────────────────
// SurfRise — Onboarding + Sessions (list, new)
// ─────────────────────────────────────────────────────────────
const SESSIONS = [
  { id: 's1', location: 'Canal 1 · Santos/SP', date: '25 mai', waveSize: '0.9', boardLabel: 'Pranchinha', score: 6.7 },
  { id: 's2', location: 'Itacoatiara · Niterói', date: '21 mai', waveSize: '1.4', boardLabel: 'Funboard', score: 7.2 },
  { id: 's3', location: 'Maresias · S. Sebastião', date: '18 mai', waveSize: '1.1', boardLabel: 'Pranchinha', score: 5.8 },
  { id: 's4', location: 'Praia do Forte · Cabo Frio', date: '12 mai', waveSize: '0.7', boardLabel: 'Longboard', score: null },
];

// ── Onboarding ──
function OnboardingScreen() {
  return (
    <div style={{ ...SCR, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 24px 0' }}>
        <img src="assets/logo-surfrise-mark.svg" width="30" height="30" alt=""/>
        <h1 style={{ margin: '14px 0 4px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, color: 'var(--text)', letterSpacing: '-0.025em' }}>Bem-vindo!</h1>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '20px', color: 'var(--text-muted)' }}>Vamos calibrar suas análises. Leva 30 segundos.</p>
      </div>
      <div style={{ flex: 1, padding: '18px 20px 104px' }}>
        <Card pad={18}>
          <Field label="Nível de surf"><Select value="Intermediário" options={['Iniciante', 'Intermediário', 'Avançado', 'Pro']}/></Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Altura (cm)"><NumberInput value="178" suffix="cm"/></Field></div>
            <div style={{ flex: 1 }}><Field label="Peso (kg)"><NumberInput value="75" suffix="kg"/></Field></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-line-soft)' }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Opcionais</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-line-soft)' }}/>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Gênero" optional><Select value="" placeholder="Selecione" options={['Masculino', 'Feminino']}/></Field></div>
            <div style={{ flex: 1 }}><Field label="Nascimento" optional><TextInput placeholder="DD/MM/AAAA"/></Field></div>
          </div>
          <Field label="Foto de perfil" optional><Button variant="secondary" size="sm" leadingIcon={<IconUpload size={15}/>}>Enviar foto</Button></Field>
        </Card>
      </div>
      <SubmitBar><Button variant="primary" full size="lg">Concluir</Button></SubmitBar>
    </div>
  );
}

// ── Sessions History ──
function SessionsScreen({ state = 'default', activeTab = 'sessions' }) {
  return (
    <div style={SCR}>
      <AppHeader/>
      <div style={{ padding: '2px 20px 12px' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, lineHeight: '32px', color: 'var(--text)', letterSpacing: '-0.025em' }}>Bom dia,<br/>Felipe.</h1>
      </div>
      {state !== 'empty' && state !== 'error' && (
        <div style={{ padding: '4px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Eyebrow style={{ marginBottom: 0 }}>Suas sessões · 4</Eyebrow>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Esta semana</span>
        </div>
      )}
      <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state === 'default' && SESSIONS.map(s => <SessionCard key={s.id} s={s}/>)}
        {state === 'loading' && [0,1,2,3].map(i => <SkelCard key={i}/>)}
      </div>
      {state === 'empty' && (
        <div style={{ paddingTop: 40 }}>
          <EmptyState icon={<IconWave size={30}/>} title="Nenhuma sessão ainda"
            subtitle="Sua primeira sessão é só um botão de distância."
            cta={<Button variant="primary" leadingIcon={<IconPlus size={17}/>}>Registrar primeira sessão</Button>}/>
        </div>
      )}
      {state === 'error' && <div style={{ paddingTop: 40 }}><ErrorState onRetry/></div>}
      <FAB/>
      <TabBar active={activeTab}/>
    </div>
  );
}

// ── New session ──
function NewSessionScreen() {
  return (
    <div style={{ ...SCR, display: 'flex', flexDirection: 'column' }}>
      <AppHeader onBack noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ padding: '0 20px' }}>
        <h1 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, color: 'var(--text)', letterSpacing: '-0.025em' }}>Nova sessão</h1>
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-muted)' }}>Conta como foi — a IA cuida do resto.</p>
      </div>
      <div style={{ flex: 1, padding: '16px 20px 104px' }}>
        <Card pad={18}>
          <Field label="Qual foi o pico?"><TextInput value="Canal 1 — Santos/SP" icon={<IconPin size={16}/>}/></Field>
          <Field label="Data"><TextInput value="25/05/2026" icon={<IconCalendar size={16}/>}/></Field>
          <Field label="Tamanho da onda"><Slider value={9}/></Field>
          <Field label="Prancha usada" optional><Select value="Pranchinha 5'10&quot;" options={["Pranchinha 5'10\"", "Funboard 7'0\"", "Longboard 9'2\""]}/></Field>
          <Field label="Como foi a sessão?" optional hint="Usado pela IA para contextualizar a análise.">
            <Textarea placeholder="Vento de leste, ondas inconstantes mas com paredes bonitas…"/>
          </Field>
        </Card>
      </div>
      <SubmitBar><Button variant="primary" full size="lg">Salvar e enviar mídia</Button></SubmitBar>
    </div>
  );
}

Object.assign(window, { SESSIONS, OnboardingScreen, SessionsScreen, NewSessionScreen });
