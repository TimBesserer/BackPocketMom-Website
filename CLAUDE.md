# CLAUDE.md — BackPocket Mom website

Guidance for Claude Code (and humans) working in **this repo only** — the
BackPocket Mom **pre-launch marketing website**. Read this before editing.

> This repo is the website, not the app. The BackPocket Mom mobile app (Flutter +
> Supabase) lives in a **separate** repo with its own `CLAUDE.md`. Nothing here
> builds or touches the app. Some files under `docs/` (orchestration.md, PLAN.md,
> agents/, claude-code-build-prompt.md, BUILD_LOG.md, OPEN_QUESTIONS.md) are
> artifacts from the app build and are **not** relevant to website work — ignore
> them. The website-relevant docs are `docs/spec.md` (product truth),
> `docs/WEBSITE_PLAN.md`, `docs/website-build-prompt.md`, and
> `docs/website-seo-prompt.md`.

## What this site is for

A small, calm, static site with two jobs: **explain what BackPocket Mom is** and
**collect a launch-notification email list**. It is pre-launch. There is no app to
link to yet — the call to action is always "leave your email and we'll tell you the
day it's ready."

## Voice & copy rules (apply to every user-facing string)

The brand is shared with the app; the source of truth is `docs/spec.md` §2.

- **The "mom" is the app, not the visitor.** Helper voice, never boss. Never imply
  the reader is failing or overloaded — offer to take things off their plate.
- **Sentence case always.** Never all-caps, never Title Case headlines.
- Warm, calm, reassuring, gently witty. Never clinical or corporate.
- Reuse the spec's proven lines (the tagline "the calm, wise mom in your back
  pocket," the three promises, the offline-confirmation voice) rather than
  inventing a new tone.

## Hard content rules (do not violate)

- **No pricing. Anywhere.** No dollar amounts, plan/tier names, or numeric limits
  (children, app connections, storage), in copy or structured data. Pricing is not
  decided until run costs are known. Don't re-add the old "free vs premium" teaser.
