# BackPocket Mom — Open Questions for human review

Things the autonomous build could not fully resolve overnight: judgement calls,
blocked integrations, and safety/privacy/money/data-shape decisions where the most
conservative default was applied and flagged. Each item has enough context to answer
cold. Nothing here blocked the run.

Format: **[area] question** — context — what I did (the conservative default) — what I need.

---

## Process / tooling

- **[tooling] Subagent registration mid-session.** The orchestration manual has the
  Orchestrator install `.claude/agents/developer.md` and `.claude/agents/code-reviewer.md`
  and spawn them by type. The files were installed successfully and will be picked up by
  any new Claude Code session, but this already-running session did not hot-load them, so
  `subagent_type: developer|code-reviewer` errored as "not found".
  - What I did: ran every developer/reviewer subagent as `general-purpose` with the agent's
    persona pasted into the prompt and the model pinned to match (developer→sonnet,
    reviewer→opus). Same one-task-per-agent clean-context discipline.
  - What I need: nothing required. If you want native agent typing, just restart the
    session once — the files are already on disk under `.claude/agents/`.

## Integrations parked for native/device/key reasons

(Stages that touch these are built Dart-side behind an interface, unit-tested, and the
platform layer is stubbed. Specific stage references get appended as the build reaches them.)

- Native home-screen widgets (iOS SwiftUI/WidgetKit, Android Kotlin/Jetpack Glance).
- On-device voice speech-to-text (§3.3) and the cloud LLM parse step.
- ML Kit OCR for Premium vault content search & auto-read expiry (§3.4).
- Google Maps + live-traffic smart travel reminders (§3.6 Premium).
- Real Google/Apple OAuth, FCM push, real payments / in-app purchase entitlement.
- Live Supabase backend (migrations are written + reviewed but not applied; repos
  tested against fakes). iOS builds (need a Mac).

## Security — defense-in-depth follow-up (non-blocking)

- **[security] Invitation creation references arbitrary child/pet ids.** Invite creation is a
  direct INSERT gated only by `inviter_id = auth.uid()`; the target FK only requires the child/
  pet to EXIST. The real exploit (a forged-target helper invite granting cross-family access)
  is closed at ACCEPT time — `accept_helper_invitation` now raises `PT403` unless the inviter
  actually guards the target (Stage 3.5 review fix). Co-parent accept was already safe (it only
  links the inviter's own children). What remains is a minor child/pet-id EXISTENCE enumeration
  via the insert FK. Defense-in-depth follow-up: gate the `invitations` INSERT so the inviter
  must guard the target (a `with check` that calls `is_child_guardian`/`is_pet_guardian`, or a
  create-invite RPC). Low severity; flagged for the trust-model hardening pass.

## Data integrity — deferred to a dedicated sync-id-reconciliation stage

- **[data] Offline child id → event FK.** A child created offline gets a placeholder
  local id (`local-child-N`); the server assigns the real UUID via the
  `create_child_with_guardian` RPC on flush (Stage 1.7). An event created for that
  not-yet-flushed child (Stage 1.11) would carry the placeholder `child_id`, which fails
  the `child_events.child_id` foreign key when the event flushes — the event would park
  in the SyncQueue (never lost, but never synced) until resolved.
  - What I did: left it as a `TODO(human-review)`; did NOT hack the sync engine from a
    feature stage. Both child and event repos use the never-drop queue, so no data is lost.
  - What's needed: a small sync-layer stage that remaps placeholder ids to server ids
    across queued rows once a create flushes (child create returns the server id →
    rewrite dependent queued payloads). Best done as its own stage touching
    `lib/data/sync/`. Until then, creating an event for a child that was itself created
    in the same offline session won't sync until the child is online-created first.
