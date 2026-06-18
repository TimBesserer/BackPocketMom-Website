# Autonomous build — orchestration manual

This file is the operating manual for an **unattended, overnight** build of the full
BackPocket Mom app. The main Claude Code session is the **Orchestrator**. Re-read this
file, `CLAUDE.md`, `docs/PLAN.md`, and the tail of `docs/BUILD_LOG.md` at the **start of
every stage** — context will compact over a long run, and these files are your memory.

## Mode

- **Fully autonomous.** Do not stop to ask for approval. Run until the plan is complete or
  no actionable task remains. Make sensible, documented decisions instead of pausing.
- **Build the entire app** — every feature in `docs/spec.md` (§3.1–§3.15), Free and Premium.
- **Check in after every stage** with a git commit and a `BUILD_LOG.md` entry.
- **Keep context clean** by doing all implementation and review inside subagents, one task
  per subagent. The Orchestrator holds only high-level state.

## Roles

- **Orchestrator (you, the main session).** Owns the plan, sequences work, spawns subagents,
  runs the quality gates, commits each stage, and logs. Writes little code directly.
- **`developer` subagent.** Implements exactly one assigned task with tests, then returns a
  report. Spawned fresh per task (clean context). Defined in `.claude/agents/developer.md`.
- **`code-reviewer` subagent.** Reviews one developer's diff against the conventions, spec,
  security, and tests; returns APPROVE or CHANGES-REQUESTED. Read-only. Defined in
  `.claude/agents/code-reviewer.md`.

Subagents do **not** spawn their own subagents — the Orchestrator is the only spawner, which
keeps the agent tree flat and reliable.

```
Orchestrator (main session)
  ├─ spawn developer  → implements task + tests → report
  ├─ spawn code-reviewer → APPROVE / CHANGES-REQUESTED
  ├─ (loop until APPROVE or retry budget hit)
  ├─ run gates → commit → append BUILD_LOG → tick PLAN.md
  └─ next task …
```

## Phase 0 — Planning (no human approval needed; proceed straight into building)

1. Read `CLAUDE.md`, `docs/spec.md`, and the existing scaffold (`lib/`, `supabase/`,
   `pubspec.yaml`). Confirm a clean baseline with `flutter analyze`.
2. Spawn a `developer` subagent with an **architect brief**: "Produce `docs/PLAN.md` — do not
   write feature code." The plan must contain:
   - A feature inventory mapping every spec section (§3.1–§3.15) to concrete features/screens,
     each tagged Free or Premium.
   - A phased roadmap covering the **whole** app: Phase 1 = foundations (auth, data layer,
     models, repositories, the offline sync engine, the Free-vs-Premium entitlement gate),
     then a phase per feature area, ending with polish + store-prep. Each phase broken into
     **stages** (a stage = one committable unit of work). For each stage: scope, spec section,
     DB tables/migrations/RLS needed, tests required, and a concrete definition of done.
   - Dependencies and the build order.
3. Spawn the `code-reviewer` to sanity-check the plan (coverage, ordering, testability).
   Fold in fixes.
4. Commit `docs/PLAN.md`. **Do not wait for a human — begin Phase 1 immediately.**

## The build loop (repeat per stage until the plan is done)

1. **Refresh state.** Re-read `CLAUDE.md`, this file, `docs/PLAN.md`, and the last ~50 lines of
   `docs/BUILD_LOG.md`. Pick the next unchecked stage whose dependencies are met.
2. **Spawn a `developer`** with a precise brief (template below). One stage only.
3. The developer implements, writes tests, runs the local checks, and returns a report.
4. **Spawn the `code-reviewer`** on the developer's diff. It returns APPROVE or
   CHANGES-REQUESTED with specific items.
5. If CHANGES-REQUESTED, spawn a fresh `developer` to address the items. **Retry budget: 2
   review rounds.** If still not passing after that, **park** the stage (see Retry/park) and
   move to the next independent stage — do not halt the run.
6. **Run the gates yourself** (below). If anything fails, spawn a `developer` to fix; same
   retry budget, then park.
7. **Checkpoint:** `git add -A && git commit` with a clear message
   (`feat(<area>): <stage> [stage N.M]`). This is the per-stage check-in.
8. **Log:** append a `BUILD_LOG.md` entry. Tick the stage in `PLAN.md`.
9. Next stage.

### Developer brief template (Orchestrator fills this in)

