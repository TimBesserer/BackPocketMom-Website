<!--
=========================================================================
 HOW TO LAUNCH (read me first — this comment is for you, Tim, not the agent)
=========================================================================
This optimizes the EXISTING pre-launch site (in public/) for search engines and
for AI assistants (ChatGPT, Claude, Perplexity, Google AI). It does NOT redesign
the site or change the brand.

Two ground rules baked into the prompt:
  • NO pricing anywhere — remove the pricing/tier section and all dollar amounts
    and plan limits, until you know your running costs.
  • Pre-launch claim safety — nothing is over-promised; features that aren't built
    yet are framed as "designed to / planned," and there are no launch dates.

Run it from the BackPocketMom-Website repo root with Claude Code (attended is fine):
    claude
Paste EVERYTHING BELOW THE LINE. When it finishes, commit and push — the Worker
redeploys automatically. Then drop the live URL into Google's Rich Results Test
and check the Web Analytics dashboard for traffic.

Source of truth: docs/spec.md (product), docs/WEBSITE_PLAN.md (site plan),
CLAUDE.md (voice).
=========================================================================
-->

---

You are doing an **SEO and AI-indexing (GEO) pass** on the existing BackPocket Mom
pre-launch website in this repo (`BackPocketMom-Website`). The site is plain static
HTML in **`public/`**, served by **Cloudflare Workers static assets** (clean URLs
are native: `/privacy` serves `privacy.html`). The production origin is
**`https://backpocketmom.com`**. Do not redesign the site or change the brand — you
are improving discoverability and how accurately AI assistants describe the product.

Work in one focused session: read the inputs, make the changes, run the self-check.

### Step 0 — Read the inputs
1. **`docs/spec.md`** — the product. Pull the accurate definition, target users,
   value props, feature set, and the privacy stance from here. Do not invent
   features or claims that aren't in the spec.
2. **`docs/WEBSITE_PLAN.md`** — site scope, structure, brand tokens.
3. **`CLAUDE.md`** — voice rules. The "mom" is the app, not the user. Helper voice,
   never boss. **Sentence case everywhere.**
4. The current files in **`public/`** (`index.html`, `privacy.html`, `terms.html`,
   `404.html`, `robots.txt`, `sitemap.xml`, `assets/`).

### Step 1 — Hard constraints (do not violate)
- **No pricing. Anywhere.** Remove the entire pricing/tier section from
  `index.html` (the "free vs premium" teaser), every dollar amount, every plan name
  tied to limits, and every numeric tier limit (e.g. "4 children," "5 connections,"
  "1 GB"). Do not add a price to any structured data (`Offer`/`price`). Pricing is
  not decided yet.
