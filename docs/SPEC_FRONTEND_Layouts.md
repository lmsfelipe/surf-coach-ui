# SPEC — SurfRise Frontend Layouts

> **Document 4 of 5** in the frontend spec set.
> **Status:** Draft for review
> **Last updated:** 2026-06-01
> **Reads with:** `DESIGN_Pages_and_Elements.md` (what each screen contains) · `SPEC_FRONTEND_StyleGuide.md` (tokens/components).
> **Use:** paste this + Doc 2 into Claude Design to generate the remaining screen designs; it's also the layout contract for codegen (Doc 5).

Wireframes are ASCII, mobile-first at **~390px** (range 360–430). Spacing references the 4px scale (`space-*`). Content gutter = **20px** (`space-5`). Vertical rhythm between top-level sections = **22–24px**. Dark "Midnight Electric"; one electric CTA per screen.

---

## 0. App Shell Anatomy (authenticated screens)

```
┌─────────────────────────────┐  ← viewport (dark --bg #0B1020)
│ AppHeader   (logo|back  •  avatar) │  14px top / 20px sides
│                             │
│  ⟨ scrollable content ⟩      │  gutter 20px
│   …                         │  bottom padding 96–180px
│                             │    (clear FAB + nav)
│                             │
│        ( ＋ FAB )            │  center, 56px, ~18px above nav
│ ┌─────────────────────────┐ │
│ │ Sessões  Treinos  Perfil│ │  BottomNav 78px, glass blur
│ └─────────────────────────┘ │  2px electric indicator on active
└─────────────────────────────┘
```

- **AppHeader:** left = logo (`SurfRise`, Pacifico, "Rise" electric) on top-level tabs, OR a 36px round back button on sub-screens; right = 36px avatar (initials fallback). Center title only on sub-screens (Archivo 15/700).
- **BottomNav:** 3 tabs + center FAB. FAB is the only action button; tabs switch top-level routes. Hidden on `/auth/*` and `/onboarding`.
- **Desktop ≥`md`:** nav becomes a left side rail (logo top, tabs stacked, "Nova sessão" button); content max-width 1120px centered.
- **Scroll:** content scrolls under the glass nav; sticky submit bars sit above the nav where present.

Legend: `[ Button ]` filled · `( Button )` ghost/outline · `‹ ›` chevrons · `▓▓░░` progress bar · `◻` skeleton block · `·` middle-dot separator.

---

## 1. Auth (public, no nav)

Shared: centered column, max-width 360, vertical center on tall screens. Logo top. One electric primary button. Links in electric.

### 1.1 Login `/auth/login`
```
┌─────────────────────────────┐
│            ◯ SurfRise        │  logo, centered, 48px down
│                             │
│   Entrar                    │  h1 Archivo 28/800
│                             │
│   E-mail                    │  Field + Input
│   [______________________]  │
│   Senha                     │  Field + Input (type=password)
│   [______________________]  │
│                   Esqueci…  │  link, right-aligned, electric
│                             │
│   [        Entrar        ]  │  primary, full, 12px radius
│                             │
│   Não tem conta? Criar conta│  center, electric link
└─────────────────────────────┘
```
States: button → 3-dot pulser while pending · invalid creds → inline alert above button ("E-mail ou senha inválidos") · success → redirect.

### 1.2 Signup `/auth/signup`
Same shell. Fields top→bottom: **Nome (obrigatório)** · E-mail · Senha · Confirmar senha. Primary `[ Criar conta ]`. Footer link "Já tenho conta". Zod errors inline per field (danger text under field). On success → `/onboarding`.

### 1.3 Forgot password `/auth/forgot-password`
Single **E-mail** field + `[ Enviar link ]`. After submit, swap form for a confirmation block: IconCheckCircle + "Enviamos um link para seu e-mail." + ghost "Voltar ao login".

### 1.4 Reset password `/auth/reset-password`
**Nova senha** · **Confirmar** + `[ Salvar nova senha ]`. Invalid/expired link → error state with "Solicitar novo link". Success → redirect to login.

---

## 2. Onboarding `/onboarding` (no nav)