```
TASK: <stage id + one-line goal>
SPEC: docs/spec.md §<section> — <what it must do, in the helper voice>
SCOPE: implement ONLY this stage. Files you may create/edit: <paths>. Do not touch unrelated code.
BUILD ON: <existing files/providers/tables to reuse>
CONVENTIONS: follow CLAUDE.md exactly (feature-first; ConsumerWidget screens; Riverpod
  notifiers in application/; Supabase only via repositories in data/; offline writes through
  the Drift sync queue; theme colours/styles only; sentence-case helper-voice copy).
DATA: if you add a table, ship a migration in supabase/migrations/ WITH its RLS policies.
TESTS: add unit/widget tests for new logic; they must run on the host (no emulator) and pass.
DONE WHEN: flutter analyze clean, flutter test green, (build_runner re-run if Drift changed),
  copy follows the voice rules, no secrets, no hard-coded colours.
RETURN: a report — files changed, what/why, tests added + results, assumptions made, and any
  TODO(human-review) you left. Do NOT commit; the orchestrator commits.
```

## Quality gates (Orchestrator runs these before every commit)

```bash
dart run build_runner build --delete-conflicting-outputs   # only if Drift/codegen changed
flutter analyze                                             # must be clean
flutter test                                                # must be green
```

A stage is **not** committable until analyze is clean and tests pass. Never commit red.

## Checkpoint / commit conventions

- One commit per stage, after gates pass. Conventional-commit style:
  `feat(calendar): unified day timeline [stage 4.2]`, `test(...)`, `fix(...)`, `chore(...)`.
- Commit `docs/PLAN.md`, `docs/BUILD_LOG.md`, migrations, and code together for that stage.
- The repo already has a working remote on the user's machine; commits are local checkpoints.
  Do not `git push` unless it succeeds non-interactively — a failed push must never block the
  run (just keep committing locally).

## Logging — `docs/BUILD_LOG.md` (create if missing)

Append after every stage so the morning review is a single scroll:

```
## [stage N.M] <title> — <timestamp>
- Shipped: <what now works>
- Tests: <files> — analyze clean, N tests pass
- Decisions/assumptions: <bullets>
- Parked/needs human: <none | item + why> (also added to docs/OPEN_QUESTIONS.md)
- Commit: <hash/subject>
```

Anything needing a human (a real judgement call, a blocked integration, a safety/privacy/
money question) goes in `docs/OPEN_QUESTIONS.md` with enough context to answer it cold — then
keep going.

## Retry / park policy (never halt the whole run)

- A stage that fails review or gates twice is **parked**: revert or stash its partial work so
  the tree stays green, log it to `BUILD_LOG.md` + `OPEN_QUESTIONS.md`, and move to the next
  independent stage. Returning later is fine.
- If a stage is blocked by something unavailable overnight (below), scaffold what you can,
  unit-test the pure-Dart parts, mark the rest `TODO(human-review)`, log it, and continue.

## What can't be fully done unattended — scaffold + flag, don't block

- **Live Supabase.** `.env` may be empty. Do **not** require a live backend. Write migrations
  and repository code, but test repositories against fakes/mocks. Don't try to apply migrations
  to a cloud project.
- **Device-only work.** Run unit + widget tests on the host (`flutter test`). Don't write tests
  that need a running emulator/iOS simulator for the overnight gate.
- **Native home-screen widgets** (SwiftUI/WidgetKit, Kotlin/Glance), **voice STT**, **ML Kit
  OCR**, **Maps/traffic** — these need native builds, devices, or API keys. Build the Dart-side
  abstractions and data bridges, unit-test those, stub the platform layer behind an interface,
  and log the platform work for later.
- **iOS** builds need a Mac. Keep platform-specific code behind abstractions; don't attempt iOS
  builds.

## Safety & privacy carve-out (still no human stop)

Honor the data-model invariants and security rules in `CLAUDE.md` at all times. When something
touches child safety, privacy, money, or the shape of the data model and the spec is ambiguous:
implement the **most conservative, privacy-preserving default**, mark it
`TODO(human-review): <question>`, record it in `OPEN_QUESTIONS.md`, and continue. Never take a
destructive or irreversible action (no deleting user data, no real payments).

## Stop condition

Stop only when every stage in `docs/PLAN.md` is checked off, or no actionable (unblocked) stage
remains. Then write a **FINAL SUMMARY** to `BUILD_LOG.md`: what's complete, what's parked and
why, the open questions, and the recommended next steps for the human in the morning.
