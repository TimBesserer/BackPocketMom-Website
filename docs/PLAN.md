# BackPocket Mom — build plan (PLAN.md)

> The architect's roadmap for the unattended overnight build. The Orchestrator
> re-reads this at the start of every stage, picks the next unchecked stage whose
> dependencies are met, spawns a `developer`, reviews, gates, commits, ticks the box.
> Source of truth for behaviour is `docs/spec.md`; conventions are `CLAUDE.md`;
> the build loop is `docs/orchestration.md`. This file plans **only** — no code here.

## How to read this plan

- **17 build phases** (Phase 1 → Phase 17), preceded by Phase 0 (this planning task).
- **85 stages.** A stage is one committable unit a single developer finishes with
  tests in one pass. Stages are deliberately small and individually ordered.
  (Post-review additions: 1.11 event repo + manual entry; 3.4 split into 3.4a/3.4b;
  3.7 child notes.)
- Roadmap checkboxes live in section **B**; full per-stage detail in section **C**;
  the linear build order + parked items in section **D**.
- Every stage inherits the standard gate (don't repeat it in each "definition of
  done"): `flutter analyze` clean · `flutter test` green · `build_runner` re-run if
  Drift/codegen changed · helper-voice sentence-case copy · no secrets · no
  hard-coded colours · RLS shipped for any new table.

### Conventions every stage follows (from CLAUDE.md — do not re-derive)

- Feature-first: `lib/features/<feature>/{presentation,application,data,domain}/`.
- Screens are `ConsumerWidget` with a `static const route`, registered in
  `lib/core/router/app_router.dart`.
- State + logic live in a Riverpod `Notifier`/`AsyncNotifier` in `application/`.
  Widgets watch providers; they hold no business logic.
- Supabase access only through a repository in `data/` that uses
  `supabaseClientProvider`. Never call Supabase from a widget.
- Writes that must survive offline go through the Drift `SyncQueue`, not straight to
  Supabase.
- Colours/typography come from the theme (`AppColors`, `AppTheme`). Never a raw hex.
- Premium is gated through the single entitlement provider (Stage 1.8). Never scatter
  `if (isPremium)`.
- Repositories are tested against fakes/mocks — **never** a live backend. Tests run on
  the host with `flutter test`, no emulator/device.

### Data-model invariants every stage must honour (CLAUDE.md / spec §3.2)

1. **Two independent parent identities** — never one shared household login. Children
   are the shared centre, linked via `child_guardians`.
2. **Protected safety floor** — allergies, current medications, emergency contacts are
   always visible to every guardian and can never be toggled off.
3. **Village helpers get limited, per-child / per-pet access** via explicit toggles.
4. **Always private, never shared with the village:** the document vault, insights &
   patterns, the parents' private life.
5. Show a **live preview of exactly what a helper will see** before saving.
6. Every new table ships with RLS in the same migration. Default-deny.

---

## A. Feature inventory — spec §3.1 → §3.15 mapped to features

| Spec | Feature / screens | Tier |
|---|---|---|
| **§3.1 Onboarding** | 3-slide welcome flow; account creation (Google / Apple / email); guided-but-skippable family setup (child → pet → first app); pinned setup home base with progress ring | **Free** |
| **§3.2 People & sharing** | People hub; child profiles (incl. protected safety-floor editors); co-parent identity + invite; Combined vs Separate mode switch; per-category sharing toggles; village helper invite (per child/pet) with per-toggle access; live "what a helper sees" preview | **Free** (unlimited co-parent count & helpers are **Premium** limits — gated, see §4) |
| **§3.3 Voice-to-calendar** | Guided adaptive mic prompt; STT capture (offline-queued); cloud parse → structured event; confidence highlighting + soft clarifying question; Accept/Edit/Delete confirmation window; tap-or-speak editing; recurring-event rules with date preview | **Free** (10 adds/month); **Premium** = unlimited adds |
| **§3.4 Document vault** | Per-profile vault with folders; upload by photo/PDF/scan; expiry prompt at filing; secure 7-day / few-view expiring share link; name + filter search | **Free**; content search (OCR) + auto-read expiry are **Premium** |
| **§3.5 Connected apps** | Sign-in connect + iCal-link connect; guided connection; unified normalized timeline colour-coded by origin; duplicate detection (auto-merge / flag); conflict detection inline; broken-sync banner; manual-entry dead-end + integration wishlist | **Free** (5 connections); **Premium** = unlimited |
| **§3.6 Notifications** | Balanced default posture; evening-before + 1-hour reminders; morning summary; quiet hours + "urgent conflicts may break quiet"; distinct amber conflict alerts | **Free**; smart live-traffic travel reminders are **Premium** |
| **§3.7 Intelligence** | Calm load meter with plain-words explanation; insight engine ("getting to know you" → weekly value); predictive annual patterns (manual seed + history discovery) | **Free** basic weekly summary; full insight engine is **Premium** |
| **§3.8 Photo wall** | Per-profile curated photo wall (not a camera roll); memory stamp (date + note); select & export reels (captions optional); per-helper photo-wall sharing | **Premium** |
| **§3.9 Memory handoff** | Ceremonial lifelong archive builder (photo wall + artwork + report cards + health history) + export | **Premium** (extends photo wall + vault) |
| **§3.10 Auth & security** | Email/Google/Apple sign-in; 6-digit email recovery; biometric lock (default ON); device list + remote sign-out; account deletion with export → 30-day pause → permanent | **Free** |
| **§3.11 Privacy** | "Your privacy, plainly" home; in-context reassurances at sensitive moments; "your data" dashboard (see / download / delete) | **Free** |
| **§3.12 Storage** | Storage meter; gentle 80/90% warnings; 100% grace period that keeps saving | **Free** 1 GB / **Premium** 25 GB+ add-ons (gating only) |
| **§3.13 Offline** | Offline view/read/capture; capture-now-sync-later queue; emergency essentials always on device; adaptive offline reassurance | **Free** |
| **§3.14 Settings & widget** | Searchable grouped settings (Family · Notifications · Privacy & security · Connected apps · Account & plan · Personalization incl. voice toggle + appearance); home-screen widget data bridge (3 sizes, sensitive info behind lock) | **Free** |
| **§3.15 Empty states** | Gentle-nudge variant (simple screens) + reveal-the-value variant (nuanced screens with concrete previews) | **Free** |

---

## B. Phased roadmap (tick stages here as they land)

### Phase 1 — Foundations
- [x] Stage 1.1 — Plain-Dart domain models for the whole data model
- [x] Stage 1.2 — Core utilities: Result/AppFailure types + redacting logger
- [x] Stage 1.3 — Auth abstraction: `AuthRepository` interface + Supabase impl + fake
- [x] Stage 1.4 — Auth UI: sign-in / sign-up screens + controller + router auth-gate
- [x] Stage 1.5 — Connectivity abstraction + provider + fake
- [x] Stage 1.6 — Offline sync engine: flush Drift `SyncQueue` on reconnect
- [x] Stage 1.7 — Repository foundations + `ChildRepository` (interface/impl/fake)
- [x] Stage 1.8 — Entitlement / `PlanGate` provider + plan-limits model
- [x] Stage 1.9 — App shell + bottom navigation (ShellRoute)
- [x] Stage 1.10 — Today/home screen skeleton
- [x] Stage 1.11 — Event repository (interface/impl/fake) + manual event create/edit

### Phase 2 — Onboarding & guided family setup (§3.1)
- [x] Stage 2.1 — Welcome flow: 3 swipeable, skippable intro slides
- [x] Stage 2.2 — Guided setup step 1: first child
- [x] Stage 2.3 — Guided setup step 2: first pet (+ `PetRepository`)
- [x] Stage 2.4 — Guided setup step 3: connect first app (skippable placeholder)
- [x] Stage 2.5 — Pinned setup home base: checklist + progress ring

### Phase 3 — People, co-parent & village sharing (§3.2)
- [x] Stage 3.1 — People hub screen
- [x] Stage 3.2 — Child profile detail + extended fields (migration 0002)
- [x] Stage 3.3 — Protected safety-floor editors (allergies / meds / contacts)
- [x] Stage 3.4a — Co-parent invite + `InviteSender` (migration 0003)
- [x] Stage 3.4b — Combined/Separate mode + per-category sharing toggles (migration 0003b)
- [x] Stage 3.5 — Village helper invite + per-toggle access + live "what a helper sees" preview
- [x] Stage 3.6 — Sharing-resolution layer + protected-floor enforcement (defensive)
- [x] Stage 3.7 — Child notes: capture + "share with helpers" flag (migration 0003c)

### Phase 4 — Voice-to-calendar (§3.3)
- [x] Stage 4.1 — Speech-to-text abstraction (`SttService`) + fake
- [x] Stage 4.2 — Event-parsing abstraction (`EventParser`) + deterministic fake
- [x] Stage 4.3 — Voice capture screen: guided adaptive mic prompt + offline queue
- [x] Stage 4.4 — Confirmation window: confidence highlight + clarifying question + Accept/Edit/Delete
- [x] Stage 4.5 — Recurring events: rule + date-list preview + post-accept conflict catch (migration 0004)
- [x] Stage 4.6 — Voice-add monthly quota gating (Free 10/mo)

### Phase 5 — Document vault (§3.4)
- [x] Stage 5.1 — Vault models + `DocumentRepository` + fake
- [x] Stage 5.2 — Vault screen: folders + document list + empty state
- [x] Stage 5.3 — Upload flow (photo/PDF/scan) behind `FilePicker` interface + expiry prompt at filing
- [x] Stage 5.4 — Free search: name + filter chips (person / type / date)
- [x] Stage 5.5 — Secure expiring share link (migration 0005)
- [x] Stage 5.6 — Expiry & renewal tracking (Free): capture + remind-ahead + "expiring soon"
- [ ] Stage 5.7 — Premium vault content search (OCR behind interface)
- [ ] Stage 5.8 — Premium auto-read expiry dates (OCR behind interface)

### Phase 6 — Connected apps & schedule sync (§3.5)
- [ ] Stage 6.1 — Connection model + `CalendarSource` abstraction + real iCal parser (migration 0006)
- [ ] Stage 6.2 — Sign-in connect abstraction (OAuth connectors) behind interface + stub
- [ ] Stage 6.3 — Guided connection flow UI
- [ ] Stage 6.4 — Unified normalized timeline, colour-coded by origin
- [ ] Stage 6.5 — Duplicate detection (smart blend): auto-merge / flag
- [ ] Stage 6.6 — Conflict detection (overlap) shown inline
- [ ] Stage 6.7 — Broken-sync banner + manual-entry dead-end + integration wishlist (migration 0007)
- [ ] Stage 6.8 — Connection-count gating (Free 5)

### Phase 7 — Notifications & reminders (§3.6)
- [ ] Stage 7.1 — Notification scheduling abstraction (`NotificationService`) + fake
- [ ] Stage 7.2 — Reminder rules engine (Free): evening-before + 1-hour
- [ ] Stage 7.3 — Morning summary generator (helper voice)
- [ ] Stage 7.4 — Quiet hours + "urgent conflicts may break quiet" toggle (migration 0008)
- [ ] Stage 7.5 — Conflict alerts: amber caution bar + inline actions
- [ ] Stage 7.6 — Premium smart live-traffic reminders (Maps/geolocator behind interface, graceful fallback)

### Phase 8 — Intelligence: load meter, insights, annual patterns (§3.7)
- [ ] Stage 8.1 — Calm load-meter scoring engine + plain-words explanation
- [ ] Stage 8.2 — Load-meter UI (daily/weekly, tappable explanation)
- [ ] Stage 8.3 — Insight engine (Free): "getting to know you" + weekly value + locked previews
- [ ] Stage 8.4 — Predictive annual patterns: manual seed + history discovery (migration 0009)
- [ ] Stage 8.5 — Full insight engine (Premium)

### Phase 9 — Photo wall & memory reels (Premium) (§3.8)
- [ ] Stage 9.1 — Photo-wall data model + repository (migration 0010)
- [ ] Stage 9.2 — Per-profile photo-wall UI (curated, chrono, Premium-gated)
- [ ] Stage 9.3 — Memory stamp: editable date + short note
- [ ] Stage 9.4 — Select & export reels in date order (captions optional)
- [ ] Stage 9.5 — Per-helper photo-wall sharing toggle

### Phase 10 — Lifelong memory handoff (Premium) (§3.9)
- [ ] Stage 10.1 — Handoff package builder + export abstraction
- [ ] Stage 10.2 — Ceremonial handoff UI

### Phase 11 — Auth & security hardening (§3.10)
- [ ] Stage 11.1 — Password recovery: 6-digit email code flow
- [ ] Stage 11.2 — Biometric lock (default ON) behind `BiometricService` + app-resume gate
- [ ] Stage 11.3 — Device list + remote sign-out (migration 0011)
- [ ] Stage 11.4 — Account deletion: export → 30-day pause → permanent (migration 0012)

### Phase 12 — Privacy & data transparency (§3.11)
- [ ] Stage 12.1 — "Your privacy, plainly" home
- [ ] Stage 12.2 — In-context reassurance component wired into sensitive moments
- [ ] Stage 12.3 — "Your data" dashboard: see / download / delete

### Phase 13 — Storage (§3.12)
- [ ] Stage 13.1 — Storage meter (usage vs entitlement limit)
- [ ] Stage 13.2 — Gentle 80/90% warnings + 100% grace period

### Phase 14 — Offline polish & emergency essentials (§3.13)
- [ ] Stage 14.1 — Emergency-essentials on-device cache (Drift schema v2)
- [ ] Stage 14.2 — Emergency-essentials screen (zero-signal reachable)
- [ ] Stage 14.3 — Offline indicator + adaptive capture reassurance

### Phase 15 — Settings & home-screen widget (§3.14)
- [ ] Stage 15.1 — Settings screen: grouped categories + personalization (migration 0013)
- [ ] Stage 15.2 — Settings search
- [ ] Stage 15.3 — Home-screen widget data bridge (Dart side; native UI parked)

### Phase 16 — Empty states (§3.15)
- [ ] Stage 16.1 — Empty-state component library (gentle-nudge + reveal-the-value)
- [ ] Stage 16.2 — Empty-state sweep across screens

### Phase 17 — Polish & store-prep
- [ ] Stage 17.1 — Theme & accessibility polish
- [ ] Stage 17.2 — BackPocket Mom voice on/off applied app-wide
- [ ] Stage 17.3 — App-icon placeholders + platform-folder note + store-metadata stub
- [ ] Stage 17.4 — Final analyze/test sweep + summary prep

---

## C. Stage detail

> Format per stage: **Spec** · **Scope/files** · **DB** · **Tests** · **Done when**
> (beyond the standard gate) · **Deps**. Reuse existing scaffold everywhere; never
> recreate `lib/main.dart`, `app.dart`, theme, `database.dart`,
> `supabase_providers.dart`, or `0001_init.sql`.

### Phase 1 — Foundations

#### Stage 1.1 — Plain-Dart domain models
- **Spec:** §3.2, §3.4, §3.5 (the shared data model).
- **Scope:** `lib/core/domain/` (cross-feature models): `profile.dart`, `child.dart`,
  `pet.dart`, `guardian.dart`, `family_event.dart` (normalized event: id, childId,
  title, startsAt, endsAt, location, source, isSports), `allergy.dart`,
  `medication.dart`, `emergency_contact.dart`, `document.dart`,
  `helper_child_access.dart`, `helper_pet_access.dart`, plus a `plan.dart` enum
  (`Plan.free` / `Plan.premium`). Immutable, `==`/`hashCode`, `copyWith`,
  `fromJson`/`toJson` matching the column names in `0001_init.sql`.
- **DB:** none (mirrors existing tables).
- **Tests:** `test/core/domain/` — round-trip json, equality, copyWith for each model.
- **Done when:** every table in `0001_init.sql` has a corresponding model with a
  JSON round-trip test; field names match the SQL exactly.
- **Deps:** none.

#### Stage 1.2 — Core utilities: Result types + redacting logger
- **Spec:** CLAUDE.md security ("never log sensitive data"; `avoid_print`).
- **Scope:** `lib/core/util/result.dart` (`Result<T>` = success | `AppFailure`),
  `lib/core/util/app_failure.dart`, `lib/core/util/app_logger.dart` (a logger that
  redacts medical info / tokens / locations / document contents; no `print`).
- **DB:** none.
- **Tests:** `test/core/util/` — Result mapping/folding; logger redacts a sample
  token/medical string and never emits raw sensitive values.
- **Done when:** logger has an explicit redaction list and a test proving redaction.
- **Deps:** none.

#### Stage 1.3 — Auth abstraction
- **Spec:** §3.10 (email/password, Google, Apple).
- **Scope:** `lib/features/auth/data/auth_repository.dart` (interface:
  `signInWithEmail`, `signUpWithEmail`, `signInWithGoogle`, `signInWithApple`,
  `sendRecoveryCode`, `verifyRecoveryCode`, `signOut`, `currentUser`,
  `authStateChanges`), `supabase_auth_repository.dart` (uses
  `supabaseClientProvider`), `fake_auth_repository.dart`, and an `authRepositoryProvider`.
  Google/Apple methods exist behind the interface; the Supabase impl wires
  `signInWithOAuth`, with the platform OAuth handshake left `TODO(human-review)`.
- **DB:** none (uses existing `profiles` + `handle_new_user` trigger).
- **Tests:** `test/features/auth/` — fake repo covers sign-up/in/out, recovery
  request/verify, error paths; controller (next stage) uses the fake.
- **Done when:** no Supabase types leak above the repository; OAuth gaps flagged.
- **Deps:** 1.1, 1.2.

#### Stage 1.4 — Auth UI + router auth-gate
- **Spec:** §3.1 account creation, §3.10 sign-in.
- **Scope:** `lib/features/auth/presentation/sign_in_screen.dart`,
  `sign_up_screen.dart` (three options side by side: Continue with Google, Continue
  with Apple, email + password — "no user is turned away"); `application/auth_controller.dart`
  (`AsyncNotifier`); register routes; add a redirect in `app_router.dart` so
  unauthenticated users land on welcome/sign-in and authenticated users reach the
  shell. Wire the welcome screen's two TODO buttons.
- **DB:** none.
- **Tests:** widget tests (all three options render; validation copy is helper-voice)
  + controller tests against `FakeAuthRepository`.
- **Done when:** redirect logic is covered by a router test; copy is sentence case
  ("welcome back — let's pick up where you left off").
- **Deps:** 1.3.

#### Stage 1.5 — Connectivity abstraction
- **Spec:** §3.13 (online/offline detection drives sync + reassurance).
- **Scope:** `lib/core/connectivity/connectivity_service.dart` (interface +
  `Stream<bool> onlineChanges` / `Future<bool> isOnline`),
  `fake_connectivity_service.dart`, a real impl behind the interface (add
  `connectivity_plus`; real impl untested on host), `connectivityProvider`.
- **DB:** none. **Package:** `connectivity_plus` (real path device-only; fake for tests).
- **Tests:** consumers drive the fake to simulate online↔offline transitions.
- **Done when:** nothing depends on the concrete impl directly — only the interface.
- **Deps:** 1.2.

#### Stage 1.6 — Offline sync engine
- **Spec:** §3.13 (capture now, sync later — flush queue on reconnect).
- **Scope:** `lib/data/sync/sync_engine.dart` — reads existing Drift `SyncQueue`,
  dispatches each row to a registered handler keyed by `entity`, increments
  `attempts` with backoff, removes on success, listens to `connectivityProvider` to
  flush on reconnect. `sync_handler.dart` (handler interface) +
  `sync_engine_provider.dart`. Feature repositories register handlers later.
- **DB:** none (reuses `SyncQueue`; uses `AppDatabase.forTesting` for tests).
- **Tests:** in-memory Drift + fake handler + fake connectivity: queued op flushes on
  reconnect, failed op increments attempts and is retried, succeeded op is removed.
- **Done when:** the engine never drops a queued item on failure; offline writes are
  never lost.
- **Deps:** 1.1, 1.2, 1.5.

#### Stage 1.7 — Repository foundations + ChildRepository
- **Spec:** §3.1/§3.2 (children are the shared centre).
- **Scope:** establish the repository pattern: `lib/features/people/data/child_repository.dart`
  (interface: watch/list/get/create/update children for the current user),
  `supabase_child_repository.dart` (reads via Supabase, **writes via the Drift sync
  queue** so creation works offline + registers a sync handler with the engine),
  `fake_child_repository.dart`, `childRepositoryProvider`.
- **DB:** none (reuses `children` + `child_guardians`; creating a child also inserts
  the guardian link for the current user).
- **Tests:** fake repo CRUD; offline create enqueues to `SyncQueue` (in-memory Drift)
  and is picked up by the sync engine handler.
- **Done when:** a child created offline appears locally and flushes on reconnect; the
  guardian link is always written so the creator is a guardian.
- **Deps:** 1.1, 1.6.

#### Stage 1.8 — Entitlement / PlanGate provider
- **Spec:** §4 pricing table; CLAUDE.md "single capability check".
- **Scope:** `lib/core/entitlement/plan_limits.dart` (Free limits: children 4, pets 2,
  helpers 1, connections 5, voice adds 10/mo, storage 1 GB; Premium: unlimited /
  25 GB), `entitlement.dart` (current `Plan` + `bool can(Capability)` +
  `bool withinLimit(...)`), `entitlement_provider.dart` (defaults to Free; a fake
  source for tests; real billing source is `TODO(human-review)` — no real IAP),
  `plan_gate.dart` (widget that shows a gentle upgrade nudge when a capability is
  Premium-only). Helper-voice upsell copy ("this one's part of Premium — here's what
  it unlocks").
- **DB:** none (plan stored on profile / settings later; default Free for now).
- **Tests:** limit checks for each capability at Free vs Premium; `PlanGate` renders
  child when allowed and the nudge when gated.
- **Done when:** there is exactly one entitlement entry-point; no `if (isPremium)`
  anywhere else in the codebase (reviewer checks this each later stage).
- **Deps:** 1.1.

#### Stage 1.9 — App shell + bottom navigation
- **Spec:** §3.14 (the app's navigational spine).
- **Scope:** `lib/features/shell/presentation/app_shell.dart` — a `StatefulShellRoute`
  (go_router) with tabs: Today, Calendar, People, Vault, Settings (placeholders where
  features don't exist yet). Register in `app_router.dart` behind the auth-gate.
- **DB:** none.
- **Tests:** widget test — tabs render, switching preserves state, labels are
  sentence case.
- **Deps:** 1.4.

#### Stage 1.10 — Today/home screen skeleton
- **Spec:** §3.13/§3.7 (the calm landing surface).
- **Scope:** `lib/features/today/presentation/today_screen.dart` +
  `application/today_controller.dart` — reads today's events from `ChildRepository`
  (and later the unified store), shows a warm greeting + empty state placeholder
  ("today's looking open — enjoy the breathing room"). Slots reserved for load meter,
  next event, reminders.
- **DB:** none.
- **Tests:** controller maps events → today view; widget shows greeting + empty state.
- **Deps:** 1.7, 1.9.

#### Stage 1.11 — Event repository + manual event create/edit
- **Spec:** §3.5 (the normalized event store), §3.13 (capture now, sync later),
  §3.3/§4 ("…or add it by hand" when voice quota is reached — manual entry must exist
  independent of voice). Closes the gap where every event path was voice-only.
- **Scope:** `lib/features/calendar/data/event_repository.dart` (interface:
  watch/list/get/create/update/delete `FamilyEvent` for a child),
  `supabase_event_repository.dart` (reads via Supabase, **writes via the Drift sync
  queue** so create/edit work offline + registers a sync handler with the engine,
  mirrors into `CachedEvents`), `fake_event_repository.dart`, `eventRepositoryProvider`;
  plus `lib/features/calendar/presentation/event_editor_screen.dart` +
  `application/event_editor_controller.dart` — a plain new-event / edit-event form
  (who/title/date/time/location), offline-safe, sentence-case helper copy. The voice
  confirmation window (4.4), unified timeline (6.4), and the manual dead-end (6.7) all
  reuse this repository rather than each minting their own event-write path.
- **DB:** none (reuses `child_events` + Drift `CachedEvents` + `SyncQueue`).
- **Tests:** fake repo CRUD; offline create/edit enqueues to `SyncQueue` (in-memory
  Drift) and flushes on reconnect via the sync engine; editor controller validates only
  the minimum (title + start) and writes through the repo.
- **Done when:** there is one event-write path (the repository/queue) reused everywhere;
  a manual event created offline appears locally and flushes on reconnect.
- **Deps:** 1.1, 1.6, 1.7.

### Phase 2 — Onboarding & guided family setup (§3.1)

#### Stage 2.1 — Welcome flow (3 intro slides)
- **Spec:** §3.1 welcome flow.
- **Scope:** evolve `welcome_screen.dart` into a 3-slide swipeable, skippable
  carousel under `lib/features/onboarding/presentation/`: (1) "Every loose end,
  finally gathered." (2) "One schedule for everyone." (3) "Like having your mom in
  your pocket." Each skippable; final CTA → account creation / guided setup.
- **DB:** none.
- **Tests:** widget test — three slides, skip works, copy sentence case, routes onward.
- **Deps:** 1.4.

#### Stage 2.2 — Guided setup step 1: first child
- **Spec:** §3.1 (name, age/birthday, colour/avatar; nothing more required) + clear
  "skip for now".
- **Scope:** `lib/features/onboarding/presentation/setup_child_screen.dart` +
  `application/family_setup_controller.dart`; creates a child via `ChildRepository`
  (offline-safe). Avatar/colour picker uses theme colours.
- **DB:** none (reuses `children`).
- **Tests:** controller creates child with minimal fields; widget validates only name;
  skip advances without writing.
- **Deps:** 1.7, 2.1.

#### Stage 2.3 — Guided setup step 2: first pet (+ PetRepository)
- **Spec:** §3.1 (skippable; name + type).
- **Scope:** `lib/features/people/data/pet_repository.dart` (interface/Supabase/fake,
  offline-safe like ChildRepository, inserts `pet_guardians` link),
  `petRepositoryProvider`; `setup_pet_screen.dart`.
- **DB:** none (reuses `pets` + `pet_guardians`).
- **Tests:** fake pet repo CRUD; offline create enqueues; skip advances.
- **Deps:** 1.6, 2.2.

#### Stage 2.4 — Guided setup step 3: connect first app (placeholder)
- **Spec:** §3.1 (skippable connect step).
- **Scope:** `setup_connect_screen.dart` — warm explanation + "connect an app" and
  "skip for now"; links to the (later) connected-apps page or finishes setup.
- **DB:** none.
- **Tests:** widget — skip finishes setup; connect routes to placeholder.
- **Deps:** 2.3.

#### Stage 2.5 — Pinned setup home base (checklist + progress ring)
- **Spec:** §3.1 pinned setup home base (People & pets; Apps to connect; Yearly &
  repeating reminders; Items to capture; progress ring; "antidote to a blank slate").
- **Scope:** `lib/features/onboarding/presentation/setup_home_base_screen.dart` +
  `application/setup_progress_controller.dart`. Progress is **derived** from real data
  (children/pets present, connections present, etc.); manually-dismissible items
  stored locally in Drift (a small `SetupChecklistState` table, schema bump). Reachable
  any time from Today/Settings.
- **DB:** Drift local table only (no Supabase table needed → no new migration).
  `TODO(human-review): confirm setup progress need not sync across a user's devices.`
- **Tests:** progress recomputes as children/pets/connections appear; dismissals persist.
- **Deps:** 2.3, 1.10.

### Phase 3 — People, co-parent & village sharing (§3.2)

#### Stage 3.1 — People hub screen
- **Spec:** §3.2 (the shared centre + who can see what).
- **Scope:** `lib/features/people/presentation/people_hub_screen.dart` +
  `application/people_controller.dart` — lists children, pets, the co-parent, and
  village helpers; entry points to each detail/invite flow. Empty state nudges first
  child.
- **DB:** none.
- **Tests:** controller aggregates children+pets+helpers; widget renders sections +
  empty state.
- **Deps:** 1.7, 2.3.

#### Stage 3.2 — Child profile detail + extended fields
- **Spec:** §3.1 "available to add later" (school, grade, teacher; doctor & dentist;
  activities & teams).
- **Scope:** `child_profile_screen.dart` + `child_profile_controller.dart`; extend the
  `Child` model + `ChildRepository` with the new fields; activities as a child table.
- **DB:** **migration `0002_child_profile_extras.sql`** — add columns to `children`
  (`school`, `grade`, `teacher`, `physician`, `dentist`, `avatar`) and a new
  `child_activities` table (id, child_id, name, team, schedule_note) **with RLS**
  (guardians read/write; helper read only if `sports` toggle — via
  `helper_child_can(child_id,'sports')`). Existing `children` RLS already covers new
  columns. Re-run `build_runner` not needed (no Drift change) unless models cached.
- **Tests:** repo round-trips new fields; activities CRUD against fake; RLS intent
  documented in SQL comments.
- **Done when:** new table has RLS in the same migration; helpers can't see activities
  without the sports toggle.
- **Deps:** 1.7, 3.1.

#### Stage 3.3 — Protected safety-floor editors
- **Spec:** §3.2 protected floor (allergies, current medications, emergency contacts —
  always visible to every guardian, never toggle-off).
- **Scope:** repositories + editor screens for `child_allergies`,
  `child_medications`, `child_emergency_contacts`
  (`lib/features/people/data/...`, `.../presentation/safety_floor_screen.dart`).
  UI must visibly mark these as always-shared with the co-parent (calm copy: "both of
  you always see this — safety first").
- **DB:** none (reuses the three existing tables + their RLS).
- **Tests:** fake repos CRUD; widget shows the always-shared affordance and offers no
  toggle to hide from a guardian.
- **Done when:** no code path lets a guardian hide floor data from another guardian.
- **Deps:** 1.7, 3.1.

#### Stage 3.4a — Co-parent invite + `InviteSender`
- **Spec:** §3.2 (two independent identities; the children are the shared centre; invite
  a co-parent by email or shareable link — the parent's choice per person).
- **Scope:** `lib/features/people/presentation/coparent_invite_screen.dart` +
  `application/invite_controller.dart`; an `InviteSender` interface (email or link; real
  send stubbed behind the interface) + fake; accepting an invite links the co-parent as
  a guardian of the shared child. Both identities always exist independently.
- **DB:** **migration `0003_invitations.sql`** —
  `invitations` (id, inviter_id, kind `'coparent'|'helper'`, target_child_id null,
  target_pet_id null, email null, token, expires_at, accepted_at) **with RLS** (inviter
  manages own rows; invitee reads a single row by token via a SECURITY DEFINER lookup —
  never the whole table).
- **Tests:** invite creates a token row; fake `InviteSender` is called with email/link;
  accept links the guardian; RLS intent documented in SQL.
- **Done when:** new table has RLS; invitee can resolve only their own token, not list
  invitations. `TODO(human-review): legal sign-off on invite-by-link expiry + child-data
  exposure (COPPA/PIPEDA/GDPR).`
- **Deps:** 1.7, 3.1.

#### Stage 3.4b — Combined/Separate mode + per-category sharing toggles
- **Spec:** §3.2 (Combined default-ON vs Separate default-OFF-except-floor; per-category
  toggles each parent controls their own side; sharing never forced equal; calm switch
  copy "each parent now controls what they share"; switching never rebuilds data).
- **Scope:** `household_mode_screen.dart`, `sharing_toggles_screen.dart` +
  `application/sharing_controller.dart`. Combined/Separate is a single switch that flips
  toggle **defaults** but never deletes or rebuilds underlying data; the protected floor
  always flows in either mode.
- **DB:** **migration `0003b_sharing_prefs.sql`** —
  `parent_sharing_prefs` (parent_id, category `'personal_schedule'|'child_schedules'|
  'reminders'|'notifications'|'village'`, shared bool) **with RLS** (own rows only); add
  `household_mode` (`'combined'|'separate'`) to `profiles`. Floor categories are **not**
  representable here (they can never be turned off).
- **Tests:** mode switch flips defaults and keeps the floor on regardless of mode; one
  parent's prefs never alter the other's; prefs RLS intent documented.
- **Done when:** switching mode never deletes/rebuilds shared data; floor unaffected;
  new table has RLS.
- **Deps:** 3.4a, 1.8.

#### Stage 3.5 — Village helper invite + live "what a helper sees" preview
- **Spec:** §3.2 village helpers (per child + per pet; the exact toggle list; vault &
  insights & private life never shared; **live preview before saving**; invite by
  email or link).
- **Scope:** `helper_invite_screen.dart`, `helper_access_toggles_screen.dart`,
  `helper_preview.dart` (a component that renders exactly the fields a helper would
  see given current toggles, computed from the same rules as RLS),
  `application/helper_access_controller.dart`. Child toggles: schedule & activities;
  allergies & medical alerts; physician & emergency; sports & team; shared notes.
  Pet toggles: feeding; walks/potty; daycare pickup/dropoff; meds & vet; photo wall.
- **DB:** none (reuses `helper_child_access` / `helper_pet_access` + invitations from
  0003). A `'share_with_helpers'` note flag lives on the note record — if notes get a
  table later it carries this flag with RLS.
- **Tests:** preview shows only toggled-on fields and **never** vault/insights/private;
  toggling updates the access rows; helper limited to invited child/pet only.
- **Done when:** the live preview matches the RLS rules exactly; vault/insights are
  unreachable in the preview under any toggle combination.
- **Deps:** 3.4b, 2.3.

#### Stage 3.6 — Sharing-resolution layer + defensive floor enforcement
- **Spec:** §3.2 (one parent sharing never forces the other; floor always flows).
- **Scope:** `lib/features/people/application/visibility_resolver.dart` — a pure-Dart
  function that, given viewer + subject + toggles + household mode, returns the visible
  field set. App-layer mirror of RLS (defence in depth; RLS remains the real gate).
- **DB:** none.
- **Tests:** exhaustive matrix — guardian sees everything incl. floor; helper sees only
  toggled fields; floor always visible to guardians regardless of mode; vault/insights
  never resolved for helpers.
- **Deps:** 3.4b, 3.5.

#### Stage 3.7 — Child notes: capture + "share with helpers" flag
- **Spec:** §3.2 (child toggle "notes specifically flagged 'share with helpers'" — the
  `can_see_shared_notes` column + `helper_child_can(...,'shared_notes')` already exist in
  `0001_init.sql`) and §3.13 (adding notes, queued to sync). Closes the gap where the
  shared-notes toggle gated nothing and note capture never shipped.
- **Scope:** `lib/features/notes/data/note_repository.dart` (interface/Supabase/fake,
  offline-safe via the sync queue) + `presentation/note_editor_screen.dart` +
  `application/note_controller.dart`. Each note has a `share_with_helpers` flag (default
  **off** — conservative). The helper preview (3.5) and visibility resolver (3.6) show a
  note to a helper ONLY when the note's `share_with_helpers` is on AND that helper has the
  `shared_notes` toggle; otherwise it stays family-private. Notes are never part of the
  vault and never auto-shared.
- **DB:** **migration `0003c_child_notes.sql`** — `child_notes` (id, child_id, author_id,
  body, share_with_helpers bool default false, created_at, updated_at) **with RLS**:
  guardians of the child read/write; a helper may read a row ONLY when
  `share_with_helpers = true AND public.helper_child_can(child_id, 'shared_notes')`;
  default-deny otherwise.
- **Tests:** fake repo CRUD; offline create enqueues + flushes; a note with the flag off
  is invisible to a helper even with the toggle on; a flagged note is visible only with
  the toggle on; the 3.5 preview reflects this exactly.
- **Done when:** new table has RLS encoding the double-gate; default is family-private; no
  path leaks an unflagged note to a helper.
- **Deps:** 3.5, 3.6.

### Phase 4 — Voice-to-calendar (§3.3)

#### Stage 4.1 — Speech-to-text abstraction
- **Spec:** §3.3 (device STT captures audio; offline memos queued, transcribed on
  reconnect).
- **Scope:** `lib/features/voice/data/stt_service.dart` (interface: start/stop, returns
  a transcript + per-segment confidence), `fake_stt_service.dart` (scripted
  transcripts), a stub real impl behind the interface (`TODO(human-review)`: wire
  `speech_to_text`/native STT on device). `sttServiceProvider`.
- **DB:** none. **Package:** `speech_to_text` (parked, native/device).
- **Tests:** fake produces deterministic transcripts + confidences; offline path
  queues an un-transcribed memo for later.
- **Deps:** 1.6.

#### Stage 4.2 — Event-parsing abstraction
- **Spec:** §3.3 technical (cloud AI parses NL into who/type/date/time/location/notes
  with confidence).
- **Scope:** `lib/features/voice/data/event_parser.dart` (interface: `transcript →
  ParsedEvent` where each field carries a confidence), `parsed_event.dart` domain
  model, `fake_event_parser.dart` (deterministic rule-based parser good enough for
  tests + offline-ish demo), stub cloud-LLM impl behind the interface
  (`TODO(human-review)`: real LLM endpoint + key). `eventParserProvider`.
- **DB:** none. **Service:** cloud LLM parked.
- **Tests:** fake parser extracts who/when/where + flags low-confidence fields (e.g.
  "2pm or 2am?") deterministically.
- **Deps:** 1.1.

#### Stage 4.3 — Voice capture screen + guided adaptive prompt
- **Spec:** §3.3 guided mic prompt (who/what-day/what-time/where checklist; full for
  first several memos, then a one-line hint); offline memos queued.
- **Scope:** `lib/features/voice/presentation/voice_capture_screen.dart` +
  `application/voice_capture_controller.dart`; uses `SttService`; tracks memo count to
  fade the checklist; offline capture shows "got it — saved on your phone. I'll add
  this the moment you're back online."
- **DB:** none (queued memo via SyncQueue / local).
- **Tests:** checklist shows in full early, collapses after N; offline capture enqueues
  and shows reassurance copy.
- **Deps:** 4.1, 1.6.

#### Stage 4.4 — Confirmation window
- **Spec:** §3.3 confidence highlighting + soft clarifying question + Accept/Edit/
  Delete + tap-or-speak editing (nothing saved until accepted).
- **Scope:** `voice_confirm_screen.dart` + controller; renders `ParsedEvent` with
  confident fields plain and uncertain fields gently highlighted; a clarifying prompt
  appears for important ambiguous fields; Accept writes the event (offline-safe via
  the event store/queue), Edit allows tap or mic correction, Delete discards.
- **DB:** none (writes a `child_events` row through the repository/queue).
- **Tests:** nothing persists before Accept; low-confidence field renders the
  clarifier; Accept enqueues the event; Delete writes nothing.
- **Deps:** 4.2, 4.3, 1.7, 1.11 (reuses the single event-write path).

#### Stage 4.5 — Recurring events + post-accept conflict catch
- **Spec:** §3.3 recurring events ("every Tue & Thu until July" → clear rule, full
  date list shown before saving; conflict manager catches clashes after acceptance,
  e.g. a holiday).
- **Scope:** `lib/features/voice/application/recurrence.dart` (parse a recurrence
  phrase → RRULE-ish rule + expanded date list), preview UI showing every date before
  save; after accept, run the conflict checker (shared with §3.5/§3.6) and surface
  clashes.
- **DB:** **migration `0004_event_recurrence.sql`** — add `recurrence_rule text` and
  `recurrence_parent_id uuid` to `child_events` (RLS inherited from the table).
- **Tests:** phrase → correct date list; preview lists all dates; an accepted series
  with a known clash raises a conflict flag.
- **Deps:** 4.4.

#### Stage 4.6 — Voice-add monthly quota gating (Free 10/mo)
- **Spec:** §4 (Free 10 voice adds/month; Premium unlimited).
- **Scope:** `voice_quota.dart` in `application/` — counts accepted voice adds in the
  current month; gates the Accept action through the entitlement provider; Premium is
  unlimited. Calm at-limit copy ("you've used this month's quick voice adds — Premium
  lifts the cap, or add it by hand").
- **DB:** none (count derived from events with `source='voice'` in the month; a local
  counter mirror is acceptable).
- **Tests:** at 10/mo Free the Accept is gated; Premium never gated; counter resets by
  month.
- **Deps:** 4.4, 1.8.

### Phase 5 — Document vault (§3.4)

#### Stage 5.1 — Vault models + DocumentRepository
- **Spec:** §3.4 (per-profile store; family-only; never shared with the village).
- **Scope:** `lib/features/vault/data/document_repository.dart`
  (interface/Supabase/fake) — list/get/upload-metadata/delete documents per child;
  storage object key + metadata (folder, title, expires_on). `documentRepositoryProvider`.
- **DB:** none (reuses `child_documents`; vault-only RLS already shipped — guardians
  only, never helpers).
- **Tests:** fake repo CRUD; the repo exposes no helper-readable path (vault is
  family-only).
- **Deps:** 1.7.

#### Stage 5.2 — Vault screen: folders + list + empty state
- **Spec:** §3.4 (pre-built folders: Artwork, Report cards, Medical, Sports) + §3.15
  gentle-nudge empty state.
- **Scope:** `vault_screen.dart` + `vault_controller.dart`; folder chips; document
  list; gentle empty state ("this is where the important papers live — add the first
  when you're ready").
- **DB:** none.
- **Tests:** folders render; documents group by folder; empty state shows one CTA.
- **Deps:** 5.1.

#### Stage 5.3 — Upload flow + expiry-at-filing prompt
- **Spec:** §3.4 (upload by photo/PDF/scan; Free expiry prompt at filing "does this
  expire? when?").
- **Scope:** `upload_document_sheet.dart` + controller; a `FilePicker`/`Scanner`
  interface (`lib/features/vault/data/file_source.dart`) + fake; real
  `image_picker`/`file_picker` impl behind the interface (parked for device). Upload
  goes through the repository (offline-safe via queue); a gentle expiry prompt captures
  `expires_on`.
- **DB:** none. **Packages:** `file_picker`/`image_picker` (parked, device).
- **Tests:** fake file source returns a file; upload enqueues metadata + storage put;
  expiry prompt persists the date; works offline.
- **Deps:** 5.1, 1.6.

#### Stage 5.4 — Free search (name + filter chips)
- **Spec:** §3.4 Free search (by name + filter chips: person, type, date).
- **Scope:** `vault_search.dart` (pure-Dart filter over document metadata) + search UI
  with chips; no content search here.
- **DB:** none.
- **Tests:** filters by person/type/date and name substring; combinations compose.
- **Deps:** 5.2.

#### Stage 5.5 — Secure expiring share link
- **Spec:** §3.4 secure sharing (one file; link expires after 7 days OR a couple of
  views, whichever first; view-only; rest of vault stays private).
- **Scope:** `share_document_sheet.dart` + `document_share_repository.dart`; the
  Dart side requests a share via the repository; the actual link/token is minted
  server-side. View-only, single-file.
- **DB:** **migration `0005_document_shares.sql`** — `document_shares` (id,
  document_id, created_by, token, expires_at, max_views, view_count, created_at)
  **with RLS** (creator manages own; the public read path is a SECURITY DEFINER
  function that validates token + not-expired + view_count<max_views and increments
  views — never exposes the table directly; never the rest of the vault).
  `TODO(human-review): the link's public fetch belongs in a Supabase Edge Function
  (server-side) — Dart side is built + tested against a fake; wire the function later.`
- **Tests:** fake share repo returns a share; expiry-by-time and expiry-by-views logic
  unit-tested in Dart; only the one document is referenced.
- **Done when:** new table has RLS; no policy exposes other vault docs; share is
  view-only.
- **Deps:** 5.1.

#### Stage 5.6 — Expiry & renewal tracking (Free)
- **Spec:** §3.4 Free expiry tracking (smart prompts at filing already in 5.3; remind
  well ahead; surface upcoming expiries).
- **Scope:** `expiry_tracker.dart` (pure Dart — given documents with `expires_on`,
  compute "expiring soon" with lead time) + an "expiring soon" list view; feeds a
  reminder later (§3.6). Colour-coded urgency uses theme amber/sage.
- **DB:** none.
- **Tests:** lead-time windows; ordering by urgency; colour mapping via theme tokens.
- **Deps:** 5.3.

#### Stage 5.7 — Premium vault content search (OCR behind interface)
- **Spec:** §3.4 Premium content search (reads inside docs incl. scanned images;
  "scan_004.jpg" still found; set expectations gently — clearer scans search better).
- **Scope:** `text_recognizer.dart` interface (`bytes → recognised text`) + fake;
  store recognised text alongside the document for search; extend `vault_search` to
  search content when Premium (gated via entitlement). Stub real ML Kit impl.
- **DB:** add an `ocr_text` column to `child_documents` via the same or a small
  migration `0005`-adjacent (note: fold into a `0005b`/extend 0005 if 0005 not yet
  applied; otherwise new `0005a_document_ocr.sql`) **with RLS inherited**. Gentle copy
  about scan quality.
- **Tests:** fake recognizer text is searchable; content search gated to Premium;
  Free still gets name+filters only.
- **Done when:** content search only runs for Premium (single entitlement check).
  **Package:** `google_mlkit_text_recognition` (parked, device). `TODO(human-review)`.
- **Deps:** 5.4, 1.8.

#### Stage 5.8 — Premium auto-read expiry (OCR behind interface)
- **Spec:** §3.4 Premium expiry (auto-read the expiry date inside the document, ask to
  confirm; surface "expiring soon" colour-coded).
- **Scope:** `expiry_extractor.dart` (pure Dart — find a plausible date in recognised
  text) consuming the `text_recognizer` output; a confirm-the-date prompt; Premium-gated.
- **DB:** none (reuses `expires_on` + ocr text).
- **Tests:** date extraction from sample recognised text; confirm flow writes
  `expires_on`; gated to Premium.
- **Deps:** 5.7, 5.6.

### Phase 6 — Connected apps & schedule sync (§3.5)

#### Stage 6.1 — Connection model + CalendarSource + real iCal parser
- **Spec:** §3.5 (iCal-link paste for studios/school boards; one unified store).
- **Scope:** `lib/features/connections/data/calendar_source.dart` (interface: fetch +
  normalize to `FamilyEvent`), `ical_feed_parser.dart` (real pure-Dart VEVENT/iCal
  parsing — DTSTART/DTEND/SUMMARY/LOCATION/RRULE), `connection_repository.dart`
  (interface/Supabase/fake). Normalizes into the existing event shape.
- **DB:** **migration `0006_connected_sources.sql`** — `connected_sources` (id,
  child_id, owner_id, kind `'ical'|'signin'`, provider, ical_url, status
  `'ok'|'broken'`, last_synced_at) **with RLS** (guardians of the child read/write;
  helpers never).
- **Tests:** parse a sample iCal string → events; broken feed → graceful empty + error;
  fake connection repo CRUD.
- **Done when:** new table has RLS; parser is pure Dart (no network in tests).
- **Deps:** 1.1, 1.7.

#### Stage 6.2 — Sign-in connect abstraction (OAuth connectors)
- **Spec:** §3.5 (sign-in connect for apps with API e.g. TeamSnap; "you type your
  password on their secure screen, never here"; read-only).
- **Scope:** extend `CalendarSource` with an OAuth-backed connector interface +
  `fake_signin_connector.dart`; stub real connectors (TeamSnap/Google/Outlook) behind
  the interface. No real OAuth at build time.
- **DB:** none (reuses `connected_sources`).
- **Tests:** fake connector returns normalized events; read-only is enforced in the
  interface contract. `TODO(human-review): real OAuth client ids/secrets + redirect
  handling (device).`
- **Deps:** 6.1.

#### Stage 6.3 — Guided connection flow UI
- **Spec:** §3.5 guided connection (warm reassurance; which child; read-only) + §3.15.
- **Scope:** `connect_app_screen.dart` + `connection_controller.dart` — choose method
  (sign-in vs paste iCal link), pick the child, reassurance copy, add the source. Wire
  the onboarding step-3 placeholder here.
- **DB:** none.
- **Tests:** both methods reachable; child selection required; reassurance copy present
  and sentence case.
- **Deps:** 6.1, 6.2.

#### Stage 6.4 — Unified normalized timeline
- **Spec:** §3.5 unified view (all sources, colour-coded by origin, one timeline) +
  §3.13 offline (reads from the Drift `CachedEvents` mirror).
- **Scope:** `lib/features/calendar/presentation/calendar_screen.dart` +
  `application/unified_timeline_controller.dart` — merge events from all sources +
  manual + voice into one day/list timeline, colour-coded by `source` using theme
  tokens; reads offline from `CachedEvents`.
- **DB:** none (reuses `child_events` + Drift `CachedEvents`).
- **Tests:** merge from multiple sources ordered by time; colour mapping by origin;
  reads from the local cache offline.
- **Deps:** 6.1, 1.10, 1.11.

#### Stage 6.5 — Duplicate detection (smart blend)
- **Spec:** §3.5 (exact-match duplicates — same child/title/time/place — merge
  automatically with a quiet note; less-certain flagged for the user).
- **Scope:** `duplicate_detector.dart` (pure Dart — exact-match key + fuzzy
  near-match score); auto-merge exact with a quiet note; surface uncertain pairs for a
  merge / keep-both decision in the timeline.
- **DB:** none.
- **Tests:** exact matches auto-merge; near matches flagged not merged; non-matches
  untouched.
- **Deps:** 6.4.

#### Stage 6.6 — Conflict detection (overlap) inline
- **Spec:** §3.5 (conflicts shown inline) + feeds §3.6 conflict alerts.
- **Scope:** `conflict_detector.dart` (pure Dart — overlapping events for the same
  child / same caregiver window) + inline conflict markers in the timeline. Shared by
  voice recurrence (4.5) and notifications (7.5).
- **DB:** none.
- **Tests:** overlapping events flagged; back-to-back not flagged; shared by 4.5/7.5.
- **Deps:** 6.4.

#### Stage 6.7 — Broken-sync banner + manual dead-end + wishlist
- **Spec:** §3.5 (gentle banner when a connection breaks; notify if broken >1–2 days;
  banner links to reconnect; graceful dead-end → manual entry + prioritized
  integration wishlist).
- **Scope:** broken-sync banner component (calm copy) linking to the connected-apps
  page; a "tell us which app you wanted" capture → wishlist; schedule a notify-after-a-
  day hook (via §3.6 service).
- **DB:** **migration `0007_integration_wishlist.sql`** — `integration_wishlist` (id,
  requester_id, app_name, note, created_at) **with RLS** (requester reads/writes own
  rows). Broken `status` already on `connected_sources` (0006).
- **Tests:** banner shows when `status='broken'`; wishlist write via fake; notify
  scheduled when broken age exceeds threshold.
- **Deps:** 6.3, 7.1.

#### Stage 6.8 — Connection-count gating (Free 5)
- **Spec:** §4 (Free 5 connections; Premium unlimited).
- **Scope:** gate adding a 6th connection through the entitlement provider with a
  gentle upgrade nudge; Premium unlimited.
- **DB:** none.
- **Tests:** Free blocks the 6th with helper-voice copy; Premium allows; single
  entitlement check.
- **Deps:** 6.3, 1.8.

### Phase 7 — Notifications & reminders (§3.6)

#### Stage 7.1 — Notification scheduling abstraction
- **Spec:** §3.6 (timely reminders; push respecting prefs).
- **Scope:** `lib/features/notifications/data/notification_service.dart` (interface:
  schedule/cancel a local notification at a time with a payload), `fake_notification_service.dart`,
  stub real impl (FCM / local notifications) behind the interface. `notificationServiceProvider`.
- **DB:** none. **Service:** FCM/local-notifications parked (device + keys).
- **Tests:** fake records scheduled/cancelled notifications; payloads carry no
  sensitive data (redaction). `TODO(human-review): FCM project + APNs.`
- **Deps:** 1.2.

#### Stage 7.2 — Reminder rules engine (Free)
- **Spec:** §3.6 Free rhythm (evening-before heads-up + 1-hour-before same-day).
- **Scope:** `reminder_rules.dart` (pure Dart — given events, compute reminder times:
  evening-before + 1h-before) feeding `NotificationService`.
- **DB:** none.
- **Tests:** correct reminder times for sample events; respects all-day vs timed.
- **Deps:** 7.1, 6.4.

#### Stage 7.3 — Morning summary generator
- **Spec:** §3.6 (a gentle morning summary; present and caring, never noisy) + §2 tone.
- **Scope:** `morning_summary.dart` (pure Dart — compose a sentence-case helper-voice
  summary from the day's events + load; e.g. "good morning — three events today, and a
  calm afternoon. Ella's dentist is at 2."); scheduled via `NotificationService`.
- **DB:** none.
- **Tests:** summary text is sentence case, mentions counts, never scolds; empty day →
  reassuring line.
- **Deps:** 7.1, 6.4.

#### Stage 7.4 — Quiet hours + urgent-conflict override
- **Spec:** §3.6 (user-defined silent windows; single optional toggle "let urgent
  conflicts still reach me").
- **Scope:** `quiet_hours.dart` (suppression logic) + settings UI; the override toggle
  lets genuinely imminent conflicts break quiet.
- **DB:** **migration `0008_notification_prefs.sql`** — `notification_prefs` (user_id
  PK, posture, quiet_start, quiet_end, urgent_conflicts_break_quiet bool,
  morning_summary bool, evening_reminder bool, hour_before bool) **with RLS** (own row
  only).
- **Tests:** notifications inside quiet window suppressed unless urgent-conflict +
  toggle on; prefs RLS intent documented.
- **Deps:** 7.1.

#### Stage 7.5 — Conflict alerts (distinct amber)
- **Spec:** §3.6 (visually distinct amber "needs a decision" caution bar + inline
  action buttons; never mistaken for a routine nudge).
- **Scope:** conflict-alert component (theme amber bar + inline actions: keep both /
  reschedule / dismiss) consuming `conflict_detector` (6.6); surfaced in Today/timeline
  and as a distinct notification category.
- **DB:** none.
- **Tests:** conflict renders the amber bar with actions; a routine reminder does not;
  actions resolve the conflict.
- **Deps:** 6.6, 7.1.

#### Stage 7.6 — Premium smart live-traffic reminders
- **Spec:** §3.6 Premium ("leave in 10 minutes; slowdown on the 403; 28-min drive";
  needs location + Maps; if location declined, fall back to the 1-hour reminder — no
  one shut out).
- **Scope:** `travel_time_service.dart` interface (origin/destination/leave-by →
  drive estimate) + fake; `location_service.dart` interface + fake; a "leave by"
  reminder computed from the estimate; graceful fallback to the Free 1-hour reminder
  when location is declined or unavailable. Premium-gated. Stub real Maps/geolocator.
- **DB:** none. **Packages:** `google_maps_flutter`, `geolocator` (parked, device+key).
- **Tests:** with a fake travel estimate the leave-by time is correct; declined
  location falls back to 1-hour; gated to Premium. `TODO(human-review): Maps API key +
  location permission strings.`
- **Deps:** 7.2, 1.8.

### Phase 8 — Intelligence (§3.7)

#### Stage 8.1 — Calm load-meter scoring engine
- **Spec:** §3.7 (weigh event count, travel between events, breathing room, unresolved
  items, whether protected time survived; explain in plain words; never a mysterious
  number).
- **Scope:** `lib/features/insights/application/load_meter.dart` (pure Dart — inputs:
  day's events, travel gaps, unresolved conflicts/items, protected-time blocks →
  a calm/full score + a plain-words explanation list).
- **DB:** none.
- **Tests:** a heavy day scores higher with the right explanation strings ("6 events,
  lots of driving, your creative time got squeezed"); a light day reads calm.
- **Note:** no feature yet produces explicit "protected-time blocks"; the scorer treats
  that factor as gracefully absent (contributes zero / "couldn't tell") until a
  protected-time source exists, rather than fabricating it. `TODO(human-review): seed
  protected-time from a future calendar block or settings preference.`
- **Deps:** 6.4.

#### Stage 8.2 — Load-meter UI
- **Spec:** §3.7 (daily/weekly read; tapping explains the score in plain words).
- **Scope:** `load_meter_card.dart` on Today + a weekly view; tap → plain-words
  explanation sheet. Theme colours (sage calm → amber full). Sentence-case copy.
- **DB:** none.
- **Tests:** widget shows the score + tappable explanation; colour reflects level via
  theme.
- **Deps:** 8.1, 1.10.

#### Stage 8.3 — Insight engine (Free basic)
- **Spec:** §3.7 (warm "getting to know you" state; immediate value day one — "your
  calmest day this week is Thursday"; clearly shows deeper insights unlocking; never
  empty, never fake) + §3.15 reveal-the-value empty state.
- **Scope:** `insight_engine.dart` (pure Dart — from available events compute simple
  honest insights, e.g. calmest day, busiest day) + an insights screen showing
  current insights and clearly-locked future ones. Free = basic weekly summary.
- **DB:** none.
- **Tests:** calmest/busiest day computed correctly; new-user empty state previews
  value without fabricating data.
- **Deps:** 8.1.

#### Stage 8.4 — Predictive annual patterns
- **Spec:** §3.7 (manual seeding works day one; history discovery grows over time;
  heads-up 1–2 months ahead; e.g. "hockey tryouts landed in mid-April two years
  running — remind you next year?").
- **Scope:** `annual_patterns.dart` (pure Dart — manual seed model + a discovery pass
  over historical events that finds yearly recurrence) + a seed/list screen + a
  heads-up surfaced 1–2 months ahead via `NotificationService`.
- **DB:** **migration `0009_annual_patterns.sql`** — `annual_patterns` (id, owner_id,
  child_id null, label, month, source `'manual'|'discovered'`, confidence,
  created_at) **with RLS** (owner / guardians of the child read/write; helpers never).
- **Tests:** manual seed surfaces immediately; discovery finds a 2-year April pattern;
  heads-up scheduled at the right lead time.
- **Deps:** 8.1, 7.1.

#### Stage 8.5 — Full insight engine (Premium)
- **Spec:** §3.7 / §4 (full insight engine is Premium; Free is basic weekly summary).
- **Scope:** deeper insights (cross-week patterns, protected-time trends, travel load
  trends) gated to Premium through the entitlement provider; Free keeps the basic
  weekly summary; the locked previews in 8.3 unlock here.
- **DB:** none.
- **Tests:** deep insights appear only for Premium (single entitlement check); Free
  unchanged.
- **Deps:** 8.3, 1.8.

### Phase 9 — Photo wall & memory reels (Premium) (§3.8)

#### Stage 9.1 — Photo-wall data model + repository
- **Spec:** §3.8 (per-profile curated wall; not a camera roll; Premium-only).
- **Scope:** `lib/features/photos/data/photo_wall_repository.dart`
  (interface/Supabase/fake) — list/add/remove items per child or pet; storage key +
  taken_on date + caption.
- **DB:** **migration `0010_photo_walls.sql`** — `photo_wall_items` (id, child_id null,
  pet_id null, storage_path, taken_on date, caption, created_by, created_at; CHECK
  exactly one of child_id/pet_id) **with RLS** (guardians of the child/pet read/write;
  a helper may read **only** if the matching photo toggle is on —
  `helper_child_can(...,'photos')`-style for children via a new capability, and
  `helper_pet_access.can_see_photos` for pets). Vault remains separate and private.
- **Tests:** fake repo CRUD; child XOR pet enforced; RLS intent documented incl.
  helper photo toggle.
- **Done when:** new table has RLS honoring the per-helper photo toggle; this is not
  the vault.
- **Deps:** 1.7.

#### Stage 9.2 — Per-profile photo-wall UI (Premium-gated)
- **Spec:** §3.8 (curated highlight reel; auto-orders chronologically; explicitly not a
  camera roll) + §3.15 gentle nudge.
- **Scope:** `photo_wall_screen.dart` + `photo_wall_controller.dart` — chronological
  grid by `taken_on`; add via the `FilePicker` interface (reused from vault);
  Premium-gated via `PlanGate` with a warm upsell for Free; gentle empty state.
- **DB:** none.
- **Tests:** ordered by date; Premium-gated (Free sees the upsell); empty state nudge.
- **Deps:** 9.1, 1.8, 5.3.

#### Stage 9.3 — Memory stamp (date + note)
- **Spec:** §3.8 (each photo carries an editable date + a short "why this moment
  matters" note; date drives chronological order).
- **Scope:** memory-stamp editor on each item (editable date for old scans + caption);
  re-sorts on date change.
- **DB:** none (reuses `taken_on` + `caption`).
- **Tests:** editing the date re-orders; caption persists; old-scan date editable.
- **Deps:** 9.2.

#### Stage 9.4 — Select & export reels
- **Spec:** §3.8 (multi-select export in date order; per export choose captions/dates
  or photos-only to protect private notes).
- **Scope:** multi-select + `reel_exporter.dart` interface + fake (assembles selected
  photos in date order; include-or-exclude captions); stub the real share/export.
- **DB:** none.
- **Tests:** export order is by date; captions excluded when chosen (notes protected);
  fake exporter receives the right payload.
- **Deps:** 9.3.

#### Stage 9.5 — Per-helper photo-wall sharing toggle
- **Spec:** §3.8 (per person by toggle — dog-grandma sees pet photos, dog-walker does
  not; grandma sees a child's reel, sitter does not).
- **Scope:** surface the photo toggle in the helper access screen (3.5) for child and
  pet walls; live preview reflects it.
- **DB:** none (reuses `helper_pet_access.can_see_photos` + the child photo capability
  added in 0010).
- **Tests:** toggling photo access changes what the helper preview shows; off by
  default.
- **Deps:** 9.1, 3.5.

### Phase 10 — Lifelong memory handoff (Premium) (§3.9)

#### Stage 10.1 — Handoff package builder
- **Spec:** §3.9 (package a child's whole childhood — photo wall with stories, artwork,
  report cards, health history — as a curated archive, not a cold export).
- **Scope:** `lib/features/handoff/application/handoff_builder.dart` (pure Dart —
  assemble references to photo-wall items + vault artwork/report-cards + health
  history into a manifest) + a `handoff_exporter.dart` interface + fake; stub the real
  archive/export.
- **DB:** none (reads existing photo + vault + safety-floor data).
- **Tests:** the manifest includes the right categories; nothing private leaks beyond
  the child's own archive; fake exporter receives the manifest.
- **Deps:** 9.4, 5.1, 3.3.

#### Stage 10.2 — Ceremonial handoff UI
- **Spec:** §3.9 (an intentional, ceremonial moment — "give Ella her childhood, kept
  whole" — not a data export screen).
- **Scope:** `handoff_screen.dart` — warm ceremonial framing, preview of what's
  included, a single confident action; Premium-gated.
- **DB:** none.
- **Tests:** widget shows the ceremonial copy + preview; gated to Premium; export
  invokes the builder.
- **Deps:** 10.1, 1.8.

### Phase 11 — Auth & security hardening (§3.10)

#### Stage 11.1 — Password recovery (6-digit email code)
- **Spec:** §3.10 (a 6-digit code sent to the user's email).
- **Scope:** `recover_password_screen.dart` + controller using
  `AuthRepository.sendRecoveryCode`/`verifyRecoveryCode` (already on the interface);
  warm copy ("we sent a 6-digit code to your email — pop it in here").
- **DB:** none (Supabase auth handles OTP; real email send stubbed in the fake).
- **Tests:** request → verify happy path + wrong-code path against the fake.
- **Deps:** 1.3, 1.4.

#### Stage 11.2 — Biometric lock (default ON)
- **Spec:** §3.10 (Face ID / fingerprint required when reopening after being away;
  toggle in settings; protects sensitive data) + CLAUDE.md.
- **Scope:** `lib/core/security/biometric_service.dart` interface + fake + stub real
  (`local_auth`); an app-lifecycle gate that requires unlock on resume; default ON.
  Widgets/widget-bridge show only non-sensitive info until unlocked.
- **DB:** none. **Package:** `local_auth` (parked, device).
- **Tests:** on resume the gate requires unlock; success reveals the app; default-ON
  setting; fake authenticator drives success/failure. `TODO(human-review): platform
  biometric prompt strings + Info.plist/AndroidManifest entries.`
- **Deps:** 1.4.

#### Stage 11.3 — Device list + remote sign-out
- **Spec:** §3.10 (see all signed-in devices; remotely sign out a lost device).
- **Scope:** `devices_screen.dart` + `device_repository.dart` — list devices; a
  sign-out action revokes a device session.
- **DB:** **migration `0011_user_devices.sql`** — `user_devices` (id, user_id,
  device_name, platform, last_seen_at, created_at) **with RLS** (own rows only).
  `TODO(human-review): remote revoke of another device's session needs a server
  function/admin API — Dart side built + tested against a fake.`
- **Tests:** list own devices; remote sign-out marks/removes the device via the fake;
  RLS intent documented.
- **Deps:** 1.3.

#### Stage 11.4 — Account deletion with grace period
- **Spec:** §3.10 (export first → 30-day recoverable pause → permanent unrecoverable
  deletion; plain language; warm, never falsely reassuring).
- **Scope:** `delete_account_screen.dart` + `account_deletion_repository.dart` — step 1
  offer data export (reuses the §3.11 export), step 2 schedule a 30-day recoverable
  pause, with plain-language stages. **No destructive auto-delete at build time.**
- **DB:** **migration `0012_account_deletion.sql`** — `account_deletion_requests`
  (user_id PK, requested_at, recoverable_until, status `'pending'|'cancelled'`)
  **with RLS** (own row only). `TODO(human-review): the permanent purge job is a
  server-side scheduled function — never delete user data in the client.`
- **Tests:** request sets `recoverable_until = requested_at + 30d`; cancel restores;
  no client-side hard delete exists.
- **Done when:** the client never performs an irreversible deletion; export precedes
  delete.
- **Deps:** 1.3, 12.3.

### Phase 12 — Privacy & data transparency (§3.11)

#### Stage 12.1 — "Your privacy, plainly" home
- **Spec:** §3.11 layer 1 (plain-language privacy home; the never-sell promise).
- **Scope:** `privacy_home_screen.dart` — plain-language sections (what we keep, who
  can see it, the never-sell-or-share promise, encryption). Links to the data
  dashboard. Sentence-case, warm.
- **DB:** none.
- **Tests:** widget renders the promise + sections; copy is sentence case and
  non-clinical.
- **Note:** §3.11 promises encryption at rest. That is a backend/storage concern (a
  private Supabase Storage bucket + at-rest config), not client Dart — this stage states
  the promise honestly in copy and carries `TODO(human-review): configure private bucket
  + encryption-at-rest server-side; do not claim it in copy until verified.` so the
  promise is never silently dropped.
- **Deps:** 1.9.

#### Stage 12.2 — In-context reassurance component
- **Spec:** §3.11 layer 2 (reassurances at the exact sensitive moments: uploading a
  medical record, inviting a helper, enabling location).
- **Scope:** a reusable `reassurance_note.dart` widget + a small registry of moments;
  wire it into the vault medical upload (5.3), helper invite (3.5), and location
  request (7.6). Calm copy ("this stays private to your family — helpers never see the
  vault").
- **DB:** none.
- **Tests:** the component renders the right copy for each moment; appears in the three
  wired flows.
- **Deps:** 5.3, 3.5, 7.6 (the location-permission moment — build-first-or-park).

#### Stage 12.3 — "Your data" dashboard (see / download / delete)
- **Spec:** §3.11 layer 3 (see everything held, download it, delete it).
- **Scope:** `your_data_screen.dart` + `data_export_service.dart` interface + fake — an
  inventory of held data (profiles, children/pets, events, documents metadata,
  photos), a download/export action, and an entry to deletion (11.4). Export is the
  shared mechanism reused by handoff and account deletion.
- **DB:** none (reads existing tables; export assembles client-side or via a server
  function — server export `TODO(human-review)`).
- **Tests:** inventory lists each data category; export invokes the service; delete
  routes to the grace-period flow.
- **Deps:** 1.7, 5.1.

### Phase 13 — Storage (§3.12)

#### Stage 13.1 — Storage meter
- **Spec:** §3.12 (Free 1 GB / Premium 25 GB; show usage clearly).
- **Scope:** `storage_meter.dart` (pure Dart — sum document + photo sizes vs the
  entitlement limit) + a meter UI in settings/vault. Limit comes from the entitlement
  provider.
- **DB:** none (sizes from document/photo metadata; add a `size_bytes` to the metadata
  if absent — small migration if needed, with RLS inherited).
- **Tests:** usage math; limit pulled from entitlement (Free vs Premium).
- **Deps:** 5.1, 1.8.

#### Stage 13.2 — Gentle warnings + grace period
- **Spec:** §3.12 (never a sudden wall — gentle 80%/90% warnings in the helper voice;
  at 100% new saves still go through during a short grace period).
- **Scope:** `storage_guard.dart` — at ~80%/~90% surface calm warnings ("your vault's
  filling up — Premium adds room, no rush"); at 100% allow saving during a grace
  window rather than blocking; never lose a capture (§3.12 / §3.13).
- **DB:** none.
- **Tests:** 80/90 thresholds fire the right copy once; at 100% an upload still
  succeeds within the grace window and is never dropped.
- **Done when:** no code path hard-blocks a save at the limit during grace.
- **Deps:** 13.1.

### Phase 14 — Offline polish & emergency essentials (§3.13)

#### Stage 14.1 — Emergency-essentials on-device cache
- **Spec:** §3.13 (proactively keep upcoming schedule + children's allergies/medical +
  insurance/health cards + emergency contacts on device, reachable with zero signal).
- **Scope:** extend the Drift schema (bump `schemaVersion` + migration in
  `database.dart`) with local tables for cached essentials (allergies, medications,
  emergency contacts, key documents metadata, upcoming events) + a sync-down service
  that refreshes them when online. Re-run `build_runner`.
- **DB:** Drift (local) only — bump `AppDatabase.schemaVersion` with a migration step;
  no new Supabase table (mirrors existing server data).
- **Scope note (offline document bytes):** §3.13 also lists "opening previously-viewed
  documents" offline. This stage caches essentials **metadata** + the small emergency
  cards. Caching arbitrary document **file bytes** for offline open is a larger,
  storage-bounded concern — scope it explicitly as a follow-up: cache bytes only for the
  emergency insurance/health cards here, and leave general previously-viewed-document
  byte caching as `TODO(human-review)` so it isn't silently assumed done.
- **Tests:** in-memory Drift — essentials persist and are readable with the network
  abstraction reporting offline; refresh updates them when online.
- **Deps:** 1.6, 3.3, 5.1.

#### Stage 14.2 — Emergency-essentials screen (zero-signal)
- **Spec:** §3.13 (a genuine safety responsibility — reachable offline).
- **Scope:** `emergency_essentials_screen.dart` — reads only from the local cache
  (14.1); shows allergies, meds, emergency contacts, insurance/health cards; always
  reachable. Behind the biometric lock per §3.10 but available offline once unlocked.
- **DB:** none.
- **Tests:** renders from the local cache with connectivity forced offline; shows the
  floor data.
- **Deps:** 14.1.

#### Stage 14.3 — Offline indicator + adaptive capture reassurance
- **Spec:** §3.13 (calm quiet offline indicator by default; warm confirmation at the
  moment of capture — "got it — I'll add this when you're back online. Nothing's
  lost.").
- **Scope:** a quiet global offline indicator driven by `connectivityProvider`; a
  shared capture-confirmation snackbar/toast used by event/voice/note/document capture.
- **DB:** none.
- **Tests:** indicator reflects connectivity; capturing offline shows the reassurance
  copy; online capture is quiet.
- **Deps:** 1.5, 4.3.

### Phase 15 — Settings & home-screen widget (§3.14)

#### Stage 15.1 — Settings screen (grouped categories + personalization)
- **Spec:** §3.14 (grouped: Family & people; Notifications; Privacy & security;
  Connected apps; Account & plan; Personalization incl. BackPocket Mom voice on/off +
  appearance).
- **Scope:** `settings_screen.dart` + `settings_controller.dart` — grouped sections
  linking to the feature screens already built; Personalization holds the voice toggle
  + appearance.
- **DB:** **migration `0013_user_settings.sql`** — `user_settings` (user_id PK,
  mom_voice_on bool default true, appearance, ...) **with RLS** (own row only). Reuses
  `notification_prefs` (0008) for notification settings.
- **Tests:** all six groups render and route; voice/appearance persist; RLS intent
  documented.
- **Deps:** 7.4, 11.x links, 12.1.

#### Stage 15.2 — Settings search
- **Spec:** §3.14 (a search bar to find any control without knowing the category).
- **Scope:** `settings_search.dart` — an index of every setting + a search field that
  jumps to the matching control.
- **DB:** none.
- **Tests:** searching a control's name returns it across categories.
- **Deps:** 15.1.

#### Stage 15.3 — Home-screen widget data bridge
- **Spec:** §3.14 (one default summary widget in three sizes — next event, today's
  timeline, reminders/pets due, calm load — sensitive details behind Face ID; tapping
  opens + unlocks).
- **Scope:** `lib/features/widget_bridge/widget_data_service.dart` — compose a
  **non-sensitive** summary payload and publish it via the `home_widget` package
  (Dart side only). The native widget UI (SwiftUI/WidgetKit, Kotlin/Glance) is
  **parked**. Payload excludes medical/document details until unlocked.
- **DB:** none. **Package:** `home_widget` (Dart bridge only; native UI parked).
- **Tests:** the published payload contains only non-sensitive fields (no medical /
  document / location data); reflects next event + load. `TODO(human-review): build the
  native widget UIs and the tap-to-unlock deep link.`
- **Deps:** 8.1, 7.2.

### Phase 16 — Empty states (§3.15)

#### Stage 16.1 — Empty-state component library
- **Spec:** §3.15 (gentle-nudge variant for simple screens; reveal-the-value variant
  for nuanced screens with concrete previews).
- **Scope:** `lib/core/widgets/empty_state.dart` — two variants: `EmptyState.nudge`
  (warm line + one CTA) and `EmptyState.revealValue` (concrete preview content, e.g.
  "this is where I get ahead of camp registration and hockey tryouts").
- **DB:** none.
- **Tests:** both variants render their respective structure; copy is sentence case.
- **Deps:** 1.9.

#### Stage 16.2 — Empty-state sweep
- **Spec:** §3.15 across the app.
- **Scope:** apply the library to vault (nudge), photo wall (nudge), annual reminders
  (reveal-value), insights (reveal-value), calendar (nudge), people (nudge), today
  (nudge). Replace ad-hoc placeholders added in earlier stages.
- **DB:** none.
- **Tests:** each swept screen shows the correct variant when empty.
- **Deps:** 16.1, and the screens they apply to (5.2, 9.2, 8.4, 8.3, 6.4, 3.1, 1.10).

### Phase 17 — Polish & store-prep

#### Stage 17.1 — Theme & accessibility polish
- **Spec:** §2 brand; "meet every generation where they are."
- **Scope:** audit contrast, support text scaling, add semantics labels, ensure tap
  targets; no hard-coded colours remain (reviewer sweep). Tighten `app_theme.dart`
  only as needed.
- **DB:** none.
- **Tests:** a golden-free widget test asserting key semantics labels + that text
  scales without overflow on a sample screen.
- **Deps:** most feature stages.

#### Stage 17.2 — BackPocket Mom voice on/off applied app-wide
- **Spec:** §3.14 / §4 (the voice is a toggle in both tiers).
- **Scope:** a small copy-variant helper that, when the voice toggle is off, swaps
  warm helper-voice strings for plain neutral equivalents in key surfaces (summaries,
  reminders, load meter). Driven by `user_settings` (15.1).
- **DB:** none.
- **Tests:** with the voice off, sample surfaces render the neutral copy; on, the warm
  copy.
- **Deps:** 15.1, 7.3, 8.2.

#### Stage 17.3 — App-icon placeholders + platform-folder note + store metadata stub
- **Spec:** §5 (cross-platform; store readiness).
- **Scope:** add placeholder app-icon assets + a `docs/STORE.md` stub (names,
  descriptions in helper voice, the privacy/never-sell promise) + a clear note to run
  `flutter create --org com.backpocketmom --project-name back_pocket_mom
  --platforms=android,ios .` to generate platform folders (not run unattended). No iOS
  build attempted.
- **DB:** none.
- **Tests:** none beyond analyze (assets/docs only); keep the tree green.
- **Done when:** the platform-folder command is documented; no secrets in store stub.
- **Deps:** none (can run late).

#### Stage 17.4 — Final analyze/test sweep + summary prep
- **Spec:** orchestration "stop condition".
- **Scope:** a full `flutter analyze` + `flutter test` sweep; fix any drift; confirm no
  `if (isPremium)` outside the entitlement provider, no hard-coded colours, no
  sensitive logging; ensure every parked item is in `docs/OPEN_QUESTIONS.md`.
- **DB:** none.
- **Tests:** whole suite green.
- **Deps:** all prior stages.

---

## D. Build order & dependency list

Strict order (each stage's deps appear earlier). Independent stages within a phase may
be reordered freely; cross-phase deps are noted in section C.

```
Phase 1:  1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9 → 1.10 → 1.11
Phase 2:  2.1 → 2.2 → 2.3 → 2.4 → 2.5
Phase 3:  3.1 → 3.2 → 3.3 → 3.4a → 3.4b → 3.5 → 3.6 → 3.7
Phase 4:  4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6
Phase 5:  5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6 → 5.7 → 5.8
Phase 6:  6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 → 6.7 → 6.8
Phase 7:  7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6
Phase 8:  8.1 → 8.2 → 8.3 → 8.4 → 8.5
Phase 9:  9.1 → 9.2 → 9.3 → 9.4 → 9.5
Phase 10: 10.1 → 10.2
Phase 11: 11.1 → 11.2 → 11.3 → 11.4
Phase 12: 12.1 → 12.2 → 12.3
Phase 13: 13.1 → 13.2
Phase 14: 14.1 → 14.2 → 14.3
Phase 15: 15.1 → 15.2 → 15.3
Phase 16: 16.1 → 16.2
Phase 17: 17.1 → 17.2 → 17.3 → 17.4
```

Notable cross-phase dependencies: 6.7 needs 7.1 (notify service); 7.5 needs 6.6
(conflict detector); 8.4 needs 7.1; 11.4 needs 12.3 (export-before-delete); 12.2 needs
3.5 + 5.3 + 7.6 (the sensitive moments); 9.5 needs 3.5; 16.2 needs the screens it
sweeps; 17.2 needs 15.1. If a cross-phase dep isn't met yet, the Orchestrator either
builds the dependency first or parks the stage and moves on (orchestration "retry/park").

### Migration ledger (each ships its own RLS)

| Migration | Stage | Adds |
|---|---|---|
| `0001_init.sql` | (existing) | profiles, children, child_guardians, helper access, safety floor, events, documents, pets — **reuse** |
| `0002_child_profile_extras.sql` | 3.2 | children columns + `child_activities` |
| `0003_invitations.sql` | 3.4a | `invitations` (co-parent + helper invite tokens) |
| `0003b_sharing_prefs.sql` | 3.4b | `parent_sharing_prefs`, profiles.household_mode |
| `0003c_child_notes.sql` | 3.7 | `child_notes` (double-gated helper visibility) |
| `0004_event_recurrence.sql` | 4.5 | child_events recurrence columns |
| `0005_document_shares.sql` (+ optional `0005a` ocr) | 5.5 / 5.7 | `document_shares`, `child_documents.ocr_text` |
| `0006_connected_sources.sql` | 6.1 | `connected_sources` |
| `0007_integration_wishlist.sql` | 6.7 | `integration_wishlist` |
| `0008_notification_prefs.sql` | 7.4 | `notification_prefs` |
| `0009_annual_patterns.sql` | 8.4 | `annual_patterns` |
| `0010_photo_walls.sql` | 9.1 | `photo_wall_items` (+ child photo capability) |
| `0011_user_devices.sql` | 11.3 | `user_devices` |
| `0012_account_deletion.sql` | 11.4 | `account_deletion_requests` |
| `0013_user_settings.sql` | 15.1 | `user_settings` |

Drift local schema bump (not Supabase): Stage 2.5 (setup checklist), Stage 14.1
(emergency essentials cache).

### New packages introduced (and where)

| Package | Stage | Status |
|---|---|---|
| `connectivity_plus` | 1.5 | real impl device-only; tested via fake |
| `speech_to_text` | 4.1 | **parked** (native/device) |
| `file_picker` / `image_picker` | 5.3 | behind interface; **parked** real device path |
| `google_mlkit_text_recognition` | 5.7 / 5.8 | **parked** (device OCR) |
| `local_auth` | 11.2 | **parked** (device biometrics) |
| `google_maps_flutter`, `geolocator` | 7.6 | **parked** (device + API key) |
| `home_widget` | 15.3 | Dart bridge only; native UI **parked** |

---

## E. Parked / scaffold-only overnight (per orchestration §"What can't be fully done")

For each: build the Dart-side abstraction **behind an interface**, unit-test it against
a fake, stub the platform layer, and log to `docs/OPEN_QUESTIONS.md`. Never block the run.

- **Native home-screen widgets** (SwiftUI/WidgetKit, Kotlin/Glance) — Stage 15.3 builds
  the Dart data bridge + non-sensitive payload; native UI + tap-to-unlock deep link
  parked.
- **On-device voice STT** — Stage 4.1 `SttService` interface + fake; real STT parked.
- **Cloud LLM event parsing** — Stage 4.2 `EventParser` interface + deterministic fake;
  real LLM endpoint/key parked.
- **ML Kit OCR** (vault content search, auto-read expiry) — Stages 5.7/5.8
  `text_recognizer` interface + fake; real ML Kit parked.
- **Google Maps / live-traffic + geolocation** — Stage 7.6 `travel_time_service` +
  `location_service` interfaces + fakes; real Maps/geolocator + key parked; graceful
  fallback to the 1-hour reminder is implemented and tested.
- **Real Google / Apple OAuth** — Stages 1.3 (auth) + 6.2 (connectors) define the
  interfaces; real OAuth client ids/redirects parked.
- **FCM push / local notifications** — Stage 7.1 `NotificationService` interface + fake;
  real FCM/APNs parked.
- **Real payments / IAP** — Stage 1.8 entitlement defaults to Free with a fake source;
  no real billing; never charge.
- **Live Supabase** — `.env` may be empty; all repositories tested against fakes; no
  migration is applied to a cloud project overnight. Server-side pieces (expiring
  share-link fetch, account-purge job, remote device revoke, server export) are written
  as `TODO(human-review)` Edge Functions, not run.
- **iOS builds** — need a Mac; keep platform code behind abstractions; Stage 17.3 only
  documents `flutter create` for platform folders — no iOS build attempted.

## F. Assumptions & human-review flags carried into the build

- `TODO(human-review)` — **legal:** binding privacy policy + children's-data handling
  (COPPA/PIPEDA/GDPR) for co-parent/helper invites and expiring share links (Stages
  3.4, 3.5, 5.5). Flag, don't guess.
- **Conservative defaults** where the spec is ambiguous: sharing toggles default OFF in
  Separate mode (only the protected floor flows); helper access defaults OFF for every
  toggle; biometric lock defaults ON; entitlement defaults to Free; the widget payload
  excludes all sensitive fields. (Per orchestration "most conservative,
  privacy-preserving default.")
- **Setup progress** (2.5) is kept on-device unless cross-device sync is confirmed
  needed — flagged.
- **Pricing numbers** (limits in 1.8) come from spec §4; final prices are "to be
  validated" per the spec — treat the limits as authoritative, the dollar amounts as
  provisional.
- **No destructive actions** overnight: account deletion (11.4) only schedules a
  recoverable pause; the permanent purge is a server job left for a human.
```
