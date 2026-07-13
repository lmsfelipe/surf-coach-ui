// ─────────────────────────────────────────────────────────────
// SurfRise — Treinos · Profile · Boards · Settings
// ─────────────────────────────────────────────────────────────

const PLANS = [
  { source: 'Canal 1 · Santos/SP · 25 mai', focus: 'Postura & bottom-turn', workouts: 3, exercises: 9 },
  { source: 'Itacoatiara · Niterói · 21 mai', focus: 'Take-off & timing', workouts: 2, exercises: 6 },
  { source: 'Maresias · S. Sebastião · 18 mai', focus: 'Leitura de ondas', workouts: 3, exercises: 8 },
];

const BOARDS = [
  { type: 'Shortboard', label: 'Pranchinha', size: "5'10\"", volume: 28 },
  { type: 'Funboard', label: 'Coringa', size: "7'0\"", volume: 44 },
  { type: 'Longboard', label: 'Tanque', size: "9'2\"", volume: 72 },
];

// ── Treinos list ──
function TreinosScreen({ state = 'default' }) {
  return (
    <div style={SCR}>
      <AppHeader/>
      <div style={{ padding: '2px 20px 14px' }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--text)', letterSpacing: '-0.025em' }}>Treinos</h1>
      </div>
      {state === 'default' && (
        <div style={{ padding: '0 20px' }}>
          <Eyebrow>Seus planos · 3</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{PLANS.map((p, i) => <PlanCard key={i} p={p}/>)}</div>
        </div>
      )}
      {state === 'loading' && (
        <div style={{ padding: '0 20px' }}>
          <Eyebrow>Seus planos</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[0,1,2].map(i => <SkelCard key={i} h={92}/>)}</div>
        </div>
      )}
      {state === 'empty' && (
        <div style={{ paddingTop: 30 }}>
          <EmptyState icon={<IconBarbell size={28}/>} title="Nenhum treino ainda"
            subtitle="Gere um treino a partir da análise de uma sessão e ele aparece aqui."
            cta={<Button variant="outline" size="sm">Ver minhas sessões</Button>}/>
        </div>
      )}
      {state === 'error' && <div style={{ paddingTop: 36 }}><ErrorState onRetry/></div>}
      <FAB/>
      <TabBar active="treinos"/>
    </div>
  );
}