- **Pre-launch claim safety.** The app isn't released. Features that aren't
  guaranteed at launch read as intent ("designed to," "planned"), not present-tense
  fact. **No launch date.** State the privacy *promise* ("we never sell or share
  your family's data") and design intent ("built to keep your records private and
  encrypted"), but never assert COPPA/GDPR/PIPEDA compliance as already achieved —
  that's pending legal review. The privacy and terms pages are **drafts** and must
  keep their "pending legal review" banner.
- **No fabricated social proof** — no fake reviews, testimonials, user counts,
  ratings, or `aggregateRating`.
- **Product facts come from `docs/spec.md`.** Don't invent features.

## Tech & conventions

- **Plain static HTML + CSS + JS. No framework, no build step, no Node tooling, no
  dependencies.** This is deliberate — keep it that way.
- Deployable files live in **`public/`** (the deploy output directory). `docs/`, the
  `.docx`, and this file are never published.
- Pages: `index.html` (landing), `privacy.html`, `terms.html`, `404.html`.
- **Styles:** `public/assets/css/styles.css`. **Always use the existing CSS
  variables; never hard-code a hex or a one-off colour in markup.** The palette
  tokens (from spec §2):

  | Token | Hex | Use |
  |---|---|---|
  | `--espresso` / `--espresso-light` | `#2D2320` / `#5C3D2E` | Headers, primary buttons, brand anchor |
  | `--terracotta` | `#E8A87C` | Accent, warmth, hovers |
  | `--cream` / `--cream-deep` | `#F5ECD7` / soft | Backgrounds, text on dark |
  | `--sage` | `#7BAF83` | Success / signup confirmation |
  | `--rose` | `#D4537E` | The "Mom" wordmark, memory/heart accents |
  | `--amber` | `#BA7517` | Sparingly — "needs attention" |
  | `--ink` / `--ink-soft` | — | Body text / muted text |
  | `--card-surface`, `--line` | — | Card backgrounds, hairlines |

  Type tokens `--serif` (Playfair Display) and `--sans` (DM Sans); layout tokens
  `--max-width`, `--gutter`, `--radius*`, `--shadow*`. Reuse them.
- **Fonts:** Playfair Display (serif headlines/emotional lines) + DM Sans (body/UI)
  via the Google Fonts `<link>` with `font-display: swap` and `preconnect`.
- **JS:** `public/assets/js/main.js` — minimal vanilla JS, `defer`ed. No frameworks,
  no bundler. Keep it tiny.
- **Assets:** `public/assets/img/` (logos, mark, favicon, `og-image.png`). Prefer
  the SVG logo/mark. Give images explicit `width`/`height` to avoid layout shift.

## Email signup

- A **native, on-brand form** submits to **Kit (formerly ConvertKit)** via a single
  configurable endpoint, `FORM_ENDPOINT`, in `main.js`. It's already wired to a real
  Kit form. To swap providers (Beehiiv / Buttondown / Formspree) change only that
  one URL.
- **The email input must be `name="email_address"`** — Kit silently ignores any
  other field name. Keep the hidden honeypot field; no CAPTCHA (stay calm).
- Success and error states stay in voice (warm confirmation, gentle retry — never a
  harsh red error).

## Analytics

Cloudflare Web Analytics (cookieless, no consent banner needed) via a beacon
`<script>` in the footer of **every** page. Same token on all pages, one beacon per
page. It's a public beacon token, fine to commit.

## SEO & AI-indexing conventions

(Full task spec in `docs/website-seo-prompt.md`.)

- Each page: exactly one `<h1>`, a **unique** `<title>` (~50–60 chars) and meta
  description (~150–160), a **clean-URL canonical** on `https://backpocketmom.com`
  (e.g. `/privacy`, not `/privacy.html`), and Open Graph + Twitter tags with
  **absolute** URLs.
- Valid JSON-LD where it applies (Organization, WebSite, SoftwareApplication with
  **no price**, FAQPage). Any FAQ section and its FAQPage schema must match.
- `robots.txt` allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended,
  etc.) and points to `sitemap.xml`; `sitemap.xml` uses clean URLs + a current
  `<lastmod>`. Keep `public/llms.txt` accurate and price-free if present.
- Keep all meaningful content as real HTML text (not baked into images).

## Hosting & routing (important gotcha)

- Served by **Cloudflare Workers static assets**, auto-deployed from the GitHub repo:
  production branch `main`, **build output directory `public`**, no build command
  (`exit 0`). Every push to `main` redeploys. Custom domain `backpocketmom.com` is
  attached on the Worker (**Settings → Domains & Routes**), not via Pages.
- **Clean URLs are native to Workers:** `/privacy` serves `privacy.html`, and
  `/privacy.html` auto-redirects to `/privacy`. **Link internally with clean URLs**
  (`/privacy`, `/terms`).
- **Never add Cloudflare Pages-style clean-URL rules to `public/_redirects`** (e.g.
  `/privacy → /privacy.html`). They fight the Worker's native behaviour and cause an
  **infinite redirect loop** — this already broke the privacy/terms pages once. The
  file is intentionally rule-free; leave it that way.

## Definition of done for a website change

- Copy is sentence case and in the helper-mom voice; no pricing; no over-promised or
  dated claims; spec-grounded. Legal pages keep their draft/legal-review banner.
- Colours come only from CSS variables; no hard-coded hex in markup.
- Internal links use clean URLs; no clean-URL rules added to `_redirects`.
- Each page: one `<h1>`, unique title + description, clean-URL canonical, valid
  JSON-LD; OG/Twitter use absolute URLs.
- Responsive ~320px → desktop, keyboard accessible, AA contrast, no console errors,
  all internal links resolve.
- Verify by opening the page locally (or a simple static server), then
  `git add -A && git commit && git push` — the Worker redeploys automatically.
