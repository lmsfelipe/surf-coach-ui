// ─────────────────────────────────────────────────────────────
// SurfRise — Page Layouts canvas
// Every screen as a phone-frame artboard, grouped by section.
// ─────────────────────────────────────────────────────────────

// One phone artboard. Returns a DCArtboard *element* (not a component) so
// DCSection's `type === DCArtboard` walk recognizes it. `h` = phone height.
const board = (id, label, h, child) => (
  <DCArtboard id={id} label={label} width={390} height={h}
    style={{ borderRadius: 40, background: 'var(--bg)', border: '1px solid #20283f', boxShadow: '0 10px 40px rgba(0,0,0,0.28)' }}>
    <PhoneFrame>{child}</PhoneFrame>
  </DCArtboard>
);

function App() {
  return (
    <DesignCanvas>
      <DCSection id="auth" title="Autenticação" subtitle="Públicas · sem navegação · um botão elétrico por tela">
        {board('login', 'Login', 720, <LoginScreen/>)}
        {board('login-err', 'Login · erro', 760, <LoginScreen state="error"/>)}
        {board('login-pend', 'Login · enviando', 720, <LoginScreen state="pending"/>)}
        {board('signup', 'Criar conta', 830, <SignupScreen/>)}
        {board('signup-err', 'Criar conta · validação', 830, <SignupScreen state="error"/>)}
        {board('forgot', 'Esqueci a senha', 620, <ForgotScreen/>)}
        {board('forgot-sent', 'Esqueci · enviado', 620, <ForgotScreen state="sent"/>)}
        {board('reset', 'Nova senha', 680, <ResetScreen/>)}
        {board('reset-invalid', 'Nova senha · link expirado', 620, <ResetScreen state="invalid"/>)}
      </DCSection>

      <DCSection id="onboarding" title="Onboarding" subtitle="Primeira sessão · nível + altura + peso obrigatórios">
        {board('onboarding', 'Bem-vindo', 900, <OnboardingScreen/>)}
      </DCSection>

      <DCSection id="sessoes" title="Sessões — Tab 1" subtitle="Histórico (home) + nova sessão · todos os estados">
        {board('sessions', 'Histórico', 810, <SessionsScreen/>)}
        {board('sessions-load', 'Histórico · carregando', 760, <SessionsScreen state="loading"/>)}
        {board('sessions-empty', 'Histórico · vazio', 680, <SessionsScreen state="empty"/>)}
        {board('sessions-err', 'Histórico · erro', 640, <SessionsScreen state="error"/>)}
        {board('new-session', 'Nova sessão', 820, <NewSessionScreen/>)}
      </DCSection>

      <DCSection id="detalhe" title="Detalhe da sessão" subtitle="Option A — hub compacto · 2 variações + estados">
        {board('detail-a', 'Variação A · empilhada', 900, <DetailScreenA/>)}
        {board('detail-b', 'Variação B · painéis', 790, <DetailScreenB/>)}
        {board('detail-load', 'Detalhe · carregando', 800, <DetailLoading/>)}
        {board('detail-empty', 'Detalhe · sessão nova', 740, <DetailEmpty/>)}
        {board('detail-del', 'Detalhe · excluir', 620, <DetailDelete/>)}
      </DCSection>

      <DCSection id="midia-ia" title="Mídia & Análise IA" subtitle="Upload · review (6 scores + narrativa + dicas) · treino">
        {board('upload-idle', 'Upload · vazio', 640, <UploadScreen state="idle"/>)}
        {board('upload-up', 'Upload · enviando', 760, <UploadScreen state="uploading"/>)}
        {board('upload-err', 'Upload · erro por arquivo', 820, <UploadScreen state="error"/>)}
        {board('review-pend', 'Análise · processando IA', 540, <ReviewScreen state="pending"/>)}
        {board('review-ok', 'Análise · resultado', 1380, <ReviewScreen/>)}
        {board('review-err', 'Análise · falhou', 580, <ReviewScreen state="error"/>)}
        {board('review-nomedia', 'Análise · sem mídia', 580, <ReviewScreen state="nomedia"/>)}
        {board('plan-pend', 'Treino · gerando IA', 540, <PlanScreen state="pending"/>)}
        {board('plan-ok', 'Treino · plano', 900, <PlanScreen/>)}
        {board('plan-err', 'Treino · falhou', 580, <PlanScreen state="error"/>)}
      </DCSection>

      <DCSection id="treinos" title="Treinos — Tab 2" subtitle="Lista de planos · depende de GET /training-plans">
        {board('treinos', 'Planos', 740, <TreinosScreen/>)}
        {board('treinos-load', 'Planos · carregando', 740, <TreinosScreen state="loading"/>)}
        {board('treinos-empty', 'Planos · vazio', 600, <TreinosScreen state="empty"/>)}
        {board('treinos-err', 'Planos · erro', 600, <TreinosScreen state="error"/>)}
      </DCSection>

      <DCSection id="perfil" title="Perfil & Pranchas — Tab 3" subtitle="Perfil · editar · inventário de pranchas · configurações">
        {board('profile', 'Perfil', 740, <ProfileScreen/>)}
        {board('profile-load', 'Perfil · carregando', 700, <ProfileScreen state="loading"/>)}
        {board('edit-profile', 'Editar perfil', 880, <EditProfileScreen/>)}
        {board('boards', 'Pranchas', 660, <BoardsScreen/>)}
        {board('boards-empty', 'Pranchas · vazio', 620, <BoardsScreen state="empty"/>)}
        {board('board-new', 'Nova prancha', 740, <BoardFormScreen mode="new"/>)}
        {board('board-edit', 'Editar prancha', 790, <BoardFormScreen mode="edit"/>)}
        {board('settings', 'Configurações', 600, <SettingsScreen/>)}
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