// ── Profile ──
function ProfileScreen({ state = 'default' }) {
  return (
    <div style={SCR}>
      <AppHeader noAvatar action={<div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--color-surface-2)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconSettings size={18}/></div>}/>
      {state === 'loading' ? (
        <div style={{ padding: '10px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Skel w={72} h={72} r={999} mb={14}/>
          <Skel w={140} h={16} mb={10}/>
          <Skel w={100} h={12} mb={28}/>
          <div style={{ width: '100%' }}><Skel h={150} r={18}/></div>
        </div>
      ) : (
        <div style={{ padding: '6px 20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 26 }}>
            <Avatar initials="FL" size={76}/>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 21, color: 'var(--text)', marginTop: 14, letterSpacing: '-0.02em' }}>Felipe Lima</div>
            <div style={{ marginTop: 8 }}><Pill tone="accent"><IconSparkle size={12}/> Intermediário</Pill></div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-muted)' }}>
              <span><b style={{ color: 'var(--color-text-soft)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>178</b> cm</span>
              <span>·</span>
              <span><b style={{ color: 'var(--color-text-soft)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>75</b> kg</span>
            </div>
          </div>
          <Card pad="6px 0">
            <MenuRow icon={<IconBoard size={19}/>} label="Minhas pranchas"/>
            <MenuRow icon={<IconPencil size={18}/>} label="Editar perfil"/>
            <MenuRow icon={<IconSettings size={18}/>} label="Configurações" last/>
          </Card>
        </div>
      )}
      <FAB/>
      <TabBar active="profile"/>
    </div>
  );
}

// ── Edit profile ──
function EditProfileScreen() {
  return (
    <div style={{ ...SCR, display: 'flex', flexDirection: 'column' }}>
      <AppHeader onBack title="Editar perfil" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ flex: 1, padding: '6px 20px 104px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <Avatar initials="FL" size={64}/>
          <Button variant="secondary" size="sm" leadingIcon={<IconUpload size={15}/>}>Trocar foto</Button>
        </div>
        <Card pad={18}>
          <Field label="Nome"><TextInput value="Felipe Lima"/></Field>
          <Field label="Nível de surf"><Select value="Intermediário" options={['Iniciante', 'Intermediário', 'Avançado', 'Pro']}/></Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Altura (cm)"><NumberInput value="178" suffix="cm"/></Field></div>
            <div style={{ flex: 1 }}><Field label="Peso (kg)"><NumberInput value="75" suffix="kg"/></Field></div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Gênero" optional><Select value="Masculino" options={['Masculino', 'Feminino']}/></Field></div>
            <div style={{ flex: 1 }}><Field label="Nascimento" optional><TextInput value="04/11/1994"/></Field></div>
          </div>
        </Card>
      </div>
      <SubmitBar><Button variant="primary" full size="lg">Salvar alterações</Button></SubmitBar>
    </div>
  );
}

// ── Boards inventory ──
function BoardsScreen({ state = 'default' }) {
  const addAction = (
    <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(61,91,255,0.4)' }}><IconPlus size={20}/></div>
  );
  return (
    <div style={SCR}>
      <AppHeader onBack title="Pranchas" action={addAction}/>
      {state === 'default' ? (
        <div style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {BOARDS.map((b, i) => <BoardCard key={i} b={b}/>)}
        </div>
      ) : (
        <div style={{ paddingTop: 30 }}>
          <EmptyState icon={<IconBoard size={28}/>} title="Nenhuma prancha cadastrada"
            subtitle="Cadastre suas pranchas pra ligar cada sessão ao equipamento certo."
            cta={<Button variant="primary" leadingIcon={<IconPlus size={16}/>}>Adicionar prancha</Button>}/>
        </div>
      )}
      <TabBar active="profile"/>
    </div>
  );
}

// ── Board form (add / edit) ──
function BoardFormScreen({ mode = 'new' }) {
  const edit = mode === 'edit';
  return (
    <div style={{ ...SCR, display: 'flex', flexDirection: 'column' }}>
      <AppHeader onBack title={edit ? 'Editar prancha' : 'Nova prancha'} noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ flex: 1, padding: '6px 20px 104px' }}>
        <Card pad={18}>
          <Field label="Tipo"><Select value={edit ? 'Shortboard' : ''} placeholder="Selecione o tipo" options={['Shortboard', 'Longboard', 'Funboard', 'Bodyboard', 'Outra']}/></Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Tamanho (pés)"><TextInput value={edit ? "5'10\"" : ''} placeholder="5'10&quot;" icon={<IconRuler size={16}/>}/></Field></div>
            <div style={{ flex: 1 }}><Field label="Volume (L)" optional><NumberInput value={edit ? '28' : ''} suffix="L"/></Field></div>
          </div>
          <Field label="Apelido" optional><TextInput value={edit ? 'Pranchinha' : ''} placeholder="Ex.: Pranchinha"/></Field>
        </Card>
        {edit && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <Button variant="danger" size="sm" leadingIcon={<IconTrash size={15}/>}>Excluir prancha</Button>
          </div>
        )}
      </div>
      <SubmitBar><Button variant="primary" full size="lg">Salvar</Button></SubmitBar>
    </div>
  );
}

// ── Settings ──
function SettingsScreen() {
  return (
    <div style={{ ...SCR, display: 'flex', flexDirection: 'column' }}>
      <AppHeader onBack title="Configurações" noAvatar action={<div style={{ width: 36 }}/>}/>
      <div style={{ flex: 1, padding: '6px 20px 0' }}>
        <Eyebrow>Conta</Eyebrow>
        <Card pad="4px 16px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--color-line-soft)' }}>
            <span style={{ color: 'var(--accent)', display: 'flex' }}><IconMail size={18}/></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>E-mail</div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--text)', marginTop: 2 }}>felipe@surf.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex' }}><IconLock size={18}/></span>
            <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>Alterar senha</div>
            <div style={{ color: 'var(--text-muted)' }}><IconChevronRight size={18}/></div>
          </div>
        </Card>
        <div style={{ marginTop: 20 }}>
          <Button variant="danger" full leadingIcon={<IconLogout size={17}/>}>Sair</Button>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '0 0 26px', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-faint)' }}>SurfRise · versão 1.0.0</div>
    </div>
  );
}

Object.assign(window, {
  PLANS, BOARDS, TreinosScreen, ProfileScreen, EditProfileScreen,
  BoardsScreen, BoardFormScreen, SettingsScreen,
});
