# BackPocket Mom — Build Log

Append-only log of the autonomous overnight build. One entry per stage, newest at
the bottom. See `docs/PLAN.md` for the roadmap and `docs/OPEN_QUESTIONS.md` for
anything needing a human.

Entry format:

```
## [stage N.M] <title> — <timestamp>
- Shipped: <what now works>
- Tests: <files> — analyze clean, N tests pass
- Decisions/assumptions: <bullets>
- Parked/needs human: <none | item + why>
- Commit: <hash/subject>
```

---

## [setup] Orchestrator bring-up — 2026-06-16

- Shipped: subagents installed to `.claude/agents/` (developer, code-reviewer);
  read CLAUDE.md, docs/spec.md, docs/orchestration.md; established a green baseline.
- Baseline: `flutter pub get` ok; `dart run build_runner build` generated
  `database.g.dart`; cleared 2 pre-existing info lints in `lib/main.dart`
  (removed an unnecessary `foundation.dart` import; annotated the deprecated
  Supabase `anonKey` param with an `ignore` + TODO). `flutter analyze` → "No issues
  found!". No tests yet (no `test/` dir) — stages will add them.
- Decisions/assumptions:
  - Subagent discoverability: the `.claude/agents/*.md` files are installed and will
    be hot-loaded by future sessions, but the harness did NOT register them mid-run,
    so `subagent_type: developer|code-reviewer` is not available this session.
    Adaptation: spawn `general-purpose` agents with the persona embedded in the prompt
    and the model pinned to match each definition (developer→sonnet, reviewer→opus).
    Functionally equivalent and preserves clean-context-per-stage. See OPEN_QUESTIONS.
  - Used opus for the one-shot Phase 0 architect plan (foundation quality); per-stage
    developers will use sonnet as defined.
- Parked/needs human: none (noted the discoverability quirk in OPEN_QUESTIONS.md).
- Commit: 8a (chore: orchestrator bring-up) — see Phase 0 entry below (same commit).

## [Phase 0] Plan written + reviewed — 2026-06-16

- Shipped: `docs/PLAN.md` — a phased roadmap covering every spec feature §3.1–§3.15,
  Free and Premium. 17 build phases, **85 stages**, a 16-row migration ledger (0001
  reused; 0002–0013 + 0003b/0003c new, each shipping its own RLS), a parked-items list,
  and conservative-default flags.
- Review: an opus `code-reviewer` sanity-checked coverage/ordering/testability/invariants
  and returned CHANGES-REQUESTED with 3 substantive items + 4 minors. All folded in:
  1. Added **Stage 3.7 — child notes** (the §3.2 shared-notes toggle gated nothing and
     note capture never shipped) with `0003c_child_notes.sql` + double-gated RLS
     (helper sees a note only if its `share_with_helpers` flag is on AND the helper has
     the `shared_notes` toggle).
  2. Added **Stage 1.11 — event repository + manual event create/edit** (every event
     path was voice-only; §4 copy promises "add it by hand"). One offline-safe
     event-write path reused by voice-accept (4.4), timeline (6.4), and the manual
     dead-end (6.7).
  3. Split the oversized **Stage 3.4** into 3.4a (invitations + InviteSender) and 3.4b
     (Combined/Separate mode + sharing prefs) so each is one committable unit.
  4. Minors: protected-time-block factor degrades gracefully in the load meter;
     encryption-at-rest flagged as a server TODO (not claimed in copy until verified);
     offline document-byte caching scoped explicitly (cards now, general bytes later);
     12.2 deps aligned with the section-D cross-phase note (+7.6).
- Decisions/assumptions: used opus for the one-shot architect plan; per-stage developers
  will run on sonnet (matching the developer agent definition). Plan edits made directly
  by the orchestrator (a plan doc, not feature code) per "fold in fixes."
- Tests: none yet (planning only). `flutter analyze` still clean (no code changed beyond
  the baseline `main.dart` lint fix).
- Parked/needs human: the parked-integrations list (native widgets, voice STT, OCR, Maps,
  OAuth, FCM, IAP, live Supabase, iOS) is captured in PLAN.md §E and OPEN_QUESTIONS.md.
- Commit: pending (this entry commits with the plan).

## [stage 1.1] Plain-Dart domain models — 2026-06-16

- Shipped: 12 immutable domain models + `Plan` enum under `lib/core/domain/`, mirroring
  every table in `0001_init.sql` with exact snake_case JSON keys; value equality,
  `copyWith` (with `clearX` sentinels for null), and `fromJson`/`toJson` on each.
  `FamilyEvent` field shape is compatible with the Drift `CachedEvents` mirror.
- Tests: `test/core/domain/` (12 files, 114 tests) — JSON round-trip, equality/hashCode,
  copyWith incl. clear-to-null. analyze clean, 114 tests pass (orchestrator-verified).
- Decisions/assumptions: nullable `copyWith` uses a `clearFoo` boolean sentinel uniformly;
  date-only columns (`birthday`, `expires_on`) serialize as `YYYY-MM-DD` at UTC midnight;
  `Plan` has no column yet (wired at 1.8). Models are pure Dart (no Flutter/Supabase/Drift).
