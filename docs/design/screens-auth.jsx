// ─────────────────────────────────────────────────────────────
// SurfRise — Auth screens
// ─────────────────────────────────────────────────────────────
const SCR = { height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' };

function AuthShell({ children, foot }) {
  return (
    <div style={{ ...SCR, display: 'flex', flexDirection: 'column', padding: '0 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, marginBottom: 30 }}>
        <a href="#" onClick={e => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <img src="assets/logo-surfrise-mark.svg" width="34" height="34" alt=""/>
          <span style={{ fontFamily: "'Pacifico', cursive", fontSize: 28, color: 'var(--text)', lineHeight: 1 }}>Surf<span style={{ color: 'var(--accent)' }}>Rise</span></span>
        </a>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
      {foot && <div style={{ textAlign: 'center', padding: '20px 0 30px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>{foot}</div>}
    </div>
  );
}

function H1({ children, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, color: 'var(--text)', letterSpacing: '-0.025em' }}>{children}</h1>
      {sub && <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '20px', color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function LoginScreen({ state = 'default' }) {
  return (
    <AuthShell foot={<>Não tem conta? <a href="#" onClick={e=>e.preventDefault()} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Criar conta</a></>}>
      <H1>Entrar</H1>
      {state === 'error' && <div style={{ marginBottom: 16 }}><Alert>E-mail ou senha inválidos.</Alert></div>}
      <Field label="E-mail"><TextInput value="felipe@surf.com" icon={<IconMail size={17}/>}/></Field>
      <Field label="Senha"><TextInput type="password" value="••••••••" icon={<IconLock size={17}/>}/></Field>
      <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 20 }}>
        <a href="#" onClick={e=>e.preventDefault()} style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Esqueci minha senha</a>
      </div>
      <Button variant="primary" full size="lg" disabled={state === 'pending'}>
        {state === 'pending' ? <DotPulser/> : 'Entrar'}
      </Button>
    </AuthShell>
  );
}

function SignupScreen({ state = 'default' }) {
  const err = state === 'error';
  return (
    <AuthShell foot={<>Já tenho conta · <a href="#" onClick={e=>e.preventDefault()} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Entrar</a></>}>
      <H1>Criar conta</H1>
      <Field label="Nome" error={err ? 'Informe seu nome.' : null}><TextInput value={err ? '' : 'Felipe Lima'} placeholder="Seu nome" invalid={err}/></Field>
      <Field label="E-mail" error={err ? 'E-mail já cadastrado.' : null}><TextInput value="felipe@surf.com" icon={<IconMail size={17}/>} invalid={err}/></Field>
      <Field label="Senha"><TextInput type="password" value="••••••••" icon={<IconLock size={17}/>}/></Field>
      <Field label="Confirmar senha"><TextInput type="password" value="••••••••" icon={<IconLock size={17}/>}/></Field>
      <div style={{ marginTop: 6 }}><Button variant="primary" full size="lg">Criar conta</Button></div>
    </AuthShell>
  );
}

function ForgotScreen({ state = 'form' }) {
  if (state === 'sent') {
    return (
      <AuthShell foot={null}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(0,199,129,0.12)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><IconCheckCircle size={30}/></div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>Confira seu e-mail</div>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '20px', color: 'var(--text-muted)', maxWidth: 250 }}>Enviamos um link para <b style={{ color: 'var(--color-text-soft)' }}>felipe@surf.com</b>. Abra para criar uma nova senha.</p>
          <div style={{ marginTop: 24, width: '100%' }}><Button variant="outline" full>Voltar ao login</Button></div>
        </div>
      </AuthShell>
    );
  }
  return (
    <AuthShell foot={<a href="#" onClick={e=>e.preventDefault()} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Voltar ao login</a>}>
      <H1 sub="Manda seu e-mail e enviamos um link pra redefinir a senha.">Esqueci a senha</H1>
      <Field label="E-mail"><TextInput value="felipe@surf.com" icon={<IconMail size={17}/>}/></Field>
      <div style={{ marginTop: 6 }}><Button variant="primary" full size="lg">Enviar link</Button></div>
    </AuthShell>
  );
}

function ResetScreen({ state = 'form' }) {
  if (state === 'invalid') {
    return (
      <AuthShell foot={null}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(255,77,109,0.12)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}><IconAlert size={28}/></div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>Link expirado</div>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: '20px', color: 'var(--text-muted)', maxWidth: 250 }}>Esse link de redefinição não vale mais. Peça um novo pra continuar.</p>
          <div style={{ marginTop: 24, width: '100%' }}><Button variant="primary" full>Solicitar novo link</Button></div>
        </div>
      </AuthShell>
    );
  }
  return (
    <AuthShell foot={null}>
      <H1 sub="Escolha uma senha nova pra sua conta.">Nova senha</H1>
      <Field label="Nova senha"><TextInput type="password" value="••••••••" icon={<IconLock size={17}/>}/></Field>
      <Field label="Confirmar senha"><TextInput type="password" value="••••••••" icon={<IconLock size={17}/>}/></Field>
      <div style={{ marginTop: 6 }}><Button variant="primary" full size="lg">Salvar nova senha</Button></div>
    </AuthShell>
  );
}

Object.assign(window, { SCR, AuthShell, H1, LoginScreen, SignupScreen, ForgotScreen, ResetScreen });