```
┌─────────────────────────────┐
│  ◯                          │  logo small
│  Bem-vindo!                 │  h1 Archivo 28/800
│  Vamos calibrar suas        │  body, text-muted
│  análises.                  │
│                             │
│  ┌── card (surface, lg) ──┐ │
│  │ Nível de surf *        │ │  Select: iniciante/intermediário/
│  │ [ Intermediário    ▾ ] │ │         avançado/pro
│  │ Altura (cm) *          │ │  number input 100–250
│  │ [ 178 ]                │ │
│  │ Peso (kg) *            │ │  number input 30–200
│  │ [ 75 ]                 │ │
│  │ ─ opcionais ─          │ │  eyebrow divider
│  │ Gênero  [ ▾ ]          │ │  Select male/female
│  │ Nascimento [ __/__/__ ]│ │  DatePicker
│  │ Avatar  ( enviar foto )│ │  client-direct → profile-media
│  └────────────────────────┘ │
│                             │
│  [        Concluir        ] │  sticky bottom, primary, full
└─────────────────────────────┘
```
Required: surfLevel + height + weight (guard treats onboarding incomplete until all set). Avatar upload shows progress overlay; on success saved via `PATCH /me`. Submit → `PATCH /me` → `/sessions`.

---

## 3. Sessions (Tab 1)

### 3.1 Session History `/sessions` — home  *(maps to kit SessionsListScreen)*
```
┌─────────────────────────────┐
│ ◯ SurfRise            ( MV ) │  AppHeader (logo + avatar)
│ Bom dia,                    │  h1 Archivo 28/800 (greeting)
│ Felipe.                     │
│ Glass-off no Itacoatiara…   │  body text-muted (optional)
│                             │
│ SUAS SESSÕES · 4   Esta sem.│  Eyebrow + accent link
│                             │
│ ┌── SessionCard ─────────┐  │  surface, radius-lg, shadow-sm
│ │ Canal 1 · Santos/SP 25mai│ │  loc(600/13) · date(muted/11)
│ │  6.7   ∿ 0.9m   ⌧ Pranch.│›│  score 32px Inter Tight + chips
│ └─────────────────────────┘  │
│ ┌── SessionCard ─────────┐  │  …repeat
│ │ Itacoatiara · 7.2 …     │›│
│ └─────────────────────────┘  │
│              ⋮  (scrolls)    │  bottom pad 180px
│           ( ＋ )             │  FAB → /sessions/new
│ [ Sessões  Treinos  Perfil ]│
└─────────────────────────────┘
```
- **Card fields:** location · date · overall score (or "—") · wave size **(m)** · board label (or "—"). Score chip resolves independently (skeleton chip → score / "Sem análise") per Doc 1 §8a.
- **States:** loading → 3–4 skeleton cards (◻ rows) · empty → centered EmptyState: IconWave + "Sua primeira sessão é só um botão de distância." + `[ Registrar primeira sessão ]` · error → ErrorState + ( Tentar de novo ).

### 3.2 New Session `/sessions/new`  *(maps to kit NewSessionScreen)*
```
┌─────────────────────────────┐
│ ‹                           │  back
│ Nova sessão                 │  h1 Archivo 24/800
│ Conta como foi — a IA cuida…│  body muted
│ ┌── card (surface) ───────┐ │
│ │ Qual foi o pico? *      │ │  TextInput (location)
│ │ [____________________]  │ │
│ │ Data *                  │ │  DatePicker (YYYY-MM-DD)
│ │ [ 25/05/26 ]            │ │
│ │ Tamanho da onda *       │ │  Slider, meters, live readout
│ │ Tamanho            0.9 m│ │   0.0–4.0m step .1
│ │ ●━━━━━──────────────    │ │
│ │ Prancha usada           │ │  Select from inventory (optional)
│ │ [ Pranchinha 5'10"   ▾ ]│ │   empty → "Nenhuma prancha"+link
│ │ Como foi a sessão?      │ │  Textarea (notes, ≤1000)
│ │ [____________________]  │ │   hint: "Opcional · usado pela IA"
│ └─────────────────────────┘ │
│ [ Salvar e enviar mídia ]   │  sticky bottom primary, full
└─────────────────────────────┘
```
Validation: location 1–200, date required, waveSize>0 (from slider). On success → `/sessions/$id/upload`. Board select disabled+skeleton while boards load.

