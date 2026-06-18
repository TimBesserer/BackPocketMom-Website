# BackPocket Mom — Product Specification (mirror)

> Plain-text mirror of `BackPocket_Mom_Spec 2.docx` (repo root) so tools and Claude
> Code can read it directly. The `.docx` is canonical — if anything here drifts,
> trust the `.docx`. Version 1.0 · Complete feature specification.

The calm, wise mom in your back pocket. A parent-assistance app for busy families
and fur-parents.

## 1. Product vision

BackPocket Mom gathers the scattered logistics of family life — schedules,
reminders, documents, and memories — into one calm, trustworthy place.

The defining idea: the "mom" in BackPocket Mom is **not** the user. It is the app
itself — the calm, wise, reassuring presence in your back pocket that helps you
navigate from the sidelines, the way a good mother does. The user is the one being
helped. The app never demands that the user perform motherhood perfectly; it is the
support system any busy parent, fur-parent, single dad, grandparent, or caregiver
wishes they had.

This reframing drives every design and copy decision. The voice is a helper, never
a boss. It meets the user with warmth, never judgment. When the day is heavy, it
does not say "you are overloaded" — it says "today's a full one, here's what I can
take off your plate."

### Core design philosophy

- **Act confidently when sure, ask gently when not.** The app handles obvious cases
  silently and only asks the user when something is genuinely a judgment call. This
  appears in voice parsing, duplicate detection, conflict alerts, and more.
- **Guidance rises to meet complexity.** Simple screens get a gentle nudge; nuanced,
  special features get a moment to reveal their value.
- **Comfort first, then a gentle hand forward.** Reassure, then guide, then offer a
  little wisdom — never overwhelm.
- **Meet every generation where they are.** Users span a wide range of tech comfort,
  from young parents to grandparents. Every flow offers a simple path and avoids
  assuming technical knowledge.
- **Never fail a parent at a tender moment.** A precious photo must never be lost to a
  storage wall; an emergency record must be reachable offline; sensitive moments are
  handled with grace.

### Target users

Busy parents juggling children, work, household, and activities; single parents;
co-parents in shared or separate households; grandparents and caregivers raising or
helping with children; and fur-parents with demanding, unpredictable schedules whose
pets are cared for by their own "village."

## 2. Brand and visual direction

**Personality:** warm, calm, wise, gently witty, and reassuring — like a loving
mother lending a hand from the sidelines. Never clinical, never scolding, never
corporate.

**Colour palette**

