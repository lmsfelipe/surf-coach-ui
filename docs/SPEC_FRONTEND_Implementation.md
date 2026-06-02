# SPEC — SurfRise Frontend Implementation (Layout Port + API Services)

> **Document 5 of 5** in the frontend spec set.
> **Status:** Draft for review
> **Last updated:** 2026-06-02
> **Reads with:** `SPEC_FRONTEND_Overview.md` (architecture/API patterns) · `SPEC_FRONTEND_Layouts.md` (wireframes) · `DESIGN_Pages_and_Elements.md` (per-screen elements/states) · `SPEC_FRONTEND_StyleGuide.md` (tokens/components).
> **Inputs consumed:** the **SurfRise Webapp** design export (`design/*.jsx`, `colors_and_type.css`, `assets/*.svg`) and the **API integration guide** (`FRONTEND_INTEGRATION.md`).
> **Targets:** the scaffolded repo at `surf-coach-ui/` (Vite + React + TS strict, TanStack Router/Query, Tailwind v4, shadcn, Supabase, Zustand, Vitest/MSW).

This is the **codegen/implementation contract**: it turns the static design export into the running app and specifies the API-services (hooks) layer on top of the already-scaffolded endpoint modules. It does **not** restate tokens (StyleGuide) or wireframes (Layouts) — it says *how to build them here*.

---

## 0. What already exists (the scaffold)

The foundation is built and verified (`tsc` clean, Vitest green, `vite build` ok). This spec layers on top of it. Relevant existing surfaces:

```
src/
  config/{env,constants}.ts        # env (fail-fast), MIME/limits/pt-BR option lists, score labels, unit bounds
  lib/
    supabase.ts                    # client singleton
    queryClient.ts                 # QueryClient (retry policy: no retry <500)
    queryKeys.ts                   # qk factory
    api/
      client.ts                    # fetch wrapper: Bearer, 401→refresh→retry, envelope→ApiError, 204→void, FormData
      errors.ts                    # ApiError, NetworkError, ERROR_MESSAGES_PT_BR, toUserMessage, fieldErrors
      endpoints/{profile,surfboards,sessions,media,reviews,trainingPlans}.ts
  stores/authStore.ts              # zustand: session/token, initAuth(), getAccessToken()
  schemas/{auth,profile,surfboard,session}.ts   # zod (meters for waveSize)
  types/api.ts                     # API models + request payloads
  utils/units.ts                   # m↔ft (×0.3048), formatWaveSize
  components/ui/{button,skeleton}.tsx           # shadcn base (more added via MCP)
  routes/{__root,index}.tsx        # root Outlet + placeholder (placeholder gets replaced)
  test/{setupTests.ts,mocks/*}     # Vitest + MSW
  hooks/{queries,mutations}/       # EMPTY — this spec fills them
  components/{layout,forms,feedback,skeletons}/ # EMPTY — this spec fills them
```

**Rule:** never edit `src/styles/colors_and_type.css` (verbatim export). All theming flows through `src/index.css` bridge + `@theme`.

---

## 1. Design Export → Repo Mapping

The export (`design/*.jsx`) is a **CDN-React + Babel canvas**: inline-style components, static props, a manual screen switcher (`canvas-app.jsx`). We **port intent, not code** — translating inline styles to Tailwind utilities bound to the §2 token bridge, typed props bound to `types/api.ts`, and the screen switcher to TanStack Router routes + Query hooks.

### 1.1 Source file roles