### 3.3 Session Detail `/sessions/$sessionId` — Option A hub  *(hero from kit)*
```
┌─────────────────────────────┐
│ ‹            Sessão     ( MV)│
│ ┌── Hero card (gradient) ──┐ │  160° #1A2236→#141B2E→#0B1020
│ │ Canal 1 · Santos/SP      │ │  + radial electric glow TR
│ │ 25 mai 2026 · 06:42      │ │
│ │  6.7   nota geral         │ │  68px Inter Tight, dot=electric
│ │  ∿0.9m  ⌧Pranchinha ⌚1h22 │ │  muted Pills
│ └──────────────────────────┘ │
│ MÍDIA                        │  Eyebrow
│ ┌──┐┌──┐┌──┐  ( + adicionar) │  Media Gallery thumbs 3-up grid
│ │▷ ││  ││  │                 │   video badge ▷; tap → lightbox
│ └──┘└──┘└──┘                 │
│ ANÁLISE                      │  Eyebrow
│ ┌─ summary row ───────────┐ │  if review: "Nota 6.7"  ( Ver análise )
│ │ 6.7 · 6 aspectos  ›     │ │  else if media: [ Analisar com IA ]
│ └─────────────────────────┘ │  else: hint "Adicione mídia…"
│ TREINO                       │  Eyebrow
│ ┌─ summary row ───────────┐ │  if plan: ( Ver treino )
│ │ 3 treinos · postura  ›  │ │  else if review: [ Gerar treino ]
│ └─────────────────────────┘ │
│ ( Excluir sessão )          │  ghost danger, bottom
└─────────────────────────────┘
```
- Review/Plan show **summaries only** → tap navigates to standalone `/review`, `/plan`.
- Empty media → gallery shows a single dashed "Adicionar mídia" tile.
- Delete → AlertDialog: "Excluir sessão? Isso remove mídia e análise. Não dá pra desfazer." → cascade delete → back to list.
- States: skeleton hero + gallery; per-section empty/CTA logic above.

### 3.4 Media Upload `/sessions/$sessionId/upload`
```
┌─────────────────────────────┐
│ ‹       Adicionar mídia      │
│ ┌── Dropzone (dashed) ─────┐ │  IconImage/IconVideo
│ │  Arraste ou toque        │ │  rule line:
│ │  1 vídeo ou até 3 fotos  │ │  "1 vídeo ou até 3 fotos ·
│ │                          │ │   ≤100MB · vídeo ≤120s"
│ └──────────────────────────┘ │
│ SELECIONADOS                 │  Eyebrow (when files chosen)
│ ┌──────────────────────────┐ │  per-file row:
│ │ ▷ clip.mp4  12MB  ▓▓▓░ 75%│ │  thumb + name + size + progress
│ │ 🗑                        │ │  + remove
│ └──────────────────────────┘ │
│ NA SESSÃO                    │  existing media grid (delete each)
│ ┌──┐┌──┐                     │
│ │▷ ││  │ 🗑                  │
│ └──┘└──┘                     │
│ [        Enviar          ]   │  sticky, primary, disabled until valid
└─────────────────────────────┘
```
- Client validation before upload: MIME ∈ accepted, size ≤100MB, video duration ≤120s (probe hidden `<video>`), selection rule 1 video XOR ≤3 images.
- Per-file errors map to pt-BR: `FILE_TOO_LARGE`→"Arquivo muito grande (máx 100MB)", `VIDEO_TOO_LONG`→"Vídeo acima de 120s", `INVALID_MEDIA_TYPE`→"Formato não aceito".
- Success → back to detail with gallery updated. Delete media → confirm.

### 3.5 AI Review `/sessions/$sessionId/review`  *(scores+narrative+tips from kit)*
```
┌─────────────────────────────┐
│ ‹           Análise          │
│ ── pending state ──          │  while POST /reviews (3–15s):
│   • • •  (electric pulser)   │  3-dot pulser, centered
│   Analisando sua sessão…     │  body muted
│ ── success ──                │
│ ┌── overall band ─────────┐ │  big 6.7 Inter Tight + "Nota geral"
│ │  6.7   nota geral        │ │
│ └─────────────────────────┘ │
│ PONTUAÇÃO POR ASPECTO        │  Eyebrow
│ ┌── card ─────────────────┐ │  6× ScoreRow (non-null only)
│ │ Take-off & pop-up   7.5 │ │  label muted + value Inter Tight
│ │ ▓▓▓▓▓▓▓▓░░              │ │  bar white-55% (accent on best)
│ │ Postura & equilíbrio 6.2│ │
│ │ ▓▓▓▓▓▓░░░░              │ │
│ │ Escolha da onda     8.1 │ │  ← accent row (highest)
│ │ Manobras 5.4 · Fluxo 6.8│ │
│ │ Braços 7.0             │ │
│ └─────────────────────────┘ │
│ ANÁLISE DA IA · gemini-2.0   │  Eyebrow
│ ┌─ card ──────────────────┐ │  narrative prose, text-soft 13.5/21
│ │ Você escolheu bem as …  │ │
│ └─────────────────────────┘ │
│ 3 AJUSTES PRA PRÓXIMA        │  Eyebrow
│ ┌─ card ──────────────────┐ │  3× Tip Item: ①②③ electric badge
│ │ ① Mantenha o olhar…     │ │  + text, divider line-soft
│ │ ② No bottom-turn…       │ │
│ │ ③ Centralize no take-off│ │
│ └─────────────────────────┘ │
│ [ Ver treino sugerido ]     │  primary (or ( Ver treino ) if exists)
└─────────────────────────────┘
```
- "best" row = highest score → accent fill + value in electric (kit default; value ramp off).
- Errors: `AI_GENERATION_FAILED`/`AI_PARSE_FAILED` → ErrorState "Não conseguimos analisar agora." + [ Tentar de novo ] · `NO_MEDIA_FOR_SESSION` → prompt + ( Adicionar mídia ) · `REVIEW_ALREADY_EXISTS` → just show existing.

