# Claude Code prompt — migrate the new BackPocket Mom brand images

Paste everything below the line into Claude Code running **in the BackPocketMom-Website repo**.

---

You are updating the BackPocket Mom **website** to Tracey's new brand art. The web‑ready,
pre‑processed assets are already generated and visually verified, and are **staged in this
repo but not yet published**:

- `docs/images/new6-18/web-export/` — logos, pocket mark, og‑image
- `docs/images/new6-18/favicon-export/` — favicon set (built from the "bp ♥ Mom" app‑icon tile)
- `docs/images/new6-18/` — the original source PNGs + `BackPocket Mom graphics.ai` (provenance)

Your job is to **copy these into `public/` and wire up the references** — not to redesign
anything or touch copy. Which art was chosen for which slot:

| Slot | Asset | Why |
|---|---|---|
| Favicon / app icon | the rounded "bp ♥ Mom" tile | only candidate still legible at 16px |
| Header logo | "BackPocket♥Mom" wordmark, tagline removed | matches the current tagline‑free header |
| Hero / footer / 404 mark | clean "bp + heart" pocket badge | reads on both cream and espresso |
| Social card (og‑image) | pocket badge + wordmark + tagline on cream, 1200×630 | rebuilt to match |

## Hard rules (from CLAUDE.md — do not violate)
- Plain static HTML/CSS/JS; no build step, no dependencies.
- **No pricing anywhere.** Do **not** edit marketing copy, titles, descriptions, or canonicals. Sentence case.
- Legal pages keep their "pending legal review" banner.
- Colours only via existing CSS variables; no hard‑coded hex in markup.
- Internal links stay **clean URLs**; do **not** add clean‑URL rules to `public/_redirects`.
- Each page keeps exactly one `<h1>`, a unique title/description, a clean‑URL canonical, valid JSON‑LD, and OG/Twitter tags with absolute URLs.

## Step 1 — Favicon files → `public/` root (overwrite where present)
Copy from `docs/images/new6-18/favicon-export/` into `public/`:
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` *(replace existing)*
- `favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png`, `web-app-manifest-192x192.png`, `web-app-manifest-512x512.png` *(new)*

## Step 2 — Logo + mark → `public/assets/img/` (overwrite same‑named files)
Copy from `docs/images/new6-18/web-export/`:
- `backpocket-mom-logo-no-tagline.svg`, `…-no-tagline.png`, `…-no-tagline-on-cream.png`
- `backpocket-mom-logo.svg`, `…logo.png`, `…logo-on-cream.png`
- `backpocket-mom-mark.svg`, `…mark.png`

Filenames match what the HTML already references, so most `<img src>` values don't change.

## Step 3 — Social image
Copy `docs/images/new6-18/web-export/og-image.png` → `public/og-image.png` (overwrite). It's
1200×630, so the existing `og:image:width`/`height` stay correct — **no HTML change**.

## Step 4 — Fix header logo sizing (IMPORTANT)
The new header wordmark is a single line, aspect ≈ **6.3 : 1** (the old one was ~3.4 : 1). The
header sizes the logo by CSS **height** with `width:auto`, so at the current 56/72px it renders
~350–450px wide and overflows on mobile.

In `public/assets/css/styles.css`:
- `.site-header__logo img` → change `height: 56px;` to **`height: 34px;`**
- `@media (min-width: 640px) { .site-header__logo img { height: 72px; } }` → change to **`height: 42px;`**

In `index.html`, `privacy.html`, `terms.html` update the header logo `<img>` intrinsic hints:
- `width="220" height="64"` → **`width="226" height="36"`** (keeps `alt="BackPocket Mom"`).

Then verify the wordmark fits inside a 320px‑wide header and looks balanced; fine‑tune the
heights ±4px to taste.

## Step 5 — Favicon `<link>` tags + manifest (recommended)
The existing `favicon.svg` / `favicon.ico` / `apple-touch-icon` links already work with the new
files. For completeness, in the `<head>` of `index.html`, `privacy.html`, `terms.html`,
`404.html`, add right after the existing icon links:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="manifest" href="/site.webmanifest" />
```

Create `public/site.webmanifest`:

```json
{
  "name": "BackPocket Mom",
  "short_name": "BackPocket Mom",
  "icons": [
    { "src": "/web-app-manifest-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/web-app-manifest-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#2D2320",
  "background_color": "#F5ECD7",
  "display": "standalone"
}
```

(Colours are the espresso + cream brand tokens. No pricing, no over‑promised claims.)

## Step 6 — Leave the rest alone
- The mark is square (1:1), so the hero (132), footer (48), and 404 (96) usages need **no** dimension changes.
- The JSON‑LD `Organization.logo` still points at `/assets/img/backpocket-mom-logo.png` — file is replaced, **no change**.
- Do not alter copy, JSON‑LD, OG text, or canonicals beyond Steps 4–5.

## Step 7 — Verify, then ship (definition of done)
1. Serve locally: `cd public && python3 -m http.server` and open `/`, `/privacy`, `/terms`, and a 404.
2. Check: header logo balanced and un‑clipped at ~320px **and** desktop; hero/footer/404 marks render; the new "bp" favicon shows in the tab; `og-image.png` resolves.
3. No console errors; every image path resolves (devtools → Network).
4. Confirm: no hard‑coded hex added to markup; no clean‑URL rules added to `_redirects`; internal links still clean URLs; legal banners intact.
5. Commit + push (the Worker auto‑redeploys from `main`):
   ```
   git add -A
   git commit -m "Swap in new BackPocket Mom brand: wordmark, pocket mark, bp app-icon favicon, og-image"
   git push
   ```

Optional: the `docs/images/new6-18/` staging folders are never published (only `public/`
deploys), so you may leave them as provenance or delete `favicon-export/` and `web-export/`
after confirming the copies.
