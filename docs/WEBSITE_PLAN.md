# BackPocket Mom — Pre-launch website plan

> Plan for a small, warm, pre-launch marketing site whose only jobs are to
> **explain what BackPocket Mom is** and **collect a launch-notification email
> list**. Companion to this plan: **`docs/website-build-prompt.md`** (the
> paste-ready prompt that builds the site). Brand and product truth come from
> **`docs/spec.md`** and the repo `CLAUDE.md` voice rules.

## 1. Goal

One calm landing page that makes a busy parent feel "oh — this is the thing I've
been wishing for," and invites them to leave an email so we can tell them the day
the app is live (and, optionally, invite them to the beta). Plus the two pages a
real product needs the moment it asks for an email: a privacy page and a terms
page. Nothing more for now.

**Why keep an email list at all (it's a phone app):** the list *is* the point of a
pre-launch page. It's the audience we email on launch day with the App Store /
Play Store links, and the pool we can pull beta testers from. The email provider
(below) is the only place that list lives — we don't build or maintain our own
database for it.

### Success criteria

- A visitor understands, in under 30 seconds, what BackPocket Mom does and who
  it's for.
- Leaving an email takes one field and one tap, with a warm confirmation.
- The site loads fast on a phone, looks unmistakably "BackPocket Mom," and reads
  in the helper-mom voice everywhere.
- It deploys to Cloudflare Pages with zero build step and is ready for a custom
  domain.

## 2. Scope

**In scope (v1):**

- `index.html` — the landing page (hero + email capture, a short "what it is,"
  a few feature teasers, the privacy promise, a gentle pricing teaser, a closing
  signup, footer).
- `privacy.html` — plain-language privacy page (placeholder, clearly marked for
  legal review).
- `terms.html` — plain-language terms page (placeholder, clearly marked for legal
  review).
- Email capture wired to a real email service so we own a launch list.
- Brand system (colour, type, voice) pulled straight from the spec.
- SEO/social basics, favicon, accessible markup, Cloudflare Pages deploy config.

**Out of scope (deliberately, for now):**

- The app itself, accounts, or any real product functionality.
- A self-hosted backend or our own signups database (the email provider holds the
  list).
- Blog, multiple feature pages, screenshots of a finished app, A/B testing,
  cookie-consent tooling. Notes on these live in §11.

## 3. Locked decisions (with rationale)

| Decision | Choice | Why |
|---|---|---|
| **Build approach** | Plain, hand-written **HTML + CSS + JS**. No framework, no build step. | Fastest path to live, trivial to host, anyone can edit one file. A pre-launch one-pager doesn't need a toolchain. (If the marketing site grows later, it can move to Astro — noted in §11.) |
| **Hosting** | **Cloudflare Pages**, Git-connected auto-deploy. | Free, unlimited bandwidth, free SSL + custom domain, global CDN, preview deploys per branch. No build command needed for static files. |
| **Email capture** | A **native, fully-branded form** that submits to **Kit (formerly ConvertKit)**, kept provider-agnostic behind one config value. | Kit's free tier (up to ~10,000 subscribers) is the most generous, it's purpose-built for exactly this, and we can broadcast to the whole list on launch day. A native form (not their iframe embed) keeps the page on-brand and fast. Swapping to Beehiiv / Buttondown / Formspree later is a one-line endpoint change. |
| **Signups storage** | The email provider is the single source of truth. No D1 / database. | Keeps the site static and maintenance-free. Tim's question — "do we need to keep track?" — answered: yes, but the provider does the tracking for us. |
| **Brand** | Espresso / terracotta / cream / sage / rose palette; Playfair Display + DM Sans; sentence case; helper-mom voice. | Straight from spec §2 and `CLAUDE.md`. The site is the brand's first public impression — it must feel like the app. |

### Email provider — recommendation and alternatives

Recommended: **Kit (ConvertKit)** free plan. Create a "form" in Kit, then point our
native form's `action` at the Kit form's POST URL (or use its form UID). One value
to set; everything else is our own HTML/CSS.

Drop-in alternatives (same native form, just change the endpoint):

- **Beehiiv** — great editor and monetisation later; free up to ~2,500 subscribers.
- **Buttondown** — developer-friendly, simple API/POST, privacy-minded.
- **Formspree** — if Tim would rather *not* run a list yet: submissions land in his
  inbox + CSV. Downside: he'd later import them into a sender to actually email
  everyone at launch.

The build leaves a single clearly-commented config block (`FORM_ENDPOINT` /
provider id) so this can be set without touching layout.

## 4. Site map and page structure

Deployable site lives in a top-level **`public/`** directory (so `docs/`, the
spec, and the `.docx` are never published). Cloudflare's build output directory is
set to `public`.

```
public/
  index.html            # landing page
  privacy.html          # privacy (placeholder, legal-review banner)
  terms.html            # terms (placeholder, legal-review banner)
  404.html              # gentle, on-brand not-found
  assets/
    css/styles.css      # all styles (CSS variables for the palette)
    js/main.js          # form submit + tiny niceties (no framework)
    img/                # logos copied from docs/Images + favicon + og image
  favicon.svg / .ico
  apple-touch-icon.png
  og-image.png          # 1200×630 social card
  robots.txt
  sitemap.xml
  _redirects            # optional: clean URLs (/privacy -> /privacy.html)
```

### Landing page (`index.html`) — section flow

1. **Header** — logo (left), one quiet anchor link to "the promise," and a small
   "notify me" button that scrolls to the signup. Transparent over the hero,
   solid on scroll.
2. **Hero** — the mark + the tagline as the headline: *"the calm, wise mom in
   your back pocket."* One-sentence subhead explaining the app. The primary email
   signup form sits right here (above the fold). Warm cream/espresso palette.
3. **The promise** — the three onboarding promises restated as the emotional
   pitch: *"every loose end, finally gathered," "one schedule for everyone,"
   "like having your mom in your pocket."*
4. **What it helps with (teasers)** — 4–6 short cards, each a real capability from
   the spec in plain words: one calm family calendar (voice-to-calendar + connected
   apps), a document vault for the important stuff, the village (share just what a
   sitter or grandparent needs), gentle reminders that prepare you the night
   before, and the calm load meter. Card style, not a wall of text.
5. **The privacy promise** — a visually distinct band: *"your family's data is
   never sold or shared. ever."* The differentiator from spec §3.11, stated
   plainly, with a link to the privacy page.
6. **Pricing teaser** — a soft two-column "free vs premium" preview labelled
   "coming soon," not a buy button. Back Pocket Basic (free forever) vs Back
   Pocket Premium (~$8/mo). Sets expectations; reinforces "generous free tier."
7. **Closing signup** — repeat the email capture with a fresh line ("we'll only
   email you once: the day it's ready").
8. **Footer** — small logo, one-line tagline, links to privacy + terms, copyright,
   a warm "made with care" sign-off.

### Privacy & terms pages

Plain-language, on-brand, readable — *placeholders pending legal review*. Each
opens with a calm banner: a short note that this is a draft and the binding
version will be reviewed by a privacy lawyer before launch (spec §3.11 flags
COPPA / PIPEDA / GDPR for children's data). The privacy page should echo the
real promises from the spec: never sell or share data; funded only by
subscriptions; encryption; the user can see, export, and delete their data. These
are placeholders to make the signup honest, **not** final legal text.

## 5. Brand and design system

Pull every value from the theme; never hard-code a one-off colour in markup.

**Colour tokens (spec §2):**

| Token | Hex | Use |
|---|---|---|
| `--espresso` | `#2D2320` | Headers, primary buttons, body text on light, brand anchor |
| `--espresso-light` | `#5C3D2E` | Secondary dark, gradients |
| `--terracotta` | `#E8A87C` | Accent, highlights, warmth, button hovers |
| `--cream` | `#F5ECD7` | Page background, text on dark surfaces |
| `--sage` | `#7BAF83` | Success / "on track" / signup confirmation |
| `--rose` | `#D4537E` | The "Mom" wordmark, memory/heart accents |
| `--amber` | `#BA7517` | Sparingly — a "needs attention" note if ever needed |

**Type (spec §2):** Playfair Display (serif) for headlines and emotional lines;
DM Sans (sans) for body and UI. Load via Google Fonts (`google_fonts` is the app
equivalent; the web uses the standard Google Fonts `<link>`). **Sentence case
everywhere** — never all-caps, never Title Case headlines.

**Components:** rounded, soft-shadowed cards on cream; espresso primary buttons
with a terracotta hover; the email input as a single pill with an inline button;
generous spacing and line-height; a max content width (~1080px) centred. Echo the
logo's wordmark treatment where it fits ("BackPocket" espresso, "Mom" rose).

**Assets (copy from `docs/Images/` into `public/assets/img/`):**

- `backpocket-mom-logo.svg` — full logo with tagline (footer / hero on light).
- `backpocket-mom-logo-no-tagline.svg` — header lockup.
- `backpocket-mom-logo-on-cream.png` / `…-no-tagline-on-cream.png` — for cream
  bands where the SVG needs the cream-matched version.
- `backpocket-mom-mark.svg` / `.png` — favicon, apple-touch-icon, and the base for
  the 1200×630 `og-image.png`.

## 6. Voice and copy rules

From `CLAUDE.md` and spec §2 — these apply to every visible word:

- The **"mom" is the app, not the visitor.** Helper voice, never boss. Never imply
  the reader is failing or overloaded; offer to take things off their plate.
- **Sentence case always.** Warm, calm, reassuring, gently witty. Never clinical
  or corporate.
- Reassure → guide → a little wisdom. Don't overwhelm.
- Reuse the spec's proven lines (tagline, the three promises, the offline
  confirmation voice) rather than inventing a new tone.

Seed copy (the build may refine, staying in voice):

- Hero headline: *the calm, wise mom in your back pocket*
- Hero subhead: *BackPocket Mom gathers the scattered logistics of family life —
  schedules, reminders, documents, and memories — into one calm, trustworthy
  place.*
- Signup label / button: *be first to know when we launch* / *notify me*
- Success state: *got it — we'll let you know the moment we're ready. nothing's
  lost.*
- Privacy band: *your family's data is never sold or shared. ever.*

## 7. Signup form behaviour

- Single email field + button; HTML5 email validation; required.
- A hidden honeypot field to deflect bots (no CAPTCHA — keep it calm).
- Submit via `fetch` to the provider endpoint in `main.js`; on success swap the
  form for the warm confirmation line (sage accent); on error, a gentle retry
  message — never a red scolding error.
- Accessible: real `<label>`, `aria-live` region for the confirmation, focus
  management, works without fancy JS (graceful native POST fallback).
- The provider endpoint lives in one commented config constant.

## 8. SEO, social, and meta

- `<title>` and meta description in voice, e.g. *BackPocket Mom — the calm, wise
  mom in your back pocket.*
- Open Graph + Twitter card tags pointing at `og-image.png` (1200×630, logo on a
  brand background) so shared links look intentional.
- `favicon.svg` + `.ico` + `apple-touch-icon.png` from the mark.
- `robots.txt` (allow all) and a `sitemap.xml` listing the three pages.
- Semantic landmarks (`header`/`main`/`footer`), one `<h1>`, descriptive `alt`
  text on the logo.

## 9. Accessibility and performance

- Colour combinations must meet WCAG AA contrast (espresso on cream passes; check
  terracotta/rose on their backgrounds and adjust text colour if needed).
- Keyboard-navigable; visible focus styles; respects `prefers-reduced-motion`.
- No framework, minimal JS, system-font fallback while Google Fonts load
  (`font-display: swap`), SVG logos, compressed images, lazy-load anything
  below the fold. Target Lighthouse 95+ on mobile for performance and
  accessibility.

## 10. Cloudflare Pages deployment

Plain static files, so there is **no build step**.

1. Push the repo to GitHub (it already lives there).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**,
   select this repo.
3. Build settings: **Framework preset = None**, **Build command = (empty)**,
   **Build output directory = `public`**.
4. Deploy. Every push to `main` re-deploys; other branches get preview URLs.
5. **Custom domain:** Pages project → **Custom domains → Set up a domain** →
   enter the domain. Cloudflare handles DNS, SSL, and HTTPS automatically. Free
   tier includes unlimited bandwidth and free SSL.

Alternative (no Git): `npx wrangler pages deploy public`, or drag-and-drop the
`public/` folder in the dashboard.

## 11. Out of scope now — easy next steps later

- Privacy-friendly analytics (Cloudflare Web Analytics — one snippet, no cookies).
- Real, lawyer-reviewed privacy policy and terms before launch.
- App screenshots / a short demo once the app UI exists.
- A small "/beta" page if recruiting testers.
- Migrate to Astro if the marketing site grows beyond a few pages.

## 12. Definition of done

- `public/` contains `index.html`, `privacy.html`, `terms.html`, `404.html`,
  styles, JS, copied assets, favicon set, `og-image.png`, `robots.txt`,
  `sitemap.xml`.
- Every colour comes from a CSS variable; no hard-coded hex in markup.
- All copy is sentence case and in the helper-mom voice; privacy/terms carry the
  legal-review banner.
- The signup form validates, submits to the configured provider, and shows the
  warm confirmation; the provider config is a single clearly-commented value.
- Responsive from ~320px to desktop; keyboard accessible; AA contrast.
- Deploys to Cloudflare Pages with output dir `public` and no build command;
  ready for a custom domain.
- All internal links resolve; no console errors; logo `alt` text present.
