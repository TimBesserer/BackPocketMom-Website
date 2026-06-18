<!--
=========================================================================
 HOW TO LAUNCH (read me first — this comment is for you, Tim, not the agent)
=========================================================================
1. This builds the PRE-LAUNCH MARKETING SITE (not the app). Run it from the
   BackPocketMom-Website repo root.

2. One thing to decide before/after: the email provider. The build wires a clean,
   on-brand signup form to a single config value (FORM_ENDPOINT) and defaults to
   Kit (formerly ConvertKit). Make a free Kit account, create a "form," and paste
   its POST URL where the prompt tells the agent to leave a placeholder — or just
   let it scaffold with a placeholder and fill it in after. Beehiiv / Buttondown /
   Formspree work too: same form, swap the one endpoint.

3. Start Claude Code in the repo root. Normal (attended) mode is fine — this is a
   small, single-session build, not the overnight app build:
     claude
   Paste EVERYTHING BELOW THE LINE as your first message.

4. When it's done: open public/index.html locally to eyeball it, then follow the
   Cloudflare Pages steps it prints (output directory = public, no build command).

 Source of truth: docs/WEBSITE_PLAN.md (the plan) and docs/spec.md (the product).
=========================================================================
-->

---

You are building the **pre-launch marketing website** for **BackPocket Mom** in
this repo (`BackPocketMom-Website`). It is a small, warm, static site with two
jobs: explain what the app is, and collect a launch-notification email list. This
is **not** the app — do not build app features, accounts, or a backend.

Work in a focused single session: read the inputs, build the site, then run the
self-check at the end. Keep it simple — plain static files, no framework.

### Step 0 — Read the inputs (do this first)
1. Read **`docs/WEBSITE_PLAN.md`** in full — it is the source of truth for scope,
   structure, decisions, and the definition of done. Follow it.
2. Read **`docs/spec.md`** §1–§2 (vision, brand, voice) and skim §3–§4 (features,
   pricing) for accurate teaser copy.
3. Read **`CLAUDE.md`** voice & copy rules. Note the defining idea: **the "mom" is
   the app, not the user.** Helper voice, never boss. **Sentence case everywhere.**
4. Look at the assets in **`docs/Images/`** (logos + mark, SVG and PNG).

### Step 1 — Locked decisions (do not deviate)
- **Plain HTML + CSS + JS. No framework, no build step, no Node tooling.**
- Deployable site goes in a top-level **`public/`** directory (so `docs/` and the
  spec are never published). Cloudflare's build output dir will be `public`.
- **Email capture:** a native, on-brand `<form>` (NOT a third-party iframe embed)
  that submits via `fetch` to a single configurable endpoint. Put the endpoint in
  one clearly-commented constant in `assets/js/main.js`:
  `const FORM_ENDPOINT = "PASTE_KIT_FORM_POST_URL_HERE"; // Kit/ConvertKit form action; or Beehiiv/Buttondown/Formspree`
  Include a working native-POST fallback so the form still submits if JS fails.
- No database, no analytics, no cookie banners.

### Step 2 — Build the site
Create this structure (copy the listed assets out of `docs/Images/` into
`public/assets/img/` — do not reference `docs/` from the deployed site):

```
public/
  index.html  privacy.html  terms.html  404.html
  assets/css/styles.css
  assets/js/main.js
  assets/img/   (copied logos + mark + favicon + og-image)
  favicon.svg  favicon.ico  apple-touch-icon.png  og-image.png
  robots.txt   sitemap.xml   _redirects
```

**Brand tokens** — define as CSS variables in `styles.css`; never hard-code a hex
in markup:

```
--espresso:#2D2320; --espresso-light:#5C3D2E; --terracotta:#E8A87C;
--cream:#F5ECD7; --sage:#7BAF83; --rose:#D4537E; --amber:#BA7517;
```

**Type:** Playfair Display (serif headlines/emotional lines) + DM Sans (body/UI)
via Google Fonts `<link>` with `font-display: swap` and system-font fallbacks.
Sentence case in every headline and button.