- **Pre-launch claim safety.** This product is not released. Features that are
  planned but not guaranteed-at-launch must read as intent ("designed to," "will
  help you," "planned"), not as present-tense fact. **No launch date.** Be careful
  with security/compliance wording: you may state the brand promise ("we never sell
  or share your family's data") and design intent ("built to keep your records
  private and encrypted"), but do not assert specific certifications or compliance
  (COPPA/GDPR/PIPEDA) as already achieved — those are pending legal review.
- **No fabricated social proof.** No fake reviews, testimonials, user counts,
  `aggregateRating`, or award claims. Don't imply the app is already in use.
- **Keep all meaningful content as real HTML text** (not baked into images), since
  both search crawlers and AI crawlers read the text. The site is already
  server-rendered static HTML — keep it that way.
- Stay in the helper-mom voice and sentence case for every visible word.

### Step 2 — Content changes (grounded in the spec)
1. **Remove the pricing section** per Step 1, and remove any nav/footer link or
   anchor that pointed to it. If the section leaves an awkward gap, let the privacy
   promise flow into the closing signup.
2. **Add a one-sentence entity definition** high on the page (in or just under the
   hero) that an AI can lift verbatim, e.g. *"BackPocket Mom is a calm family-
   organizer app that gathers schedules, reminders, documents, and memories for busy
   parents, co-parents, grandparents, caregivers, and fur-parents into one
   trustworthy place."* Adjust wording to the voice; keep it factual and complete.
3. **Add a short FAQ section** near the bottom (before the closing signup), written
   in voice, each answer a self-contained **40–60 word** direct answer (best format
   for AI citation). Ground every answer in the spec. Cover roughly these, and **do
   not state any price**:
   - what is BackPocket Mom?
   - who is it for?
   - what can it help me with?
   - will it be on iPhone and Android?
   - how does it protect my family's privacy?
   - can co-parents in separate homes use it?
   - can a babysitter or grandparent see only what they need?
   - does it work for pets and fur-parents?
   - when does it launch? → in pre-launch; join the list and we'll email you the day
     it's ready (no date).
   - how much will it cost? → pricing isn't announced yet; join the list to be first
     to know (no numbers, no tiers — this question exists only so AI assistants
     don't invent a price).

### Step 3 — Technical SEO
- **Unique title + meta description per page** (home, privacy, terms): titles ~50–60
  chars with the primary theme + brand; descriptions ~150–160 chars, compelling, in
  voice. Home should target the core idea (a calm family organizer / shared family
  calendar & logistics for busy parents).
- **Canonicals → clean URLs** on the production origin: `https://backpocketmom.com/`,
  `/privacy`, `/terms` (drop the `.html` — Workers serves the clean URL). Update the
  internal links and `sitemap.xml` to the clean URLs to match.
- **Open Graph + Twitter**: absolute URLs on `https://backpocketmom.com`,
  `og:type=website`, `og:image` = the 1200×630 card with width/height tags,
  `twitter:card=summary_large_image`. Verify the image file exists in `public/`.
- **Semantic structure**: exactly one `<h1>` per page, logical `<h2>/<h3>` order,
  `header/nav/main/section/footer` landmarks, descriptive `alt` text, `lang="en"`.
- **Core Web Vitals**: `font-display: swap` + `preconnect` for Google Fonts (keep),
  explicit `width`/`height` on images to prevent layout shift, lazy-load below-the-
  fold imagery, keep JS minimal and `defer`ed. No render-blocking junk.
- **robots.txt + sitemap.xml**: ensure `robots.txt` references the sitemap, and the
  sitemap lists the clean URLs with a `<lastmod>` of today.

### Step 4 — Structured data (JSON-LD, in `<script type="application/ld+json">`)
Add valid, accurate JSON-LD. Keep it truthful and price-free.
- **Organization** (or `Brand`): name "BackPocket Mom", `url`, `logo` (absolute URL
  to the logo asset), `description`. Add `sameAs` ONLY if real social profiles exist
  — otherwise omit.
- **WebSite**: name + `url`.
- **SoftwareApplication** (or `MobileApplication`): name, `description`,
  `applicationCategory` (e.g. "LifestyleApplication"), `operatingSystem` "iOS,
  Android". **No `offers`/`price`.** No `aggregateRating`. You may note it's upcoming
  in the description rather than via a release date.
- **FAQPage**: mirror the FAQ section exactly (same questions/answers).
Validate that every block is well-formed JSON and reflects only what's on the page.

### Step 5 — AI / LLM indexing (GEO)
- **Allow AI crawlers in `robots.txt`** (the site wants AI visibility). Keep the
  general `User-agent: *` allow, keep the `Sitemap:` line, and explicitly welcome the
  search/answer bots, for example:
  ```
  User-agent: *
  Allow: /

  # AI assistants — allow so they can describe and cite BackPocket Mom accurately
  User-agent: GPTBot
  Allow: /
  User-agent: OAI-SearchBot
  Allow: /
  User-agent: ChatGPT-User
  Allow: /
  User-agent: ClaudeBot
  Allow: /
  User-agent: Claude-SearchBot
  Allow: /
  User-agent: PerplexityBot
  Allow: /
  User-agent: Perplexity-User
  Allow: /
  User-agent: Google-Extended
  Allow: /

  Sitemap: https://backpocketmom.com/sitemap.xml
  ```
- **Create `public/llms.txt`** (served at `/llms.txt`) — a clean Markdown briefing
  that helps AI systems summarize the product accurately. Follow the llms.txt
  convention: an `# H1` name, a one-line `>` blockquote summary, then short sections.
  Include: what it is, who it's for, the key things it helps with (from the spec),
  the privacy promise, current status (pre-launch — join the email list), and links
  to the site, privacy, and terms. **No pricing.** Keep it factual and in plain
  language (it doesn't need the marketing voice, but must be accurate).
- **Direct-answer blocks**: make sure each major section opens by answering its
  implied question in a tight, self-contained sentence or two before elaborating —
  this is what AI engines lift and cite.
- **Freshness**: set `sitemap.xml` `<lastmod>` to today; if you add any visible
  "last updated" note, keep it accurate.
- (Optional) Add Cloudflare Content Signals to the top of `robots.txt`
  (`# Content-Signal: search=yes, ai-input=yes`) to explicitly permit search
  indexing and real-time AI answers.

### Step 6 — Topic & keyword targeting (natural, no stuffing)
Weave these themes — drawn from the spec's target users — into titles, headings,
the entity sentence, the FAQ, and `llms.txt`, only where they read naturally:
family organizer app; shared family calendar; family logistics / scheduling; busy
parents; co-parenting in separate households; single parents; grandparents &
caregivers; the "village" (babysitters, dog-walkers) with limited access; family
document vault; pet care / fur-parents; offline-capable; privacy-first family app.
Do not keyword-stuff or repeat phrases unnaturally.

### Step 7 — Self-check before finishing
- `grep` the whole `public/` tree for prices and tiers — confirm **zero** matches:
  `\$`, "month", "premium", "8/mo", "1 GB", "25 GB", numeric child/connection limits.
  Remove any stragglers.
- Each page: exactly one `<h1>`, a unique `<title>` and meta description, a clean-URL
  canonical, and valid JSON-LD (well-formed JSON; mentally run it through Google's
  Rich Results Test / schema.org validator).
- `robots.txt` allows the AI crawlers and points to the sitemap; `sitemap.xml` uses
  clean URLs + today's `lastmod`; `llms.txt` exists, is accurate, and is price-free.
- OG/Twitter tags use absolute `https://backpocketmom.com` URLs and the image has
  width/height. All internal links use clean URLs and resolve. No console errors.
- Every claim is spec-grounded and pre-launch-safe (no firm dates, no over-promises,
  no fabricated proof, no compliance claims stated as achieved).
- Voice + sentence case intact throughout.

### Step 8 — Wrap up
Print a short summary: what you changed per file, the new title/description for each
page, the FAQ questions you added, and a reminder to `git add -A && git commit && git
push` (the Worker auto-redeploys). Note anything you intentionally left out for claim
safety, and suggest the post-deploy checks (Google Rich Results Test, and submitting
the sitemap in Google Search Console once the custom domain is live).

Begin with Step 0 now.