| Colour | Use |
|---|---|
| Deep espresso brown (#2D2320 – #5C3D2E) | Headers, primary buttons, brand anchor |
| Warm terracotta / peach (#E8A87C) | Accent, highlights, the brand's warmth |
| Cream (#F5ECD7) | Text on dark surfaces, soft backgrounds |
| Sage green (#7BAF83) | Success, "on track," calm states |
| Soft rose (#D4537E) | Children/dance accents, memory features |
| Muted amber (#BA7517) | Warnings, "needs attention" states |

**Typography:** a warm serif (e.g. Playfair Display) for headlines and emotional
moments; a clean, friendly sans-serif (e.g. DM Sans) for body and interface. Always
sentence case, never all-caps or title case.

**Tone of voice examples**
- Reminder: "Tomorrow: Ella's dentist at 2pm. Her insurance card is in her vault if
  you need it. You're ahead of it."
- High load: "Today feels full — 6 events and lots of driving. Here's what I can take
  off your plate."
- Offline capture: "Got it — saved on your phone. I'll add this the moment you're back
  online. Nothing's lost."

## 3. Feature specification

### 3.1 Onboarding and account creation

Goal: a new user should feel excited and confident that the chaos of family life will
be organized in one place — within the first 30 seconds.

- **Welcome flow:** three swipeable intro slides, each making one emotional promise:
  (1) "Every loose end, finally gathered." (2) "One schedule for everyone." (3) "Like
  having your mom in your pocket." Each is skippable.
- **Account creation:** three sign-up options side by side: Continue with Google,
  Continue with Apple, and email + password. No user is turned away for lacking a
  preferred method.
- **Guided-but-skippable family setup:** Step 1 — first child (name, age or birthday,
  colour/avatar; nothing more required). Step 2 — first pet (skippable; name + type).
  Step 3 — connect first app (skippable). Every step has a clear "Skip for now."
- **Pinned setup home base:** a persistent checklist the user can return to anytime,
  organized into People & pets; Apps to connect; Yearly & repeating reminders to add;
  and items to capture. Shows a progress ring. The antidote to a blank-slate first
  experience.

**Child profile data model**

| Collected at onboarding | Available to add later |
|---|---|
| Name; age/birthday; colour/avatar | School, grade, teacher; doctor & dentist; activities & teams; emergency contacts; allergies & medical notes |

### 3.2 People: parents, co-parents, and the village

- **Two parent identities:** each parent has their own independent identity — separate
  login, separate private space, separate ownership of their data. Never a single
  shared household login. The children are the shared centre both parents coordinate
  around.
- **Combined vs. Separate mode (single settings switch):** Combined mode (default for
  couples together) — all sharing toggles start ON; one person sets up once, it works
  for both. Separate mode (households apart) — all toggles start OFF except the
  protected floor; each parent opts in to what they share. Both identities always exist
  underneath, so switching modes never rebuilds anything. A family that splits later
  simply flips the switch — the protected floor keeps flowing and each parent regains
  private space, with no painful account migration. Switching uses calm, non-dramatic
  language ("each parent now controls what they share").
- **Per-category sharing toggles (each parent controls their own side):** personal
  schedule, child schedules, reminders, notifications, village helper data. Sharing is
  never forced to be equal — one parent sharing does not force the other.
- **Protected child-safety floor (always shared, cannot be toggled off):** allergies,
  current medications, and emergency contacts always remain visible to both parents in
  either mode. No parent can hide safety-critical child information from the other.
- **Village helpers (limited, per-child and per-pet access):** grandparents,
  babysitters, dog-walkers, daycare, carpool parents — invited per child and per pet. A
  Tuesday sitter who only watches one child sees only that child. The parent chooses
  exactly what each helper sees from a list of toggles.
  - Child info toggles: schedule & activities; allergies & medical alerts; physician &
    emergency contacts; sports & team details; notes specifically flagged "share with
    helpers."
  - Pet care toggles (per pet): feeding instructions; walks & potty breaks; daycare
    pickup & drop-off; medications & vet contact; and the pet photo wall.
  - Always private (never shared with village): the document vault, insights & patterns,
    and the parents' private life. A live preview shows the parent exactly what a helper
    will see before saving.
  - Invites sent by email or by text/shareable link — the parent's choice per person.

### 3.3 Voice-to-calendar

The user speaks; the app turns words into calendar events and reminders on the right
person's agenda.

- **Guided mic prompt (adaptive):** when recording, a checklist reminds the user to
  include who, what day, what time, and where. Shows the full checklist for the first
  several memos, then fades to a one-line hint.
- **Confidence highlighting:** the transcription confirmation shows confident details
  plainly and gently highlights uncertain parts. If something important is ambiguous, a
  soft clarifying question appears (e.g. "2pm or 2am?").
- **Confirmation window:** nothing is saved until the user chooses Accept, Edit, or
  Delete & try again.
- **Editing (tap or speak):** tap any field to correct it manually, or tap a mic to
  speak the correction.
- **Recurring events:** "every Tuesday & Thursday until July" becomes a clear rule with
  the full list of dates shown before saving. The conflict manager catches clashes
  (e.g. a holiday) after acceptance.
- **Technical:** device speech-to-text captures audio; an online AI layer parses natural
  language into structured fields (who, type, date, time, location, notes). Voice
  transcription requires connectivity; offline memos are queued and transcribed on
  reconnect.

### 3.4 Document vault

A secure, per-profile document store for each child and pet — artwork, report cards,
medical and vaccination records, insurance cards, and more.

- **Upload:** by photo, PDF, or scan, into pre-built folders (e.g. Artwork, Report
  cards, Medical, Sports).
- **Secure sharing:** share a single document via a secure link that expires after 7
  days OR a couple of views, whichever comes first. View-only by default. Only that one
  file is shared; the rest of the vault stays private.
- **Search — Free:** by name plus filter chips (by person, type, date).
- **Search — Premium:** content search reads inside documents (including scanned images
  via text recognition) so poorly-named files like "scan_004.jpg" are still found. Set
  expectations gently: clearer scans search better.
- **Expiry & renewal tracking — Free:** smart prompts at filing time ("does this expire?
  when?") capture expiry dates; the app reminds the user well ahead.
- **Expiry & renewal tracking — Premium:** the app auto-reads the expiry date inside the
  document and asks the user to confirm. Surfaces "expiring soon" items with
  colour-coded urgency.

### 3.5 Connected apps and schedule sync

Pull schedules from the apps families already use (TeamSnap, dance/activity apps, school
board calendars, Google/Apple/Outlook calendars) into one unified family view.

- **Two connection methods:** (1) sign-in connect for apps with proper login/API (e.g.
  TeamSnap); (2) calendar-link (iCal) paste for studios and school boards that only
  publish a feed. This dual approach covers almost everything a family uses.
- **Guided connection:** each step has warm reassurance ("you type your password on
  their secure screen, never here"; "read-only access"; "which child is this team
  for?").
- **Graceful dead-end:** for apps that can't connect, guide manual entry and let the user
  tell you which app they wanted — this becomes a prioritized integration wishlist.
- **Broken-sync handling:** a gentle in-app banner when a connection breaks, plus a
  notification if it stays broken more than a day or two. The banner links straight to
  the connected-apps page to reconnect.
- **Duplicate detection (smart blend):** exact-match duplicates (same child, title, time,
  place) merge automatically with a quiet note; less-certain matches are flagged for the
  user to decide (merge or keep both).
- **Unified view:** all events from all sources, colour-coded by origin, in one timeline,
  with conflicts shown inline.
- Free includes 5 app connections; Premium unlimited.

### 3.6 Notifications and reminders

- **Default posture (balanced):** a gentle morning summary, plus timely event reminders.
  Present and caring, never noisy; fully adjustable.
- **Reminder rhythm — Free:** an evening-before heads-up (which does the real preparation
  work) plus a 1-hour-before same-day reminder.
- **Smart travel reminders — Premium:** syncs with Google Maps and live traffic to tell
  the user exactly when to leave ("Leave in 10 minutes; slowdown on the 403; 28-min
  drive"). Requires user-granted location + Maps connection. If location is declined, it
  gracefully falls back to the 1-hour reminder — no one is shut out.
- **Conflict alerts:** visually distinct, with a bright amber "needs a decision" caution
  bar and inline action buttons, so a real clash is never mistaken for a routine nudge.
- **Quiet hours:** user-defined silent windows. A single optional toggle, "let urgent
  conflicts still reach me," lets the user decide whether genuinely imminent clashes may
  break the quiet.

### 3.7 Intelligence: calm load meter, insights, annual patterns

- **Calm load meter:** a daily/weekly read of how heavy life feels, weighing event count,
  travel between events, breathing room, unresolved items, and whether protected time
  survived. Tapping it explains the score in plain words ("Today feels full: 6 events,
  lots of driving, your creative time got squeezed"). Never a mysterious number.
- **Insight engine — new-user state:** opens in a warm "getting to know you" state that
  grows with the family. Delivers immediate simple value from day one ("your calmest day
  this week is Thursday") and clearly shows deeper insights unlocking over the following
  weeks. Never empty, never fake.
- **Predictive annual patterns:** anticipatory reminders for things that recur yearly.
  Two paths: (1) the user manually seeds known rhythms ("camp registration in March"),
  working from day one; (2) the app discovers patterns from calendar history over time
  ("Emma's hockey tryouts have landed in mid-April two years running — remind you next
  year?"). Surfaces a heads-up one to two months ahead. Pattern discovery grows richer in
  year two; manual seeding fills the gap immediately.

### 3.8 Photo wall and memory features (Premium)

- **Per-profile photo wall:** each child and pet can have a curated photo wall — a
  highlight reel of chosen moments, explicitly NOT a camera roll. Premium-only.
- **Memory stamp:** each photo carries a date (editable for old scans) and a short note
  ("why this moment matters"). Because every photo has a date, the wall auto-orders
  chronologically.
- **Select & export reels:** select multiple photos and export in date order to build a
  birthday or year-in-review reel to share outside the app. The user chooses per export
  whether to include the captions/dates or export photos only (protecting private notes).
- **Village sharing of photo walls:** per person by toggle — e.g. "dog-grandma" sees the
  pet photos while the dog-walker does not; grandma sees a child's reel while a sitter
  does not.

### 3.9 The lifelong memory handoff

When a child grows up, the parent can package and pass on a complete, curated archive of
that child's whole childhood — photo wall with stories, artwork, report cards, and health
history. Designed as an intentional, ceremonial moment ("Give Ella her childhood, kept
whole"), not a cold data export. The app's purpose evolves from managing the busy years
to preserving the legacy.

### 3.10 Authentication and security

- **Sign-in:** email/password, Google, or Apple.
- **Password recovery:** a 6-digit code sent to the user's email.
- **Biometric lock (default ON):** Face ID / fingerprint required when reopening the app
  after being away. Can be turned off in settings. Protects sensitive family/medical data.
- **Devices:** the user can see all signed-in devices and remotely sign out a lost device.
- **Account deletion (with grace period):** offers data export first, then a 30-day
  recoverable pause, then permanent unrecoverable deletion — stated in plain language.
  Export comes before delete; warm, clear, never falsely reassuring.

### 3.11 Privacy and data transparency

- **Foundational promise:** BackPocket Mom never sells or shares family data. Ever. Funded
  only by Premium subscriptions and storage add-ons. Both an ethical backbone and a
  marketing advantage.
- **Three layers of trust:** (1) a plain-language "your privacy, plainly" home; (2)
  in-context reassurances at the exact sensitive moments (uploading a medical record,
  inviting a helper, enabling location); (3) a "your data" dashboard where the user can
  see everything held, download it, and delete it.
- **Encryption:** documents, schedules, profiles, and records are encrypted; the company
  does not read private documents.
- **Legal note:** the binding privacy policy must be reviewed by a privacy lawyer before
  launch, especially for children's data under COPPA (US), PIPEDA (Canada), and GDPR (EU).

### 3.12 Storage

- Free: 1 GB. Premium: 25 GB included. Additional storage available as paid add-on tiers.
- **Never a sudden wall:** gentle early warnings at ~80% and ~90% in the helper-mom voice;
  if the limit is reached, new photos and documents still save during a short grace period
  rather than being blocked or lost.

### 3.13 Offline behaviour

- **Works offline:** viewing the calendar/day, reading reminders, opening previously-viewed
  documents, recording voice memos, and adding events/notes (queued to sync on reconnect).
- **Emergency essentials always on device:** the app proactively keeps the upcoming
  schedule and critical records (children's allergies & medical info, insurance/health
  cards, emergency contacts) saved on the phone, available with zero signal — a genuine
  safety responsibility.
- **Capture now, sync later:** the user is never blocked from capturing. Queued items sync
  automatically when signal returns.
- **Adaptive reassurance:** calm by default (a quiet offline indicator), but a warm
  confirmation appears at the moment of action ("Got it — I'll add this when you're back
  online").

### 3.14 Settings and home-screen widget

- **Settings:** a search bar plus grouped categories — Family & people; Notifications;
  Privacy & security; Connected apps; Account & plan; Personalization (including the
  BackPocket Mom voice on/off toggle and appearance). Search lets users find any control
  without knowing the category.
- **Home-screen widget:** one well-designed default summary (no customization, to avoid
  overwhelm), in three sizes. Shows at-a-glance info — next event, today's timeline,
  reminders/pets due, calm load — but sensitive details stay behind the Face ID lock;
  tapping opens the app and unlocks.

### 3.15 Empty states

- **Simple screens (gentle nudge):** self-explanatory screens (photo wall, document vault)
  get a warm line and one clear next-step button.
- **Nuanced screens (reveal the value):** special features (annual reminders, insights) use
  the empty state to demonstrate their value with concrete previews ("this is where I get
  ahead of camp registration and hockey tryouts"), so the magic is discovered rather than
  hidden.

## 4. Plans and pricing

A generous free tier to win trust and adoption; a Premium subscription and storage add-ons
as the only revenue sources. No data is ever monetized.

| Feature | Back Pocket Basic (Free) | Back Pocket Premium (Paid) |
|---|---|---|
| Children profiles | Up to 4 | Unlimited |
| Co-parent (full access) | 1 included | 1 included |
| Village helpers (limited, per-child/pet) | 1 helper | Unlimited |
| Pet profiles | 2 | Unlimited |
| App connections | 5 | Unlimited |
| Document vault storage | 1 GB | 25 GB+ (add-ons available) |
| Voice-to-calendar adds | 10 / month | Unlimited |
| Vault search | Name + filters | + Content search (reads inside files) |
| Expiry tracking | Smart prompts at filing | + Auto-read expiry dates |
| Reminders | Evening-before + 1 hour | + Smart live-traffic travel reminders |
| Pattern insights | Basic weekly summary | Full insight engine |
| Photo walls & memory reels | — | Included |
| Conflict detection | Yes | Yes |
| BackPocket Mom voice | Yes (toggle) | Yes (toggle) |
| Price | Free forever | ~$8/month or ~$67/year |

Storage add-ons (on top of Premium): roughly +50 GB for ~$2/mo, +150 GB for ~$5/mo,
+500 GB for ~$12/mo. Final prices to be validated against market and costs.

## 5. Technical notes for the build

- Cross-platform mobile app (iOS and Android) with a home-screen widget on each. A
  framework like Flutter or React Native lets one codebase serve both. **(This repo:
  Flutter + Dart.)**
- Cloud backend for accounts, encrypted storage, and sync. Per-user and per-profile data
  isolation; granular permission layer driving the co-parent and village sharing model.
  **(This repo: Supabase — Postgres + RLS.)**
- Calendar integrations via official APIs (Google, Apple/CalDAV, Outlook, TeamSnap where
  available) plus universal iCal feed subscription as the fallback method.
- A normalized event store: all sources flow into one internal event model, enabling the
  unified view, conflict detection, and duplicate merging.
- Voice: on-device speech-to-text for capture; a cloud AI/LLM for natural-language parsing
  into structured event fields.
- Premium document intelligence (content search, auto-read expiry) via OCR/text-recognition
  on uploaded files and scans.
- Encryption at rest and in transit; biometric lock via the OS; secure expiring share links
  generated server-side.
- Offline-first design: local cache of schedule and emergency essentials; an action queue
  that syncs on reconnect.
- Push notifications respecting quiet hours and per-category preferences; geolocation + Maps
  API for smart travel reminders (opt-in).

## 6. Guiding principles (keep these visible)

- The "mom" is the app, not the user. It helps from the sidelines; the user is the one
  being helped.
- Act confidently when sure, ask gently when unsure.
- Guidance rises to meet complexity.
- Meet every generation where they are — never assume tech savvy.
- Never fail a parent at a tender moment — memories and emergencies are sacred.
- Privacy is a promise and a competitive advantage — never monetize data.
- Reduce overwhelm in everything — calm by default, reassuring at the moment of worry.