- Review: code-reviewer APPROVE (one nit: `_parseDate` duplicated in child/document — left
  for a later `core/util` date helper; out of this stage's scope).
- Parked/needs human: none.
- Commit: (next) feat(domain): plain-Dart models for the whole data model [stage 1.1]

## [stage 1.2] Core utilities: Result + redacting logger — 2026-06-16

- Shipped: `lib/core/util/` — `AppFailure` sealed hierarchy (Network/Auth/NotFound/
  Permission/Unexpected, user-safe helper-voice messages), `Result<T>` sealed type
  (map/mapError/fold/when/valueOrNull, value equality), and `AppLogger` — a no-`print`
  logger that routes EVERY message + context/error through a total `redact()` choke-point
  (key-based + value-pattern redaction of tokens/JWT, medical, document/storage paths,
  coordinates). Release sink is no-op.
- Tests: `test/core/util/` (3 files, 92 tests). Full suite 206 pass; analyze clean
  (orchestrator-verified).
- Review: code-reviewer found a real **redaction bypass** — `redact()` returned any
  non-Map/List/String object unchanged, so an exception whose `toString()` embedded a
  token reached the sink raw. Fixed: `redact()` is now total (stringify + pattern-redact
  the fallback) + 3 regression tests. Re-verified green.
- Decisions/assumptions: caller contract documented (pass sensitive values as keyed
  `context`, never interpolated into free-text `message`). Debug sink = `dart:developer`.
  `TODO(human-review)`: wire a production log sink (Sentry/Crashlytics) at bootstrap.
- Parked/needs human: none.
- Commit: (next) feat(core): Result/AppFailure + airtight redacting logger [stage 1.2]

## [stage 1.3] Auth abstraction — 2026-06-16

- Shipped: `lib/features/auth/` — domain `AuthUser` (id/email/fullName only, redacted
  `toString`), `AuthRepository` interface (email/Google/Apple sign-in, 6-digit recovery
  OTP, signOut, currentUser, authStateChanges) returning `Result<AuthUser>`/`AppFailure`
  with ZERO Supabase types above the repo; `SupabaseAuthRepository` (errors mapped by
  HTTP status, never message text → no token leak); `FakeAuthRepository`;
  `authRepositoryProvider` (Supabase when `Env.isBackendConfigured`, else fake → app runs
  UI-only with no backend).
- Tests: `test/features/auth/auth_repository_test.dart` (43) incl. interface-contract
  no-leak assertions. Full suite 249 pass; analyze clean (orchestrator-verified).
- Review: APPROVE. Reviewer applied a parity fix (preserve `cause: e` on AuthFailure for
  redacted internal debugging). Forward guidance for 1.4: treat OAuth `auth_*_pending`
  codes as non-fatal — the real session arrives via `authStateChanges`.
- Parked/needs human (in OPEN_QUESTIONS): real Google/Apple OAuth (client ids, redirects,
  platform capability) + Supabase email-OTP dashboard setting for the 6-digit code.
- Commit: (next) feat(auth): AuthRepository interface + Supabase impl + fake [stage 1.3]

## [stage 1.4] Auth UI + router auth-gate — 2026-06-16

- Shipped: sign-in / sign-up screens (`ConsumerStatefulWidget`, three options — Google,
  Apple, email+password, "no user turned away"), `AuthController` (`AsyncNotifier`,
  gentle inline errors, OAuth "pending" treated as non-fatal — session arrives via
  `authStateChanges`), a placeholder `/home` landing (Stage 1.9 replaces with the shell),
  and a router auth-gate: `refreshListenable` on auth changes + a `redirect` that reads
  `currentUser` at call-time (signed-out → welcome/sign-in; signed-in → /home, no loop).
  Welcome's two buttons now route to sign-up / sign-in.
- Tests: `test/features/auth/` (+40: controller 13, sign-in 10, sign-up 11, router 6).
  Full suite 291 pass; analyze clean (orchestrator-verified).
- Review: APPROVE. Reviewer fixed copy — lowercase headlines → proper sentence case
  ("Welcome back.", "Let's get you set up.", "You're in, …") per CLAUDE.md §2, and updated
  the asserting tests. Nit (non-blocking): `_OAuthButton` hard-codes dimensions (not
  colours) — could centralize in the theme later.
- Decisions/assumptions: "forgot password?" deferred to Stage 11.1; OAuth buttons ready,
  real handshake still TODO(human-review) from 1.3.
- Parked/needs human: none new.
- Commit: (next) feat(auth): sign-in/up UI + router auth-gate [stage 1.4]

## [process] Review tiering — 2026-06-16

To fit the overnight window: HIGH-risk stages (migrations/RLS, sharing & visibility,
safety floor, entitlement gating, security/privacy/money/data-shape) get a full
independent opus `code-reviewer`. LOW-risk stages (pure-Dart utils, simple UI/fakes)
are reviewed by the orchestrator reading the diff directly. EVERY stage is still
independently gated (scope + `flutter analyze` + `flutter test`) before commit.

## [stage 1.5] Connectivity abstraction — 2026-06-16

- Shipped: `lib/core/connectivity/` — `ConnectivityService` (boolean-only contract:
  `isOnline` + `onlineChanges`), `FakeConnectivityService` (dedupes transitions, broadcast,
  disposes), `ConnectivityPlusService` (real adapter mapping `List<ConnectivityResult>` →
  online iff any non-`none`; device-only, not host-tested), `connectivityProvider` typed as
  the interface. Added `connectivity_plus ^6.1.4` (resolved 6.1.5).
- Tests: `test/core/connectivity/` (16). Full suite 307 pass; analyze clean (verified).
- Review: orchestrator self-review (low-risk) — interface isolation confirmed (nothing
  depends on the concrete impl), fake semantics correct, real adapter documented device-only.
- Parked/needs human: real connectivity behaviour is device-tested only (noted).
- Commit: (next) feat(core): connectivity abstraction + fake + connectivity_plus adapter [stage 1.5]

## [stage 1.6] Offline sync engine — 2026-06-16

- Shipped: `lib/data/sync/` — `SyncHandler` interface (entity + handle(operation, payload)),
  `SyncEngine` (FIFO flush of the Drift `SyncQueue`; deletes a row ONLY on handler Success;
  every other outcome — Failure / throw / no-handler / undecodable / max-attempts — keeps
  the row and at most increments `attempts`; poison row never blocks others; flush triggered
  on connectivity→online; `_isFlushing` concurrency guard; payload contents never logged),
  and `syncEngineProvider`. Feature repos register handlers in later stages.
- Tests: `test/data/sync/sync_engine_test.dart` (11) incl. an explicit never-drop aggregate
  (success/fail/throw/orphan → only the success row deleted). Full suite 318 pass; analyze
  clean (verified).
- Review: orchestrator self-review — read `sync_engine.dart`; confirmed the single delete
  site (Success branch) and that all error paths preserve rows. Data-safety guarantee holds.
- Decisions/assumptions: capped retries via `maxAttempts` (default 5) instead of time-based
  backoff (SyncQueue has no last-attempt column); stuck rows are skipped+logged, never
  dropped. `TODO(human-review)`: surface permanently-stuck rows as a "pending writes"
  indicator (§3.13); tune `maxAttempts`.
- Parked/needs human: none.
- Commit: (next) feat(sync): offline sync engine with never-drop guarantee [stage 1.6]

## [stage 1.7] Repository foundations + ChildRepository + create-child RPC — 2026-06-17

- Shipped: the canonical OFFLINE-FIRST repository template. `lib/features/people/data/` —
  `ChildRepository` interface; `SupabaseChildRepository` (reads via Supabase RLS; writes go
  through the Drift `SyncQueue` only — `createChild`/`updateChild` enqueue + return
  optimistically; `watchChildren()` merges remote + pending-queued creates so an offline
  child appears instantly and de-dupes after flush); `ChildSyncHandler` (entity 'child',
  flushes via the RPC); `FakeChildRepository` (mirrors the guardian invariant); provider.
  New migration `0001a_child_create_rpc.sql`: `create_child_with_guardian` SECURITY DEFINER
  RPC (set search_path, raises if auth.uid() null, atomically inserts child + guardian link,
  returns child) — fixes the insert-RLS chicken-and-egg and guarantees the creator is always
  a guardian.
- Tests: `test/features/people/` (36). Full suite 354 pass; analyze clean (verified).
- Review: opus code-reviewer APPROVE; applied a security fix — `revoke execute ... from
  public` before `grant ... to authenticated`, closing Postgres's default PUBLIC grant on
  the new function.
- Decisions/assumptions: ids are injectable (deterministic in tests). Two forward notes:
  (1) optimistic-id reconciliation — an offline create then update before flush would enqueue
  the update under the local id; the event repo (1.11) should make a deliberate reconciliation
  decision. (2) `sync_handler.dart` doc lists insert/update/delete while child repo uses
  create/update — cosmetic, end-to-end consistent.
- Parked/needs human (OPEN_QUESTIONS): the RPC must be applied to the Supabase project before
  the live impl can create children; wire Supabase realtime for co-parent child updates (3.x).
- Commit: (next) feat(people): ChildRepository offline-first template + create-child RPC [stage 1.7]

## [stage 1.8] Entitlement / PlanGate — 2026-06-17

- Shipped: `lib/core/entitlement/` — the SINGLE Premium gate. `PlanLimits` (Free: children 4,
  pets 2, helpers 1, connections 5, voice 10/mo, storage 1 GB; Premium: unlimited counts +
  25 GB; `int? null` = unlimited), `Capability` enum (9 premium-only features), `Entitlement`
  (`can(Capability)`, `withinLimit(LimitKind, currentCount)`, `storageLimitBytes`),
  `planSourceProvider` (defaults Free, injectable) → `entitlementProvider`, and a `PlanGate`
  widget + reusable `UpgradeNudge` (gentle helper-voice upsell, theme-only).
- Tests: `test/core/entitlement/` (64). Full suite 418 pass; analyze clean (verified).
- Review: orchestrator self-review — confirmed single entry-point, Free-default, correct
  unlimited handling, exhaustive switches, and a strong billing TODO (verify receipt
  server-side; never unlock without a verified purchase). Limits cross-checked vs spec §4.
- Decisions/assumptions: every `Capability` is Premium-only so `can()` is plan-based;
  `withinLimit(count)` takes the pre-add count. Storage gating UI lands in Stage 13.
- Parked/needs human (OPEN_QUESTIONS): real IAP/billing source (StoreKit 2 / Play Billing)
  behind an interface; no real money flows tonight; §4 dollar prices provisional.
- Commit: (next) feat(core): entitlement + PlanGate single Premium gate [stage 1.8]

## [stage 1.9] App shell + bottom navigation — 2026-06-17

- Shipped: `lib/features/shell/presentation/app_shell.dart` — `StatefulShellRoute.indexedStack`
  with 5 state-preserving tabs (Today, Calendar, People, Vault, Settings), Material 3
  `NavigationBar` (theme colours, sentence-case labels, tap-active-tab-to-pop-to-root).
  Minimal warm placeholder screens for each tab (later stages fill them). Router repointed:
  `/home` placeholder removed, signed-in users now land on `/today` inside the shell; auth/
  welcome stay outside the shell.
- Tests: `test/features/shell/app_shell_test.dart` (14) incl. IndexedStack state-preservation
  + auth-gate-into-shell. Updated 3 auth router tests for the new landing. Full suite 432
  pass; analyze clean (verified).
- Review: orchestrator self-review (UI/nav) — confirmed theme-only colours, correct shell
  wiring, and the auth-gate landing.
- Decisions/assumptions: deleted `home_placeholder_screen.dart` (its explicit 1.4 purpose is
  served by the shell). Tab screens are placeholders pending stages 1.10/3.1/5.2/6.4/15.1.
- Parked/needs human: none.
- Commit: (next) feat(shell): app shell + bottom navigation [stage 1.9]

## [stage 1.11] Event repository + manual event editor — 2026-06-17

- Shipped: `lib/features/calendar/data/` — `EventRepository` (offline-first like 1.7):
  writes via the Drift `SyncQueue` + optimistic `CachedEvents` row; `watchEvents`/
  `watchEventsForDay` stream from `CachedEvents` (zero-signal reads); `EventSyncHandler`
  (entity 'event') flushes to `child_events`. Coalescing reconciliation: create→update
  folds into the pending create payload; create→delete cancels the pending create + cache
  row (no orphan ops). `FakeEventRepository`; provider. Manual `event_editor_screen` +
  controller (title/date/time/location/child; offline "saved on your phone…" reassurance).
  Added shared `lib/core/util/uuid.dart` (UUID v4, Random.secure, no package).
- Tests: `test/features/calendar/` + `test/core/util/uuid_test.dart` (72 new). Full suite
  504 pass; analyze clean (verified).
- Review: opus reviewer found + fixed TWO HIGH data-integrity bugs the fakes masked:
  (1) a childless event would fail the `child_id` NOT-NULL FK and park forever → editor now
  requires a child; (2) the client event id was `local-event-N` but IS the canonical
  `child_events.id uuid` (no server RPC) → now a real UUID v4. Both with regression tests.
- Decisions/assumptions: reconciliation/coalescing rules documented; `is_sports`/`created_by`
  not yet in `CachedEvents` (TODO 6.4 hydration). Sync-down refresh deferred to 6.4.
- Parked/needs human (OPEN_QUESTIONS): cross-stage child-id remapping — an event created for
  an offline-created (not-yet-flushed) child carries a placeholder `child_id` that fails the
  FK on flush; needs a dedicated sync-id-reconciliation stage (must touch `lib/data/sync/`).
- Commit: (next) feat(calendar): offline-first event repository + manual editor [stage 1.11]

## [stage 1.10] Today/home screen skeleton — 2026-06-17

- Shipped: `lib/features/today/` — `TodayController` (`TodayView`: time-of-day greeting +
  today's events via `eventRepositoryProvider.watchEventsForDay` + `isEmpty`), driven by an
  injectable `clockProvider` (default `DateTime.now`) so tests pin "today". `today_screen.dart`
  fleshed out: warm serif greeting, calm empty state ("today's looking open — enjoy the
  breathing room"), and unobtrusive reserved slots for the load meter (8.2), next-event card
  (6.4), and reminders (7.x).
- Tests: `test/features/today/` (33). Full suite 537 pass; analyze clean; no hardcoded colours
  (verified).
- Review: orchestrator self-review (UI) — theme-only colours, sentence-case copy, deterministic
  clock injection.
- Decisions/assumptions: the display-only date sub-line uses `DateTime.now()` directly (not
  business logic); empty-state copy will migrate to the Stage 16.1 component library.
- Note: brand logo assets are present (untracked) under `docs/Images/` — left untracked here
  (out of this stage's scope); will be wired at Stage 17.3 (app icons / store prep).
- Parked/needs human: none.
- Commit: (next) feat(today): today screen skeleton + injectable clock [stage 1.10]

## [milestone] Phase 1 — Foundations COMPLETE (1.1–1.11) — 2026-06-17

All 11 foundation stages shipped, green, committed: domain models, Result/redacting logger,
auth (repo+UI+gate), connectivity, the never-drop offline sync engine, the offline-first
repository template (ChildRepository + create-child RPC), the single entitlement gate, the app
shell + nav, the event repository (+manual editor), and the Today skeleton. 537 tests; analyze
clean. Next: Phase 2 — onboarding & guided family setup (§3.1).

## [stage 2.1] Welcome flow — 3 intro slides — 2026-06-17

- Shipped: `WelcomeCarousel` (PageView, 3 emotional-promise slides — "Every loose end,
  finally gathered." / "One schedule for everyone." / "Like having your mom in your pocket.";
  dot indicator; Skip on slides 1–2 jumps to the last slide; final slide CTAs "Get started"→
  /sign-up and "I already have an account"→/sign-in). `welcome_screen.dart` now a thin shell
  delegating to it; route '/' unchanged.
- Tests: `test/features/onboarding/welcome_carousel_test.dart` (17). Full suite 554 pass;
  analyze clean (verified). Theme-only colours; sentence-case copy asserted.
- Review: orchestrator self-review (UI).
- Decisions/assumptions: Skip lands on the final slide (sees the CTA first) rather than
  jumping straight to sign-up — calmer; sub-line copy is helper-voice (not spec-locked).
- Parked/needs human: none.
- Commit: (next) feat(onboarding): 3-slide welcome carousel [stage 2.1]

## [stage 2.2] Guided setup step 1 — first child — 2026-06-17

- Shipped: `FamilySetupController` (flow state: child→pet→connect→done; `addFirstChild` calls
  `ChildRepository.createChild`, gentle error; `next()` advances without writing) and
  `setup_child_screen.dart` (route `/setup/child`): only name required, optional birthday +
  brand-palette colour picker (stores the token name, e.g. 'rose', not raw hex), "skip for
  now" advances without a write. Route registered outside the shell behind the auth-gate.
- Tests: `test/features/onboarding/` (27). Full suite 581 pass; analyze clean (verified).
- Review: orchestrator self-review (UI) — name-only validation, skip-writes-nothing, theme
  palette via AppColors tokens (no raw hex).
- Decisions/assumptions: setup flow state is in-memory for now (persistence considered at
  2.5); post-step navigation currently → /today with a `TODO(2.3)` to route to the pet step.
- Parked/needs human: none.
- Commit: (next) feat(onboarding): guided setup step 1 — first child [stage 2.2]

## [stage 2.3] Guided setup step 2 — first pet + PetRepository — 2026-06-17

- Shipped: `PetRepository` (offline-first, exact mirror of the 1.7 child template — writes via
  `SyncQueue` entity 'pet', optimistic watch-merge, `PetSyncHandler` flushes via RPC, fake
  mirrors the guardian invariant) + provider. Migration `0001b_pet_create_rpc.sql`
  (`create_pet_with_guardian` SECURITY DEFINER: pinned search_path, auth.uid() required, atomic
  pet+guardian insert, execute revoked from public then granted to authenticated). Setup step 2:
  `setup_pet_screen.dart` (route `/setup/pet`, name + species, skippable); controller
  `addFirstPet`; 2.2's child step now routes onward to `/setup/pet`.
- Tests: `test/features/people/` + `test/features/onboarding/` (57 new). Full suite 638 pass;
  analyze clean (verified).
- Review: orchestrator self-review — read `0001b_pet_create_rpc.sql`, confirmed it matches the
  hardened `0001a` security pattern; the rest mirrors the already-reviewed child template.
- Decisions/assumptions: pet step → /today until the connect step (2.4) lands (TODO marked).
- Parked/needs human (OPEN_QUESTIONS): the same offline-child-id remapping note applies to pets
  if a pet were referenced before its create flushes (pets aren't referenced by other entities
  yet, so lower urgency).
- Commit: (next) feat(people): PetRepository + create-pet RPC + setup step 2 [stage 2.3]

## [stage 2.4] Guided setup step 3 — connect first app — 2026-06-17

- Shipped: `setup_connect_screen.dart` (route `/setup/connect`) — warm §3.5 preview of pulling
  in the family's calendars/apps, a "connect an app" affordance (routes to /calendar as a
  preview, `TODO(stage 6.3)` for the real connect flow), and "skip for now" which advances the
  flow to `done` and lands the user in the shell (/today). End of guided setup. Pet step now
  routes onward to /setup/connect.
- Tests: `test/features/onboarding/setup_connect_screen_test.dart` (11). Full suite 649 pass;
  analyze clean (verified).
- Review: orchestrator self-review (UI placeholder).
- Decisions/assumptions: "connect an app" doesn't advance the step (no real connection yet);
  only skip/finish reaches `done`.
- Parked/needs human: real connect flow is Phase 6 (6.3).
- Commit: (next) feat(onboarding): guided setup step 3 — connect placeholder [stage 2.4]

## [stage 2.5] Pinned setup home base — 2026-06-17

- Shipped: `SetupProgress` controller (derived items from real data — first child/pet/connect —
  plus manual items persisted in a new Drift `SetupChecklistState` table; progress ratio +
  four spec categories: People & pets / Apps to connect / Yearly & repeating reminders / Items
  to capture) and `setup_home_base_screen.dart` (route `/setup/home-base`, calm checklist +
  progress ring, theme colours). Reachable from a "Your setup" entry on Settings. First Drift
  schema bump v1→v2: added `SetupChecklistState` (itemKey PK, completed, updatedAt) with a safe
  `onUpgrade from<2 → createTable` migration (existing CachedEvents/SyncQueue untouched).
- Tests: `test/features/onboarding/setup_progress_controller_test.dart` (27) incl. a v2 migration
  smoke test. Full suite 676 pass; build_runner regenerates clean; analyze clean (verified).
- Review: orchestrator self-review — read the `database.dart` migration; confirmed it's additive
  and preserves existing data; `database.g.dart` is git-ignored (regenerated, not committed).
- Decisions/assumptions: setup progress is device-local Drift only. `TODO(human-review)`:
  confirm it need not sync across a user's devices. Today-screen entry deferred (settings entry
  ships now) to avoid destabilizing the Today tests.
- Parked/needs human (OPEN_QUESTIONS): cross-device setup-progress sync decision.
- Commit: (next) feat(onboarding): pinned setup home base + Drift v2 [stage 2.5]

## [milestone] Phase 2 — Onboarding & guided family setup COMPLETE (2.1–2.5) — 2026-06-17

Welcome carousel, guided child/pet/connect steps, and the pinned setup home base (with the
first Drift schema bump) all shipped, green, committed. 676 tests; analyze clean. Next:
Phase 3 — people, co-parent & village sharing (§3.2), the trust-model core.

## [stage 3.1] People hub screen — 2026-06-17

- Shipped: `peopleControllerProvider` (`PeopleHubView` aggregating children + pets from their
  repo streams) and a fleshed-out `people_hub_screen.dart` (route '/people'): Children, Pets,
  Co-parent, and Your village sections; child avatar accent from the stored colour token mapped
  to `AppColors` (no raw hex); warm §3.15 empty-state nudge → `/setup/child`; invite affordances
  for co-parent (TODO 3.4) and village (TODO 3.5).
- Tests: `test/features/people/` (people_controller + people_hub_screen, ~39 new). Full suite
  715 pass; analyze clean (verified).
- Review: orchestrator self-review (UI aggregation). Dev fixed two test-only async issues
  (sync broadcast for deterministic emission; `skipOffstage:false` for lazy ListView rows).
- Decisions/assumptions: co-parent/village sections are placeholders until 3.4/3.5.
- Parked/needs human: none.
- Commit: (next) feat(people): people hub screen [stage 3.1]

## [stage 3.2] Child profile detail + extended fields + activities — 2026-06-17

- Shipped: migration `0002_child_profile_extras.sql` — 6 nullable `children` columns (school,
  grade, teacher, physician, dentist, avatar; governed by existing children RLS) + new
  `child_activities` table WITH RLS in the same migration (guardians full CRUD; helper READ
  ONLY when `helper_child_can(child_id,'sports')`; no helper write path; child_id NOT NULL +
  cascade). Extended `Child` model (+ test) and added `ChildActivity`. `ChildActivityRepository`
  (offline-first via SyncQueue entity 'child_activity' + handler, watch-merge). `child_profile_
  screen` + controller (edit profile fields + activities CRUD); people-hub rows push it.
- Tests: 81 new (`test/core/domain/` + `test/features/people/`). Full suite 785 pass; analyze
  clean (verified).
- Review: opus reviewer APPROVE — confirmed a no-sports-toggle helper can never read activities,
  no helper write path, RLS shipped with the table. Two non-blocking notes: untracked
  docs/Images (known), and the cosmetic sync_handler.dart doc-comment op-name mismatch.
- Decisions/assumptions: `avatar` stores a URL/path (real picker later); profile controller keyed
  by `Child` (re-seed on reconnect noted). RLS verified by reading, not live SQL.
- Parked/needs human: live SQL-level RLS verification before launch (OPEN_QUESTIONS covers live
  Supabase).
- Commit: (next) feat(people): child profile + activities (migration 0002 + RLS) [stage 3.2]

## [stage 3.3] Protected safety-floor editors — 2026-06-17

- Shipped: three offline-first repos (Allergy/Medication/EmergencyContact — interface + Supabase
  + fake + provider + SyncHandler each, entities 'allergy'/'medication'/'emergency_contact',
  reusing the existing 0001 tables + RLS, no migration) and `safety_floor_screen.dart` (route
  `/people/child/:id/safety`) with an always-shared banner ("both of you always see this — safety
  comes first.") and NO hide/share toggle anywhere. Entry point added to the child profile.
- Tests: `test/features/people/` (89 new) incl. a widget assertion that no Switch/Checkbox/
  ToggleButtons exists (guards the invariant at the UI layer). Full suite 874 pass; analyze clean
  (verified).
- Review: opus reviewer APPROVE — invariant holds at every layer (no hide-from-guardian path in
  any interface/impl/controller/UI), no medical/PII logging. Two non-blocking notes: fake watch is
  non-replaying (no-backend dev only); the floor isn't yet cached for zero-signal reads — that's
  Stage 14.1 (emergency essentials), already planned.
- Decisions/assumptions: medical values never logged (explicit guards). RLS reused unchanged.
- Parked/needs human: none new (14.1 will cache the floor on-device).
- Commit: (next) feat(people): protected safety-floor editors [stage 3.3]

## [stage 3.4a] Co-parent invite + InviteSender — 2026-06-17

- Shipped: migration `0003_invitations.sql` — `invitations` table (token, kind coparent|helper,
  target child/pet, email, expiry) with INVITER-ONLY RLS (no invitee SELECT path) + two hardened
  SECURITY DEFINER RPCs: `resolve_invitation` (safe preview only — kind/inviter/target names, no
  oracle) and `accept_coparent_invitation` (validates token/expiry/accepted/kind, links ONLY
  `auth.uid()` as co-guardian of the INVITER'S children — no forge/escalation path; idempotent).
  Dart: `InviteSender` (email/link, fake + stub) + `InvitationRepository` + `InviteController` +
  `coparent_invite_screen` (route `/people/invite-coparent`), wired from the people hub. Token is
  never logged/stored in state.
- Tests: `test/features/people/` (37 new). Full suite 911 pass; analyze clean (verified).
- Review: opus reviewer APPROVE — independently verified all three SQL security properties + the
  no-token-logging discipline + scope.
- Decisions/assumptions: invite creation is an online insert (not the offline queue); inviterName
  is 'you' until a profile repo exists.
- Parked/needs human (OPEN_QUESTIONS): real email/deep-link delivery (server-side, token never in
  client logs); legal sign-off on invite-by-link child-data exposure (COPPA/PIPEDA/GDPR).
- Commit: (next) feat(people): co-parent invite + invitations RLS/RPCs [stage 3.4a]

## [stage 3.4b] Combined/Separate mode + sharing toggles — 2026-06-17

- Shipped: migration `0003b_sharing_prefs.sql` — `profiles.household_mode` (combined|separate,
  existing own-row RLS) + `parent_sharing_prefs` (parent_id, category, shared) with OWN-ROWS-ONLY
  RLS (no policy lets one parent read/write another's — sharing never forced equal). The five
  toggleable categories only; the protected floor (allergies/meds/emergency contacts) is
  DELIBERATELY excluded from the check constraint (can never be toggled). `SharingRepository`
  (mode + prefs), `SharingController` (effective sharing = explicit pref ?? mode default; setMode
  preserves prefs — never rebuilds data), `household_mode_screen` + `sharing_toggles_screen`
  (with a non-interactive always-shared floor row), entry points from Settings + people hub.
- Tests: `test/features/people/` (61 stage tests). Full suite 972 pass; analyze clean (verified).
- Review: orchestrator self-review — read `0003b_sharing_prefs.sql` (own-rows RLS, floor excluded)
  AND `sharing_controller.dart` (effective-sharing fallback, mode-switch preserves prefs, floor not
  in the enum). Both security-critical surfaces verified directly; invariants hold.
- Decisions/assumptions: sharing prefs are an online upsert (settings-like, not the offline queue).
- Parked/needs human: none new.
- Commit: (next) feat(people): household mode + per-category sharing toggles [stage 3.4b]

## [stage 3.5] Village helper invite + live preview — 2026-06-17

- Shipped: `helper_visibility` (pure-Dart preview: 5 child + 5 pet visible-group enums mapping
  to the helper toggles; vault/insights/private have NO enum variant, NO pending_access key, NO
  column — structurally unreachable under any combination) + `helper_preview` widget (shows an
  "always private" lock notice). helper_child_access + helper_pet_access repos (guardians-only,
  defaults OFF) + `helper_access_controller`. `helper_invite_screen` (route '/people/invite-helper',
  reuses InvitationRepository kind 'helper' + InviteSender). Migration `0003d_accept_helper_invitation.sql`
  — SECURITY DEFINER accept (hardened) applying pending_access toggles to the TARGET child/pet only.
- Tests: `test/features/people/` (93 new). Full suite 1065 pass; analyze clean (verified).
- Review: opus reviewer CHANGES-REQUESTED → fixed. TOP-severity privilege escalation: the accept
  RPC granted access to the invitation's target without checking the INVITER guards it — an attacker
  could invite-then-accept against another family's child and read their floor data. Fixed with a
  child_guardians/pet_guardians `exists` guard (raise PT403) before each grant, + a PT403→helper-voice
  error mapping. Re-verified green. Never-leak invariant confirmed structural; token never logged.
- Decisions/assumptions: helper invited for child A is scoped to child A (per-invited-target preview).
- Parked/needs human (OPEN_QUESTIONS): defense-in-depth — gate invitation INSERT so the inviter must
  guard the target (closes minor child-id existence enumeration; the access exploit is already closed
  at accept). Apply 0003d live to confirm PT403 fires on a forged target.
- Commit: (next) feat(people): village helper invite + live preview + helper-accept RPC [stage 3.5]

## [stage 3.6] Sharing-resolution layer (defense-in-depth) — 2026-06-17

- Shipped: `visibility_resolver.dart` — pure-Dart app-layer mirror of RLS. Sealed
  `ResolvedChildVisibility`/`ResolvedPetVisibility` hierarchies: the GUARDIAN subtype always
  returns all groups INCLUDING the protected floor + the guardian-only features (vault/insights/
  private), regardless of household mode; the HELPER subtype has NO field of type
  `GuardianOnlyFeature`, so vault/insights/private are a COMPILE-TIME impossibility for helpers
  (delegates to 3.5's helperVisibility for the toggled groups). Per-subject (no cross-child leak).
- Tests: `test/features/people/visibility_resolver_test.dart` (108) incl. exhaustive 2^5 matrices
  for child + pet and a structural proof. Full suite 1173 pass; analyze clean (verified).
- Review: orchestrator self-review — type-level structural guarantee + exhaustive matrix is the
  strongest form of this invariant; RLS remains the real gate.
- Decisions/assumptions: HouseholdMode deliberately not a parameter for child/pet visibility (it
  governs guardian-to-guardian personal-data sharing, not a guardian's view of a child's record).
- Parked/needs human: none new.
- Commit: (next) feat(people): defense-in-depth visibility resolver [stage 3.6]

## [stage 3.7] Child notes + share-with-helpers flag — 2026-06-17

- Shipped: migration `0003c_child_notes.sql` — `child_notes` with the DOUBLE-GATE RLS: guardians
  manage all; a helper may READ a note ONLY when `share_with_helpers = true AND
  helper_child_can(child_id,'shared_notes')` (both gates) — default `false` keeps a note
  family-private, invisible to a helper even with the toggle; no helper write path. `ChildNote`
  model + offline-first `NoteRepository` (SyncQueue entity 'note' + handler; the 'share' op carries
  only {id, flag}, never the body; bodies never logged). `note_editor_screen` + controller reached
  from the child profile.
- Tests: `test/core/domain/` + `test/features/notes/` (57 new). Full suite 1230 pass; analyze clean
  (verified).
- Review: orchestrator self-review — read 0003c; confirmed both gate conditions, default-private,
  no helper write. Same helper-toggle pattern reviewed in 3.2.
- Decisions/assumptions: `author_id` from currentUser (null under the no-backend fake — column
  nullable). The 3.5 preview shows a "shared notes" GROUP label; rendering actual flagged notes in
  the preview is a 3.5-scope enhancement (not done here).
- Parked/needs human: `updated_at` trigger needs Postgres >= 14 (Supabase default — confirm on apply).
- Commit: (next) feat(notes): child notes + double-gate RLS [stage 3.7]

## [milestone] Phase 3 — People, co-parent & village sharing COMPLETE (3.1–3.7) — 2026-06-17

The trust-model core is built: people hub, child profiles + activities, the protected safety-floor
editors (no hide path), co-parent invite + Combined/Separate mode + sharing toggles, village helper
invite with the live RLS-mirroring preview, the defense-in-depth visibility resolver, and child
notes with the double-gate. Migrations 0002, 0003, 0003b, 0003c, 0003d — each with RLS. Two reviewer
catches this phase: a TOP-severity helper-accept privilege escalation (fixed) and the redaction-style
discipline throughout. 1230 tests; analyze clean. Next: Phase 4 — voice-to-calendar (§3.3).

## [stage 4.1] Speech-to-text abstraction — 2026-06-17

- Shipped: `lib/features/voice/data/` — `SttService` (transport-agnostic: isAvailable/start/stop,
  `Stream<SttTranscript>` + `captureOnce`; `SttSegment` text+confidence+isFinal; `hasLowConfidence`),
  `FakeSttService` (scripted, deterministic), `SttServiceStub` (signals not-wired; real STT parked),
  provider, and `VoiceMemoQueue` (offline memos → SyncQueue entity 'voice_memo', riding the never-drop
  engine; audio path never logged).
- Tests: `test/features/voice/` (43). Full suite 1273 pass; analyze clean (verified). No package added.
- Review: orchestrator self-review (abstraction + fake).
- Parked/needs human (OPEN_QUESTIONS): wire `speech_to_text` + mic permission strings on device; the
  'voice_memo' SyncHandler is registered by the capture controller in 4.3.
- Commit: (next) feat(voice): speech-to-text abstraction + offline memo queue [stage 4.1]

## [stage 4.2] Event-parsing abstraction — 2026-06-17

- Shipped: `lib/features/voice/` — `ParsedEvent` (per-field `ParsedField<T>` value+confidence+
  alternatives; who/title/date/time/location/notes + `ClarifyingQuestion`s; plain-Dart
  `TimeOfDayValue`, JSON round-trip, isHighConfidence), `EventParser` interface, deterministic
  `FakeEventParser` (rule-based: known-name match, day/relative-date, time with am/pm; a bare hour →
  low confidence + "2pm or 2am?" question), `CloudEventParserStub` (LLM parked), provider (fake
  default). Works offline/no-backend.
- Tests: `test/features/voice/` (75). Full suite 1348 pass; analyze clean (verified). No package.
- Review: orchestrator self-review (abstraction + deterministic fake).
- Decisions/assumptions: known child names injected at call-site (prod feeds ChildRepository);
  relative days resolve to the next occurrence (forward scheduling); title is keyword-based in the
  fake (cloud parser infers from any NL).
- Parked/needs human (OPEN_QUESTIONS): real cloud LLM endpoint + key (needs connectivity per §3.3).
- Commit: (next) feat(voice): event-parsing abstraction + deterministic fake [stage 4.2]

## [stage 4.3] Voice capture screen — 2026-06-17

- Shipped: `voice_capture_screen` (route '/voice') + `VoiceCaptureController` — captures via
  `SttService`, shows the FULL who/what-day/what-time/where checklist for the first few memos then
  collapses to a one-line hint (injectable count, threshold 3). OFFLINE (or STT unavailable):
  enqueues the memo via `VoiceMemoQueue` and shows "got it — saved on your phone. … Nothing's lost."
  — capture is never blocked. Online capture surfaces the transcript for the 4.4 confirm step (TODO).
- Tests: `test/features/voice/` (45). Full suite 1389 pass; analyze clean (verified).
- Review: orchestrator self-review (UI/offline).
- Decisions/assumptions: memo count is in-memory per session (persist later); the 'voice_memo'
  SyncHandler is INTENTIONALLY unregistered so queued memos persist (a no-op success would delete =
  lose them) — TODO to register the transcribe-on-reconnect handler once cloud STT is wired.
- Parked/needs human (OPEN_QUESTIONS): transcribe-on-reconnect handler (needs cloud STT); persist
  the memo count; a Today/calendar entry point (mic FAB) deferred to avoid destabilizing tests.
- Commit: (next) feat(voice): guided voice capture screen + offline memo [stage 4.3]

## [stage 4.4] Voice confirmation window — 2026-06-17

- Shipped: `voice_confirm_screen` (route '/voice/confirm') + `VoiceConfirmController` — parses the
  transcript via `eventParserProvider`, renders confident fields plainly and low-confidence (<0.6)
  fields with an amber highlight (AppColors token), shows soft `ClarifyingQuestion` prompts ("2pm or
  2am?"). Accept builds a `FamilyEvent` (date+time→startsAt via `_combineDateTime` with proper
  12am/12pm handling; who→child resolved by name; source='voice') and writes via the offline-safe
  `EventRepository`. Edit (tap-correct; mic-correct TODO), Delete discards. NOTHING is written before
  Accept (accept is the sole createEvent site). 4.3 capture now pushes this screen.
- Tests: `test/features/voice/` (37 new). Full suite 1426 pass; analyze clean (verified).
- Review: orchestrator self-review — read accept()/_combineDateTime; confirmed sole-write-site +
  date/time combine + child-required-to-accept. Comprehensive tests on each risk area.
- Decisions/assumptions: unknown "who" leaves child unset (user picks; accept blocked until set).
- Parked/needs human: mic-correction path (TODO 4.4-mic).
- Commit: (next) feat(voice): confirmation window — highlight/clarify/accept [stage 4.4]

## [stage 4.5] Recurring events + post-accept conflict catch — 2026-06-17

- Shipped: migration `0004_event_recurrence.sql` (recurrence_rule + recurrence_parent_id on
  child_events; RLS inherited). `recurrence.dart` — `RecurrenceRule` (byWeekdays/until/interval) +
  `parse(phrase, today)` + `expand(rule, start, maxOccurrences:60)` + RRULE-ish round-trip. SHARED
  `conflict_detector.dart` (overlap detection per child; back-to-back not a conflict; reused by
  6.6/7.5). Extended `FamilyEvent` with the two nullable fields. Confirm flow: shows the full
  expanded date list BEFORE saving, creates the series (N events sharing a grouping parent_id),
  runs `detectConflicts` after accept and surfaces clashes; nothing before Accept; offline-safe.
- Tests: recurrence (30), conflict_detector (16), confirm-recurring (32), domain (9). Full suite
  1516 pass; analyze clean (verified).
- Review: orchestrator self-review caught + FIXED a data-integrity bug the fakes masked:
  `recurrence_parent_id` had a FK to child_events(id) ON DELETE CASCADE, but the app stamps a fresh
  grouping UUID that is no event's id — a live insert would violate the FK, and the cascade would
  delete the series when one occurrence is removed. Fixed to a plain grouping UUID (no FK), comments
  corrected. No Dart change (already treated as a grouping tag).
- Decisions/assumptions: recurrence expansion starts from today (earliest next occurrence), not the
  parsed single date.
- Parked/needs human: none new.
- Commit: (next) feat(voice): recurring events + shared conflict detector [stage 4.5]

## [stage 4.6] Voice-add monthly quota gating — 2026-06-17

- Shipped: `voice_quota.dart` — `currentMonthVoiceAddCount` (events with source='voice' whose
  updatedAt is in the current month, via the offline-safe event cache + injectable clock) +
  `canAddVoiceEventProvider` (routes through `entitlement.withinLimit(LimitKind.voiceAddsPerMonth,
  count)` — Free cap 10, Premium unlimited; NO scattered if(isPremium)). Wired into
  `voice_confirm.accept()`: at the Free cap it blocks (no event created), shows a calm at-limit
  banner ("you've used this month's quick voice adds — Premium lifts the cap, or add it by hand.")
  with an "add it by hand" route to the ungated manual editor (1.11). Manual entry is never gated.
- Tests: `test/features/voice/` (23 new) incl. a single-entitlement-check proof (flipping only the
  plan source flips the gate) + month-boundary reset. Full suite 1539 pass; analyze clean (verified).
- Review: orchestrator self-review — confirmed the gate is the single entitlement check, at-limit is
  calm (not an error), and the by-hand path is present.
- Decisions/assumptions: updatedAt ≈ creation time; cross-device/billing-grade counting is a future
  server-side refinement. "See Premium" is a no-op until Stage 15.
- Parked/needs human (OPEN_QUESTIONS): billing-grade server-side voice-add counter.
- Commit: (next) feat(voice): monthly voice-add quota gate (Free 10/mo) [stage 4.6]

## [milestone] Phase 4 — Voice-to-calendar COMPLETE (4.1–4.6) — 2026-06-17

STT abstraction, deterministic event parser, guided capture (offline-safe), the confidence/clarify
confirmation window, recurring series + shared conflict detector, and the Free 10/mo quota gate — all
green, committed. Native STT + cloud LLM parked behind interfaces. 1539 tests; analyze clean. Next:
Phase 5 — document vault (§3.4).

## [stage 5.1] Vault models + DocumentRepository — 2026-06-17

- Shipped: `lib/features/vault/data/` — `DocumentRepository` (watch/list/get/addMetadata/update/
  delete per child+folder) over the existing `child_documents` table (guardians-only RLS reused, no
  migration). Offline-first: metadata writes via SyncQueue (entity 'document') + `DocumentSyncHandler`
  + optimistic watch-merge; client UUID is the canonical PK on flush. FAMILY-ONLY — no interface/impl
  method accepts a helperId/helper-scope; storage_path/title/content are never logged. Fake + provider.
- Tests: `test/features/vault/` (53) incl. named security-contract tests. Full suite 1592 pass;
  analyze clean (verified).
- Review: orchestrator self-review — confirmed no helper path + no content logging + offline-first.
- Decisions/assumptions: file-bytes upload deferred to 5.3 (callers pass a precomputed storage_path);
  Storage-object cleanup on delete also 5.3; remote read filters in Dart (family-scale).
- Parked/needs human: real Storage upload/cleanup (5.3 + device file pickers).
- Commit: (next) feat(vault): DocumentRepository (family-only, offline-first) [stage 5.1]

## [stage 5.2] Vault screen — 2026-06-17

- Shipped: `vault_controller` (`VaultView`: docs grouped by the pre-built folders — Artwork, Report
  cards, Medical, Sports — + dynamic folders; selectable filter via `selectedFolderProvider`) and the
  fleshed-out `vault_screen` (route '/vault'): folder chips, document list (title + date hint), and a
  §3.15 empty state ("this is where the important papers live — add the first when you're ready") with
  one "add a document" CTA. No share-with-helper affordance anywhere (family-only). Theme colours.
- Tests: `test/features/vault/` (33 new) incl. security checks (no share/helper/village text). Full
  suite 1625 pass; analyze clean (verified).
- Review: orchestrator self-review (UI).
- Decisions/assumptions: the empty-state CTA targets `/vault/upload` (registered in 5.3 next);
  chip re-tap deselects to "all".
- Parked/needs human: none.
- Commit: (next) feat(vault): vault screen — folders + list + empty state [stage 5.2]

## [stage 5.3] Vault upload flow + expiry-at-filing — 2026-06-17

- Shipped: `FileSource` (photo/PDF/scan pick → `PickedFile`; fake + parked real image_picker/
  file_picker/scanner) + `StorageUploader` (bytes → storage_path; fake + parked private-bucket
  Supabase impl) + `UploadDocumentController` (pick → upload → gentle "does this expire?" prompt →
  `addDocumentMetadata`, offline-safe) + `upload_document_sheet` (route '/vault/upload', wires 5.2's
  CTA). Offline: metadata always enqueued (never blocked); bytes get a placeholder path with a retry
  TODO. Bytes/path/title never logged; no helper path (family-only).
- Tests: `test/features/vault/upload_document_controller_test.dart` (34). Full suite 1659 pass;
  analyze clean (verified). No package added.
- Review: orchestrator self-review (abstractions + UI + offline).
- Parked/needs human (OPEN_QUESTIONS): real device pickers + scanner; PRIVATE Supabase Storage
  bucket + at-rest encryption + RLS; a storage-bytes retry handler to replace the placeholder path on
  reconnect; a child selector on the sheet.
- Commit: (next) feat(vault): upload flow + expiry-at-filing prompt [stage 5.3]

## [stage 5.4] Free vault search — 2026-06-17

- Shipped: `vault_search.dart` — pure-Dart `searchDocuments(docs, {nameQuery, childId, type, date})`
  (case-insensitive title substring; person=childId; type=folder; date=createdAt range; all compose
  with AND; empty=all) + `vault_search_bar` (search field + person/type/date filter chips) wired into
  the vault screen via `vaultSearchResultsProvider` (cross-folder). Gentle empty-result copy + a
  Premium hint that looking inside files is Premium (sets expectations for 5.7). Name+filters only.
- Tests: `test/features/vault/` (66 new: 28 pure-function + 38 widget). Full suite 1709 pass; analyze
  clean (verified).
- Review: orchestrator self-review (pure filter + UI).
- Decisions/assumptions: person chip shows raw childId (resolve via ChildRepository later); date uses
  this-month/this-year presets; search state not reset on navigation (noted).
- Parked/needs human: none new.
- Commit: (next) feat(vault): free search — name + filter chips [stage 5.4]

## [stage 5.5] Secure expiring share link — 2026-06-17

- Shipped: migration `0005_document_shares.sql` — `document_shares` with CREATOR-ONLY RLS (no
  anon/other SELECT) + two hardened SECURITY DEFINER RPCs: `create_document_share` (requires
  guardianship of the doc's child → PT403 otherwise; 256-bit server-minted token; caller can't set
  created_by/view_count; granted to authenticated only) and `resolve_document_share` (the public
  path: zero rows for not-found/expired/exhausted — no oracle; increments view_count before
  returning — race-safe; returns ONLY that one doc's id/storage_path/title, never the table/share
  metadata/other docs; anon granted the function only). Dart: `DocumentShareRepository` (fake +
  Supabase + provider), pure-Dart `share_validity` (expiry by time OR views, whichever first),
  `share_document_sheet` (single-file view-only link + reassurance). Token never logged.
- Tests: `test/features/vault/` (share_validity + document_share_repository). Full suite 1753 pass;
  analyze clean (orchestrator-verified).
- Process note: the developer hit an API error mid-run (no report); all files were complete but the
  test file had `const _now = DateTime(...)` (DateTime isn't const) + lint noise — orchestrator fixed
  (const→final, dart fix, removed an unused getter) to green. The spawned reviewer then hit a session
  limit (2 tool calls); given two interruptions on a security stage, the orchestrator self-reviewed
  the full migration against the established hardened pattern — all properties verified.
- Parked/needs human (OPEN_QUESTIONS): the public file SERVE (short-lived signed Storage URL) belongs
  in a Supabase Edge Function; resolve returns the storage_path for it to sign; bucket stays private.
- Commit: (next) feat(vault): secure expiring single-file share link [stage 5.5]

## [stage 5.6] Expiry & renewal tracking (Free) — 2026-06-17

- Shipped: pure-Dart `expiry_tracker.dart` — urgency windows (expired / soon ≤14d / upcoming ≤60d /
  ok) from `expiresOn` + injectable clock, sorted most-urgent/soonest first (no-expiry excluded);
  theme-token colour mapping (amber/terracotta/sage — no hex); helper-voice nudges. `expiring_soon_
  screen` (route '/vault/expiring-soon') + an "N documents expiring soon" banner on the vault screen.
  Feeds the §7.x reminder engine (TODO marked).
- Tests: `test/features/vault/` (45 new). Full suite 1799 pass; analyze clean (verified).
- Review: orchestrator self-review (pure logic + UI; theme tokens asserted).
- Decisions/assumptions: lead-time windows are constants (could be user-configurable later); `ok`
  tier computed but not shown (available for the reminder scheduler).
- Parked/needs human: schedule a reminder ahead of expiry once Stage 7.1 NotificationService lands.
- Commit: (next) feat(vault): expiry & renewal tracking (Free) [stage 5.6]