### 3.6 Training Plan `/sessions/$sessionId/plan`  *(maps to kit WorkoutScreen)*
```
┌─────────────────────────────┐
│ ‹            Treino          │
│ ✦ Gerado pela IA da sessão   │  Pill tone=action + IconSparkle
│ Postura & bottom-turn        │  h1 Archivo 24/800 (focus theme)
│ 3 exercícios · ~22 min …     │  body muted
│ ── pending: pulser + copy ── │  POST /training-plans (5–20s)
│ ┌── Workout accordion ─────┐ │  per workout (sequence):
│ │ ▸ 1 · Lower body  ⌄      │ │  title + focusArea, collapse
│ │   ┌─ exercise card ────┐ │ │  expanded:
│ │   │ [▷64] ① Bottom-turn│ │ │  media tile (play/barbell)+num
│ │   │  3 séries · 10 cada│ │ │  sets/reps Pills
│ │   │  descrição…        │ │ │  description muted
│ │   └────────────────────┘ │ │
│ │   ┌─ exercise card ────┐ │ │
│ │   │ [⌧64] ② Pop-up…    │ │ │  (no video → barbell icon)
│ │   └────────────────────┘ │ │
│ │ ▸ 2 · Core  ⌄            │ │  next workout collapsed
│ │ ▸ 3 · Mobility  ⌄        │ │
│ └──────────────────────────┘ │
│ [ Comecei o treino ]        │  primary (local-only ack)
└─────────────────────────────┘
```
- Workouts render in `sequenceNumber` order; exercises in order with sets/reps/description; `videoUrl` → play tile links out.
- Errors: AI fail → ErrorState + retry · `TRAINING_PLAN_ALREADY_EXISTS` → show existing.

---

## 4. Treinos (Tab 2) `/training-plans`
```
┌─────────────────────────────┐
│ ◯ SurfRise            ( MV ) │
│ Treinos                     │  h1
│ SEUS PLANOS · 3              │  Eyebrow
│ ┌── TrainingPlanCard ─────┐ │  surface, radius-lg
│ │ Canal 1 · 25 mai        │ │  source session loc+date
│ │ Postura & bottom-turn   │ │  focus theme
│ │ 3 treinos · 9 exercícios│›│  counts + chevron
│ └─────────────────────────┘ │
│ ┌── TrainingPlanCard ─────┐ │  …
│ └─────────────────────────┘ │
│           ( ＋ )             │  FAB (Nova sessão)
│ [ Sessões  Treinos  Perfil ]│
└─────────────────────────────┘
```
- **Depends on future `GET /api/v1/training-plans`.** Until then: empty placeholder "Nenhum treino gerado ainda — gere um a partir da análise de uma sessão." Card → `/sessions/$id/plan` (or `/training-plans/$planId`).
- States: skeleton cards · empty (above) · error + retry.

---

## 5. Profile (Tab 3)

### 5.1 Profile `/profile`
```
┌─────────────────────────────┐
│ ◯ SurfRise                  │
│ ┌── Profile Header ───────┐ │
│ │   ( avatar 72 )          │ │  image or initials
│ │   Felipe Lima            │ │  h2 Archivo
│ │   ✦ Intermediário        │ │  Pill (surf level)
│ │   178 cm · 75 kg         │ │  stat row muted
│ └─────────────────────────┘ │
│ ┌── menu list ────────────┐ │  rows w/ chevron:
│ │ ⌧ Minhas pranchas      ›│ │  → /boards
│ │ ✎ Editar perfil        ›│ │  → /profile/edit
│ │ ⚙ Configurações        ›│ │  → /settings
│ └─────────────────────────┘ │
│           ( ＋ )             │  FAB
│ [ Sessões  Treinos  Perfil ]│
└─────────────────────────────┘
```
States: skeleton header · error.