| Export file | Role | Becomes |
|---|---|---|
| `colors_and_type.css` | tokens (already copied) | `src/styles/colors_and_type.css` (do not touch) |
| `icons.jsx` | ~38 inline-SVG icons incl. brand glyphs | `src/components/icons/` — see §1.4 |
| `components-base.jsx` | `AppHeader, Button, Field, TextInput, NumberInput, Textarea, Select, Slider, Pill, Eyebrow, Alert, Avatar, DotPulser` (+ `PhoneFrame/StatusBar` = canvas chrome, **drop**) | `components/ui/*` (shadcn) + `components/layout/*` + `components/forms/*` |
| `components-rich.jsx` | `TabBar, FAB, SubmitBar, SessionCard, ScoreRow, OverallBand, TipItem, Card, SummaryRow, EmptyState, ErrorState, AIState, Skel/SkelCard, MediaThumb, BoardCard, PlanCard, MenuRow, WorkoutAccordion, AlertDialog, Toast, OfflineBanner` | `components/layout/*`, `components/feedback/*`, `components/skeletons/*` |
| `screens-auth.jsx` | Login/Signup/Forgot/Reset (+ `AuthShell`) | `routes/_auth/*` |
| `screens-sessions.jsx` | Sessions list, New session, Onboarding | `routes/_app/sessions/*`, `routes/_app/onboarding.tsx` |
| `screens-detail.jsx` | Detail hub (A), Hero, loading/empty/delete | `routes/_app/sessions/$sessionId/index.tsx` |
| `screens-ai.jsx` | Upload, Review, Plan, Dropzone | `routes/_app/sessions/$sessionId/{upload,review,plan}.tsx` |
| `screens-profile.jsx` | Profile, Edit, Boards, Board form, Settings, Treinos | `routes/_app/{profile,boards,settings,training-plans}/*` |
| `canvas-app.jsx`, `design-canvas.jsx` | canvas harness / screen switcher | **drop** — replaced by the router |
| `assets/logo-surfrise*.svg` | wordmark/mark | `src/assets/` (use `logo-surfrise-mark.svg` in `AppHeader`) |

### 1.2 Porting rules (apply to every component)