**Landing page section flow** (`index.html`), per the plan:
1. Header — logo left (`backpocket-mom-logo-no-tagline.svg`); transparent over
   hero, solid on scroll; a small "notify me" button that scrolls to signup.
2. Hero — the mark + headline *"the calm, wise mom in your back pocket"*; a
   one-sentence subhead; the primary email signup form above the fold.
3. The promise — the three lines: *"every loose end, finally gathered," "one
   schedule for everyone," "like having your mom in your pocket."*
4. What it helps with — 4–6 cards in plain words from the spec: one calm family
   calendar (voice-to-calendar + connected apps), a document vault, the village
   (share just what a sitter/grandparent needs), gentle night-before reminders,
   the calm load meter.
5. Privacy promise — a distinct band: *"your family's data is never sold or
   shared. ever."* with a link to `privacy.html`.
6. Pricing teaser — soft "free vs premium, coming soon": Back Pocket Basic (free
   forever) vs Back Pocket Premium (~$8/mo). No buy button.
7. Closing signup — repeat the email form ("we'll only email you once: the day
   it's ready").
8. Footer — small logo (`backpocket-mom-logo.svg`), tagline, links to privacy +
   terms, copyright, a warm sign-off.

**Privacy & terms pages:** plain-language, on-brand, **placeholders pending legal
review**. Open each with a calm banner noting it's a draft and the binding version
will be reviewed by a privacy lawyer before launch (children's data: COPPA /
PIPEDA / GDPR). The privacy page should restate the spec's real promises (never
sell or share data; funded only by subscriptions; encryption; users can see,
export, delete their data). Do not present this as final legal advice.

**Signup form behaviour:** one email field + button; HTML5 validation; a hidden
honeypot (no CAPTCHA); on success, swap the form for a warm sage-accented line
(*"got it — we'll let you know the moment we're ready. nothing's lost."*); on
error, a gentle retry message (never a harsh red error). Use a real `<label>` and
an `aria-live` region for the confirmation.

**SEO/meta/assets:** in-voice `<title>` + meta description; Open Graph + Twitter
tags → `og-image.png` (make a 1200×630 card: the mark/logo on a brand-colour
background); favicon set from `backpocket-mom-mark`; `robots.txt` (allow all);
`sitemap.xml` for the three pages; optional `_redirects` for clean URLs
(`/privacy` → `/privacy.html`).

### Step 3 — Copy & voice
Use the seed copy in `docs/WEBSITE_PLAN.md` §6 and reuse the spec's proven lines.
You may refine wording but must stay in the helper-mom voice and sentence case.
The reader is never failing or overloaded — the app takes things off their plate.

### Step 4 — Self-check before you finish (do all of these)
- Open every page; confirm no broken internal links and no console errors.
- Validate the HTML (no unclosed tags / duplicate ids); exactly one `<h1>` per
  page; logo has descriptive `alt` text.
- Confirm **no hard-coded hex** in markup — all colour via CSS variables.
- Confirm all copy is sentence case and in voice; privacy/terms carry the
  legal-review banner.
- Resize to ~320px, ~768px, and desktop — layout holds, signup usable on mobile.
- Tab through each page — visible focus, form reachable and submittable by
  keyboard; check AA contrast on text over terracotta/rose/espresso and fix any
  failures.
- Confirm `FORM_ENDPOINT` is a single, clearly-commented, easy-to-find constant.
- Verify the `public/` tree matches the structure above and the assets were
  actually copied (not referenced from `docs/`).

### Step 5 — Print deploy instructions
End your run by printing the Cloudflare Pages steps for me: connect the repo in
**Workers & Pages → Pages → Connect to Git**, set **Framework preset = None**,
**Build command = empty**, **Build output directory = `public`**, deploy, then add
a custom domain under the project's **Custom domains**. Note where to paste the Kit
form URL into `FORM_ENDPOINT`.

Then give me a short summary: what you built, anything you left as a placeholder
(Kit endpoint, legal copy, custom domain), and any small follow-ups.

Begin with Step 0 now.