### 5.2 Edit Profile `/profile/edit`
Back + "Editar perfil". Card form: Avatar uploader (progress → `profile-media`) · Nome · Nível * · Gênero · Nascimento · Altura (cm) · Peso (kg). Sticky `[ Salvar alterações ]`. Prefill skeleton while loading; zod validation; `PATCH /me` on submit.

### 5.3 Board Inventory `/boards` (from Profile → Minhas pranchas)
```
┌─────────────────────────────┐
│ ‹        Pranchas      ( + ) │  back + add action (top-right)
│ ┌── BoardCard ────────────┐ │
│ │ ⌧ Shortboard            │ │  type Badge
│ │ Pranchinha · 5'10" · 28L│ │  label · size(ft) · volume
│ │              ✎   🗑      │ │  edit / delete
│ └─────────────────────────┘ │
│ ┌── BoardCard ────────────┐ │
│ └─────────────────────────┘ │
│ [ Sessões  Treinos  Perfil ]│  (nav stays; no FAB here? see note)
└─────────────────────────────┘
```
- Board size stays in **feet** (surf convention). Add via top-right "+".
- Empty → "Nenhuma prancha cadastrada" + [ Adicionar prancha ]. Error + retry.
- Note: FAB is global (Nova sessão); the board "+" is a top-bar action, distinct from the FAB.

### 5.4 Add/Edit Board `/boards/new`, `/boards/$boardId/edit`
Back + title. Card form: Tipo * (Select: shortboard/longboard/funboard/bodyboard/other) · Tamanho (pés) * · Volume (litros) · Apelido. Sticky `[ Salvar ]`. Edit adds ( Excluir prancha ) → AlertDialog "Excluir prancha? Sessões que a usam continuam, sem a referência."

### 5.5 Settings `/settings`
Back + "Configurações". Account info row (email). `[ Sair ]` (destructive/ghost) → signOut → `/auth/login`. App version caption at bottom.

---

## 6. Cross-Screen Patterns

| Pattern | Spec |
|---|---|
| **Skeletons** | Match final layout: cards = ◻ block + 2 ◻ lines; hero = big ◻; score panel = 6 ◻ bars. Surface-2 fill, subtle shimmer. |
| **EmptyState** | Centered: icon (electric, 40px) + title (h3) + subtitle (muted) + optional primary CTA. Inviting tone. |
| **ErrorState** | Icon + plain message ("Algo não carregou.") + ( Tentar de novo ) ghost. Blame-the-system tone. |
| **AlertDialog** | Title + body + ( Cancelar ) · [ Confirmar ] (destructive electric→danger). |
| **Toast (sonner)** | Bottom, above nav, surface + shadow-md. Success/info/error. No "!". |
| **Offline banner** | Sticky top strip, warning tone, "Sem conexão." auto-hides on reconnect. |
| **AI pending** | 3-dot electric pulser + status copy. Never a spinner. Disable trigger. |
| **Sticky submit** | Forms: bottom bar, `--bg` + top shadow, single primary full-width button. |
| **Lightbox** | Media thumb tap → full-screen viewer (image/video), swipe between, close ‹. |

---

## 7. Responsive (≥ `md`)

- BottomNav → **left side rail** (240px): logo top · vertical tabs · "Nova sessão" button (replaces FAB).
- Content centered, max-width 1120; lists become 2-col grids (sessions, boards, plans) at ≥`lg`.
- Forms cap at ~560px centered. Hero/cards keep radius-lg.

---

## 8. Open Questions for Review

1. **Greeting header** on `/sessions` (kit shows "Bom dia, Felipe" + a forecast line). Keep the time-of-day greeting? The forecast line has **no API** — drop it, or keep as static/placeholder?
2. **Media lightbox** — full-screen viewer on thumb tap: in scope for MVP, or just open `storageUrl` in a new tab?
3. **"Comecei o treino"** button on the plan screen is a local-only acknowledgement (no API to persist). Keep it as a non-persistent affordance, or remove for MVP?
4. **Boards "+"** as a top-bar action while the global FAB stays "Nova sessão" — OK, or should board-add be a button at the bottom of the list instead?
```