1. **Inline styles → Tailwind utilities** using the bridge. Map literal token vars to classes:
   - `var(--surface)` → `bg-card`; `var(--color-surface-2)` → `bg-secondary`; `var(--bg)` → `bg-background`.
   - `var(--accent)`/electric → `bg-primary` / `text-primary` (one accent per screen).
   - `var(--text)` → `text-foreground`; `--text-soft` → `text-foreground/?` or a `text-soft` util; `--text-muted` → `text-muted-foreground`; `--text-faint` → `text-muted-foreground/70`.
   - `--color-line` → `border-border`; `--color-line-soft` → `border-white/[0.06]`.
   - Radii: card/sheet `rounded-[--radius-lg]` (18px signature), buttons/tiles `rounded-md` (12), inputs/chips `rounded-sm`/`rounded-[10px]`, pills `rounded-full`.
   - Shadows: cards `shadow-sm`, menus/toast/hero `shadow-md`, modals `shadow-lg` (the bridge maps these to the export's dark shadows).
   - Fonts: numerics/scores → `font-display tabular-nums tracking-[-0.03em]` (`.t-numeric`); headings → `font-heading`; body → `font-body`. Reuse the `.t-*` classes from `colors_and_type.css` for type ramps where convenient.
2. **Static props → typed props** bound to `src/types/api.ts`. e.g. `SessionCard({ s })` becomes `SessionCard({ session, boardLabel, score })` (see §3 prop contracts).
3. **Units at the edge:** the export prints `{s.waveSize}m` directly. In the real app, props carry **meters already converted** via `utils/units.feetToMetersDisplay`; cards/sliders never see feet except the board-size field (which stays feet).
4. **Brand glyphs stay inline SVG** (`IconWave`, `IconBoard`); everything else uses `lucide-react` (StyleGuide §10 mapping). Drop the canvas-only `StatusBar`, `PhoneFrame`, `Scroll`.
5. **Accessibility upgrades the canvas lacked:** real `<button>`/`<a>` semantics, focus-visible rings (`ring-ring`), `aria-*` on icon-only buttons, `<label htmlFor>` in fields, dialog focus trap (use shadcn `alert-dialog`).
6. **Controlled inputs:** the export uses `defaultValue` (uncontrolled). Real forms use **react-hook-form** controlled fields (§5).

### 1.3 shadcn components to add (via Shadcn MCP)

Add these and theme via the §2 bridge (no per-component overrides). Then wrap/restyle to match the export where the export diverges (radii 18 on cards, electric primary, etc.).

`button` (done) · `skeleton` (done) · `input` · `textarea` · `label` · `form` · `select` · `slider` · `badge` · `avatar` · `alert-dialog` · `sonner` (toast) · `tabs` (only if needed) · `dialog` (lightbox, if §9 Q2 = in-scope).

> **MCP note:** no Shadcn MCP server was connected during scaffolding. Connect it before this phase; `components.json` + `@/lib/utils.cn` are already configured so `shadcn add <c>` drops themed files into `components/ui/`.

### 1.4 Icons

- Port `icons.jsx` brand glyphs **`IconWave`** and **`IconBoard`** verbatim into `src/components/icons/IconWave.tsx` / `IconBoard.tsx` (typed `({ size=24, className })`, `stroke=currentColor`).
- All other kit icons → `lucide-react` per StyleGuide §10 (`IconHome→Home`, `IconBarbell→Dumbbell`, `IconUser→User`, `IconPlus→Plus`, `IconChevron*`, `IconPin→MapPin`, `IconCalendar→Calendar`, `IconImage→Image`, `IconVideo→Video`, `IconPlay→Play`, `IconSparkle→Sparkles`, `IconCheckCircle→CheckCircle2`, `IconAlert→TriangleAlert`, `IconAlertCircle→CircleAlert`, `IconCloud→CloudOff`, `IconTrash→Trash2`, `IconPencil→Pencil`, `IconSettings→Settings`, `IconLogout→LogOut`, `IconRuler→Ruler`, `IconWeight→Weight`, `IconUpload→Upload`, `IconLock→Lock`, `IconMail→Mail`, `IconEye→Eye`, `IconArrowRight→ArrowRight`).
- **No emoji.** Color = `currentColor`; electric only for the single accent action.

---

## 2. Component Port Plan (target inventory)

Build in dependency order; each ships with the tests noted in §10.

### 2.1 `components/forms/` (RHF field wrappers)
Wrap shadcn `form`/`field` so screens stay declarative.

| Component | Wraps | Contract |
|---|---|---|
| `FormField` | `Field` (export) + RHF `Controller` | `{ name, label, hint?, optional?, children:(field)=>ReactNode }`; renders danger error text from `fieldState.error.message`. |
| `TextField` | `input` | `{ name, label, type?, icon?, placeholder?, ... }`. |
| `TextareaField` | `textarea` | `{ name, label, rows?, maxLength?, hint? }`. |
| `SelectField` | `select` | `{ name, label, options:{value,label}[], placeholder? }`. |
| `NumberField` | numeric input | `{ name, label, suffix?, min?, max? }`; integers for height/weight. |
| `WaveSlider` | `slider` | `{ name, label }`; **meters** (0–4 step .1), big Inter Tight readout + `m`; stores meters in the form, converts to feet on submit (§4.2). |
| `DateField` | native date / `input[type=date]` | `{ name, label }`; emits `YYYY-MM-DD`. |
| `AvatarUploader` | `avatar` + file input | `{ value, onUploaded(url) }`; client-direct upload to `profile-media` with progress overlay (§4.4). |

### 2.2 `components/layout/`
| Component | Source | Contract / notes |
|---|---|---|
| `AppShell` | new | Authenticated wrapper: header slot + scrollable content (gutter 20px, bottom pad 96–180) + `BottomNav` + `FAB`. Desktop ≥`md` → left side rail (§7). |
| `AppHeader` | `AppHeader` | `{ title?, onBack?, action?, hideAvatar? }`; logo (Pacifico, "Rise" electric) on tabs, 36px back button on sub-screens; right = avatar (from `useProfile`) or `action`. |
| `BottomNav` | `TabBar` | 3 tabs (`Sessões`/`Treinos`/`Perfil`) via `Link` + `activeProps`; glass `bg-[rgba(11,16,32,0.82)] backdrop-blur-md`, 2px electric indicator over active. Hidden on `/auth/*` + `/onboarding`. |
| `Fab` | `FAB` | center, 58px, electric glow; `→ /sessions/new`. Becomes "Nova sessão" button in the rail on desktop. |
| `SubmitBar` | `SubmitBar` | sticky bottom, `bg-background` + top shadow; single full-width primary. |

### 2.3 `components/feedback/`
| Component | Source | Contract |
|---|---|---|
| `SessionCard` | `SessionCard` | `{ session: Session, boardLabel: string|null, score: number|null|'loading' }`; wave shown in **meters**; score 32px Inter Tight or `Sem análise` pill; `loading` → score-chip skeleton (§4.5). Whole card is a `Link` to detail. |
| `ScoreBars` | `ScoreRow`×6 + `Card` | `{ review: Review }`; renders non-null dims via `SCORE_DIMENSION_LABELS`; **kit default** = white-55% bars, accent on the highest row (value ramp `scoreColor` available behind `tone="value"`, default off — StyleGuide §13 #10). |
| `OverallBand` | `OverallBand` | `{ value:number, sub?:string }`; 56–68px Inter Tight, decimal point electric. |
| `ReviewCard` | narrative `Card` | `{ narrative, aiModelVersion }`; prose `text-soft`. |
| `TipList` | `TipItem`×3 | `{ tips: string[] }`; numbered electric badges. |
| `SummaryRow` | `SummaryRow` | `{ icon, title, sub?, action? }`; used by detail hub. |
| `MediaThumb` | `MediaThumb` | `{ media?, video?, progress?, dashed?, label?, onDelete? }`. |
| `MediaGallery` | grid | `{ media: Media[], onAdd, onDelete? }`; 3-up grid + dashed add tile; thumb tap → lightbox (§9 Q2). |
| `BoardCard` | `BoardCard` | `{ board: Surfboard, onEdit, onDelete }`; size in **feet**. |
| `PlanCard` | `PlanCard` | `{ source, focus, workouts, exercises, to }`. |
| `WorkoutAccordion` | `WorkoutAccordion` | `{ workout: Workout, defaultOpen? }`; exercises in order, sets/reps pills, `videoUrl`→play tile. |
| `EmptyState` / `ErrorState` | same | `EmptyState{icon,title,subtitle,cta?}`; `ErrorState{title?,subtitle?,onRetry}` (default copy from export). |
| `AIState` | `AIState` | `{ title?, subtitle? }`; 3-dot electric pulser, **never a spinner**. |
| `DotPulser` | `DotPulser` | reused inside busy `Button` (replaces label, keeps width). |
| `Pill`/`Eyebrow`/`Alert` | same | `Pill` → extend `badge` with the 6 tones; `Eyebrow` → `.t-eyebrow` span; `Alert` → inline auth/error banner. |
| `Toast` | `Toast` | use **sonner**; success/info/error, no "!". |
| `OfflineBanner` | `OfflineBanner` | sticky top, warning tone; driven by `navigator.onLine` + `online/offline` events. |

### 2.4 `components/skeletons/`
One per screen/section, matching final layout (Layouts §6): `SessionListSkeleton` (3–4 `SkelCard`), `SessionDetailSkeleton` (hero block + gallery), `ScorePanelSkeleton` (6 bars), `ProfileHeaderSkeleton`, `BoardListSkeleton`, `PlanSkeleton`. Use shadcn `skeleton` + the export's shimmer.

---

## 3. Routing Implementation (TanStack Router, file-based)

Replace `routes/index.tsx` placeholder. Target tree (autoCodeSplitting on; `routeTree.gen.ts` generated by the Vite plugin):

```
routes/
  __root.tsx                         # context: { queryClient }; Outlet + <Toaster/> + <OfflineBanner/>
  index.tsx                          # redirect → /sessions (beforeLoad)
  _auth.tsx                          # PUBLIC layout: AuthShell (logo, centered col); redirect → /sessions if already authed
  _auth/login.tsx
  _auth/signup.tsx
  _auth/forgot-password.tsx
  _auth/reset-password.tsx
  _app.tsx                           # AUTH guard + AppShell (BottomNav + FAB); see §3.1
  _app/onboarding.tsx                # inside guard but renders WITHOUT BottomNav/FAB
  _app/sessions/index.tsx
  _app/sessions/new.tsx
  _app/sessions/$sessionId/index.tsx
  _app/sessions/$sessionId/upload.tsx
  _app/sessions/$sessionId/review.tsx
  _app/sessions/$sessionId/plan.tsx
  _app/training-plans/index.tsx      # Treinos (placeholder until GET list ships)
  _app/training-plans/$planId.tsx
  _app/profile/index.tsx
  _app/profile/edit.tsx
  _app/boards/index.tsx
  _app/boards/new.tsx
  _app/boards/$boardId.edit.tsx
  _app/settings.tsx
```

### 3.1 Guards (`beforeLoad`)
- **`_app.tsx`** `beforeLoad`: read `useAuthStore.getState()`. If `!initialized` it's already resolved (auth hydrated in `main.tsx` before render). If `!session` → `throw redirect({ to:'/auth/login', search:{ redirect: location.href } })`.
- **Onboarding gate:** in `_app.tsx` `beforeLoad`, after auth passes, `ensureQueryData(profileQuery)` (the `GET /me` that auto-creates the profile). If `surfLevel || heightCm || weightKg` is missing **and** the target isn't `/onboarding`, `throw redirect({ to:'/onboarding' })`. Conversely, `_app/onboarding` redirects to `/sessions` if the profile is already complete. Completeness helper: `isProfileComplete(p) = !!p.surfLevel && p.heightCm != null && p.weightKg != null` (Overview §6, decision #9).
- **`_auth.tsx`** `beforeLoad`: if `session` exists → `redirect({ to:'/sessions' })`.
- **`index.tsx`** `beforeLoad`: `redirect({ to:'/sessions' })`.

### 3.2 Suspense + error boundaries (per route)
Each data route declares:
- `loader: ({ context }) => context.queryClient.ensureQueryData(<resourceQuery>)` for warm cache (optional but preferred for snappy nav).
- `component` uses `useSuspenseQuery` (reads) — no manual `isLoading`.
- `pendingComponent: <ScreenSkeleton/>` and `errorComponent: ({ reset }) => <ErrorState onRetry={reset}/>` so every segment has skeleton + retry (Overview §5.3).
- AI routes (`review`, `plan`) do **not** use a skeleton for the generation step — they use `<AIState/>` driven by a mutation (§4.3).

---

## 4. API Services Layer (the hooks)

Sits in `hooks/queries/` and `hooks/mutations/`, built on the existing `lib/api/endpoints/*` + `qk`. **Server state lives only in Query** (Overview §2 state-split). Pattern: export a **query-options factory** per read (so both `useSuspenseQuery` and router `ensureQueryData` share one definition).

### 4.1 Query options factories + read hooks
```
hooks/queries/
  profile.ts        profileQueryOptions()           → useProfile()            qk.profile.me()
  surfboards.ts     surfboardsQueryOptions()         → useSurfboards()         qk.surfboards.list()
                    surfboardQueryOptions(id)        → useSurfboard(id)        qk.surfboards.detail(id)
  sessions.ts       sessionsQueryOptions()           → useSessions()           qk.sessions.list()
                    sessionQueryOptions(id)          → useSession(id)          qk.sessions.detail(id)
  media.ts          mediaQueryOptions(sessionId)     → useSessionMedia(id)     qk.media.bySession(id)
  reviews.ts        reviewBySessionOptions(id)       → useReviewBySession(id)  qk.reviews.bySession(id)  (404-tolerant)
  trainingPlans.ts  planByReviewOptions(reviewId)    → usePlanByReview(id)     qk.trainingPlans.byReview(id) (404-tolerant)
                    planQueryOptions(planId)         → usePlan(planId)         qk.trainingPlans.detail(id)
```
Example shape:
```ts
export const profileQueryOptions = () =>
  queryOptions({ queryKey: qk.profile.me(), queryFn: () => profileApi.me() });
export const useProfile = () => useSuspenseQuery(profileQueryOptions());
```

**404-tolerant reads** (review/plan by session — Overview §8a): the queryFn catches `ApiError` with `status===404` (codes `REVIEW_NOT_FOUND`/`NOT_FOUND`) and returns `null`. This keeps `useSuspenseQuery` usable (resolves to `null` instead of throwing), so "Sem análise" / "Gerar treino" render without an error boundary:
```ts
queryFn: async () => {
  try { return await reviewsApi.bySession(id); }
  catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
}
```

### 4.2 Mutation hooks + invalidation map
```
hooks/mutations/
  profile.ts        useUpdateProfile()      → invalidate qk.profile.me()
  surfboards.ts     useCreateSurfboard()    → invalidate qk.surfboards.list()
                    useUpdateSurfboard(id)  → invalidate list + detail(id)
                    useDeleteSurfboard()    → OPTIMISTIC remove from list (cheap/reversible), rollback onError, toast
  sessions.ts       useCreateSession()      → invalidate qk.sessions.list(); maps waveSizeMeters→feet (units.metersToFeet)
                    useDeleteSession()      → invalidate qk.sessions.list(); confirm dialog (cascade warning)
  media.ts          useUploadMedia(id)      → invalidate qk.media.bySession(id)  (progress → §4.6)
                    useDeleteMedia(id)      → invalidate qk.media.bySession(id)
  reviews.ts        useCreateReview()       → AI mutation (§4.3); on success set qk.reviews.bySession + detail
  trainingPlans.ts  useCreateTrainingPlan() → AI mutation (§4.3); on success set qk.trainingPlans.byReview + detail
```
- **Session create** converts at the boundary: `waveSize: roundTo(metersToFeet(values.waveSizeMeters), 2)` — never store meters in the API payload (StyleGuide §8).
- **Validation errors:** in mutation `onError`, if `ApiError.code==='VALIDATION_ERROR'`, surface `err.fieldErrors` back onto the RHF form via `setError` (Overview §5.2). Unexpected errors → sonner toast via `toUserMessage(err)`.

### 4.3 AI mutations (slow, 3–20s)
`useCreateReview` / `useCreateTrainingPlan` use `useMutation` with an explicit **`<AIState/>`** pending UI (not a skeleton), and the trigger disabled while pending. Business outcomes handled **at the call site**, not as toasts (Overview §5.2):
- `REVIEW_ALREADY_EXISTS` / `TRAINING_PLAN_ALREADY_EXISTS` → don't toast; `navigate` to the existing `/review` / `/plan` (refetch the 404-tolerant query first).
- `NO_MEDIA_FOR_SESSION` → inline prompt + `( Adicionar mídia )` → `/upload`.
- `AI_GENERATION_FAILED` / `AI_PARSE_FAILED` → inline `ErrorState` with **retry** button (re-run the mutation).
On success, seed the cache (`queryClient.setQueryData`) so the standalone read route shows instantly.

### 4.4 Avatar upload (client-direct, bypasses the API)
`AvatarUploader` uploads bytes **directly to Supabase Storage** bucket `env.avatarBucket` (`profile-media`), then saves the public URL via `PATCH /me` (`avatarUrl`). The API never receives avatar bytes (Overview §6).
```
supabase.storage.from(env.avatarBucket).upload(path, file, { upsert:true })
→ getPublicUrl(path) → useUpdateProfile({ avatarUrl })
```
Path convention: `${userId}/avatar.${ext}`. Show progress overlay; map storage errors to a pt-BR toast.

### 4.5 Session-card score resolution (Overview §8a)
The list endpoint returns neither board label nor overall score. The list screen:
1. `useSessions()` + `useSurfboards()` (both cached) → resolve `surfboardId → label` client-side (`—` when null).
2. Per card, resolve score **independently** via `useReviewBySession(session.id)` (404-tolerant) rendered inside a small `<Suspense fallback={<ScoreChipSkeleton/>}>` so one slow/missing review never blocks the list. `null` → `Sem análise`.
> If per-card requests prove too chatty, fall back to dropping the score from the card (flagged optimization, not a blocker).

### 4.6 Media upload with per-file progress (needs XHR, not fetch)
`fetch` can't report upload progress, and the design requires a per-file progress bar (Layouts §3.4). Add `lib/api/upload.ts`: an **XHR-based** uploader that mirrors the fetch wrapper's contracts —
- injects `Authorization: Bearer <getAccessToken()>`, posts `multipart/form-data` to `/api/v1/sessions/{id}/media`,
- emits progress via `xhr.upload.onprogress` (`loaded/total → %`),
- parses the same error envelope into `ApiError` (reuse `errors.ts`),
- on `401` performs the same single refresh-retry as `client.ts` (extract a shared `withRefresh()` helper so both paths share the logic).

**Client-side pre-validation before upload** (fast feedback; server stays authoritative):
- MIME ∈ `ACCEPTED_MEDIA_TYPES`; size ≤ `MAX_FILE_SIZE_BYTES`; video duration ≤ `MAX_VIDEO_DURATION_SECONDS` (probe via a hidden `<video>` `loadedmetadata`); **selection rule = 1 video XOR ≤3 images** (`MAX_IMAGES_PER_SESSION`).
- Per-file failures map to pt-BR: `FILE_TOO_LARGE`→"Arquivo muito grande (máx 100MB)", `VIDEO_TOO_LONG`→"Vídeo acima de 120s", `INVALID_MEDIA_TYPE`→"Formato não aceito" (extend `ERROR_MESSAGES_PT_BR` if surfaced as toasts).

### 4.7 Treinos list (blocked dependency)
`GET /api/v1/training-plans` does not exist yet (Overview §13). `training-plans/index.tsx` renders an **EmptyState** placeholder ("Nenhum treino gerado ainda — gere um a partir da análise de uma sessão."). When the endpoint ships: add `trainingPlansApi.list()`, `qk.trainingPlans.list()`, `trainingPlansQueryOptions()`, `useTrainingPlans()`, and `PlanCard` grid. Card → `/training-plans/$planId` (or reuse `/sessions/$id/plan`).

---

## 5. Forms (react-hook-form + zod)

- Every form uses `useForm({ resolver: zodResolver(<schema>) })` with the schemas already in `src/schemas/`.
- **Wave size** captured in meters (`waveSizeMeters`), converted to feet on submit (§4.2). **Board size** stays feet.
- Server `VALIDATION_ERROR.details` mapped back to fields via `ApiError.fieldErrors` + `setError` (fallback to client zod).
- Busy submit: `<Button disabled={isPending}>` with label replaced by `<DotPulser/>`, width preserved.
- Form ↔ route map: `login/signup/forgot/reset` (`schemas/auth`), `onboarding` + `profile/edit` (`schemas/profile`), `sessions/new` (`schemas/session`), `boards/new` + `boards/$id/edit` (`schemas/surfboard`).

---

## 6. App bootstrap & providers (already wired)

`main.tsx` already: `initAuth()` (hydrate session before render) → `<QueryClientProvider>` → `<RouterProvider>`. This phase adds to `__root.tsx`: `<Toaster/>` (sonner) and a top-level `<OfflineBanner/>`. The auth store already subscribes to `onAuthStateChange`; logout (`settings.tsx`) calls `authStore.signOut()` → redirect `/auth/login`.

---

## 7. Responsive (≥ `md`) — Layouts §7
- `BottomNav` → left side rail (240px): logo top, vertical tabs, "Nova sessão" button (replaces FAB).
- Content centered, `max-w-[1120px]`; lists → 2-col grids at ≥`lg` (sessions, boards, plans).
- Forms cap ~`max-w-[560px]` centered. Cards keep `rounded-[--radius-lg]`.

---

## 8. State coverage (must implement) — mirrors DESIGN §6

| Screen | loading | empty | error | special |
|---|---|---|---|---|
| Sessions list | skeleton cards | EmptyState + "Registrar primeira sessão" | ErrorState+retry | per-card score chip (§4.5) |
| Session detail | hero+gallery skeleton | media/review/plan empty CTAs | ErrorState+retry | delete → AlertDialog (cascade) |
| Upload | — | no files | per-file error | progress, MIME/size/duration validation |
| Review | `<AIState/>` while POST | no media → prompt | AI fail → retry | already-exists → navigate |
| Plan | `<AIState/>` while POST | — | AI fail → retry | already-exists → navigate |
| Treinos list | skeleton | placeholder (no endpoint) | retry | blocked dependency |
| Boards list | skeleton | EmptyState + CTA | retry | — |
| Board form | edit prefill skeleton | — | validation + delete confirm | — |
| Profile/Edit | header skeleton | — | error | avatar upload progress |
| Auth | button pulser | — | inline `Alert` | redirect on success |

---

## 9. Open questions (carry from Layouts §8 — resolve before/while building)
1. **Greeting header** on `/sessions` ("Bom dia, Felipe" + forecast line). Keep the time-of-day greeting? The forecast line has **no API** — drop it.
2. **Media lightbox** — full-screen viewer on thumb tap (shadcn `dialog`) vs. open `storageUrl` in a new tab. Decides whether `dialog` is added in §1.3.
3. **"Comecei o treino"** button on the plan screen — local-only ack (no API). Keep as non-persistent affordance or remove for MVP?
4. **Boards "+"** as a top-bar action while the global FAB stays "Nova sessão" — confirm.

> Defaults if no answer: (1) keep greeting, drop forecast; (2) lightbox via `dialog` (in scope); (3) keep as local ack; (4) top-bar "+".

---

## 10. Testing additions (Vitest + TL + MSW) — extends Overview §9

Already covered: units, schemas, error map. Add as components/hooks land:
- **Hooks vs. MSW:** `useDeleteSurfboard` optimistic update + rollback; `useCreateSession` meters→feet conversion in the payload; `useReviewBySession` 404→`null`; AI mutation `REVIEW_ALREADY_EXISTS`→navigate; the `401→refresh→retry` path (mock a 401 then 200).
- **Components:** `ScoreBars` (non-null dims only, highest row accent), `SessionCard` (score / "Sem análise" / loading chip, meters display, "—" board), media picker selection rule (1 video XOR ≤3 images — **must-cover**), `AlertDialog` confirm flow, `EmptyState`/`ErrorState` render + retry, busy `Button` pulser.
- **Forms:** validation errors render; submit calls mutation with mapped payload; server `VALIDATION_ERROR` → field error.
- Co-locate `*.test.tsx`; MSW handlers extended in `src/test/mocks/handlers.ts` (incl. AI-slow/failure + error envelopes). Target meaningful coverage; the **media-selection rule, schemas, and error map are must-cover**.

---

## 11. Build order (recommended)

1. **shadcn adds** (§1.3) + **icons** (§1.4) + token-bridge sanity check.
2. **forms/** + **feedback primitives** (`Pill`, `Eyebrow`, `Alert`, `DotPulser`, `EmptyState`, `ErrorState`, `AIState`, `Skel*`).
3. **API services** — query-options factories + read hooks (§4.1), then mutations (§4.2–4.3), `upload.ts` (§4.6), avatar upload (§4.4). Test against MSW.
4. **layout/** — `AppShell`, `AppHeader`, `BottomNav`, `Fab`, `SubmitBar`.
5. **Routing** — `_auth`/`_app` layouts + guards (§3); replace `index.tsx` placeholder.
6. **Screens**, dependency order: auth → onboarding → sessions list → new session → detail hub → upload → review → plan → boards → profile/edit → settings → treinos placeholder.
7. **Responsive** pass (§7) + **state coverage** audit (§8) + tests (§10).

**Acceptance per screen:** matches the Layouts wireframe; all states from §8 implemented; pt-BR copy + one electric CTA; `tsc` clean; tests for any new must-cover logic; no server state in Zustand; wave size in meters everywhere except board size.

---

## 12. Resolved Decisions Log (Doc 5)

| # | Item | Decision |
|---|---|---|
| 1 | Port strategy | Port **intent** of `design/*.jsx` → Tailwind+shadcn bound to token bridge; drop canvas chrome (`PhoneFrame`, `StatusBar`, `Scroll`, switcher). |
| 2 | Read hooks | **Query-options factories** shared by `useSuspenseQuery` + router `ensureQueryData`. |
| 3 | 404 reads | Review/plan-by-session are **404-tolerant** → resolve to `null` (no error boundary for "no review yet"). |
| 4 | AI calls | `useMutation` + `<AIState/>` (no skeleton); already-exists → navigate; AI-fail → inline retry. |
| 5 | Media progress | **XHR uploader** (`lib/api/upload.ts`) — fetch can't report progress; shares envelope/refresh logic with `client.ts`. |
| 6 | Avatar | **Client-direct** to `profile-media`, then `PATCH /me`; API never sees bytes. |
| 7 | Units | Meters in UI / forms; convert to feet on submit; board size stays feet. |
| 8 | Score bars | **Kit default** (white-55% + accent on highest); value ramp opt-in only. |
| 9 | Treinos tab | Placeholder until `GET /api/v1/training-plans` ships (backend dependency). |
| 10 | Optimistic | Only `useDeleteSurfboard` (cheap/reversible); everything else invalidates. |
```
