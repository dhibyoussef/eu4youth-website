# EU4Youth Tunisie — public site (prototype)

Static React frontend for EU4Youth.org. **No backend dependency.** Content lives in
`src/data/`. The FI2T CMS is wired in a later phase.

```bash
npm install
npm run dev      # http://localhost:3010
npm run build    # tsc + vite build -> dist/
```

## Verification

Both audits run against a served build, so start `npm run preview -- --port 3010`
first.

```bash
npm run audit      # 33 surfaces x 4 viewports: overflow, broken art, labels, clipping
npm run audit:nav  # chrome at 6 widths: menu anchoring, bounds, footer collisions
npm run audit:links # internal routes and all locally served downloads/assets
npm run audit:seo  # sitemap routes, canonical/meta/robots policy and JSON-LD
npm run audit:search  # search corpus facets, suggestions and empty states
npm run audit:browsers # critical routes in Firefox and WebKit, desktop + mobile
npm run audit:forms # disabled-state safety, status messages and honeypot behavior
npm run audit:deployment -- https://staging.example.org # deployed headers, deep links, health and caches
```

Pull requests and pushes to `main`/`master` run the complete build and browser
audit matrix through the repository-level
`.github/workflows/eu4youth-quality.yml`. Production release, rollback,
ownership and monitoring gates are documented in `docs/launch-runbook.md`.

`npm run audit` writes screenshots and `results.json` to `tools/out/site-audit/`.
`audit:nav` exits non-zero when a dropdown leaves its tab or the viewport, or when
a footer link ends up under the social, language, disclaimer or logo blocks — both
are invisible to page audits, which only ever see the closed header and cannot
tell overlap from layout. `audit:links` inventories every unique anchor exposed by
the canonical routes and fetches local assets, including the downloadable PDFs.

For full handoff reviews, `python tools/source_inventory.py` writes a manifest and
extracts the supplied DOCX corpus to `tools/out/source-audit/`; then
`python tools/visual_audit_sheets.py` creates compact source-design, desktop-route
and mobile-route contact sheets from the audit screenshots.

## Deployment hardening

- `public/robots.txt` and `public/sitemap.xml` expose only publishable routes.
- Static Organization/WebSite JSON-LD and social metadata are present in `index.html`;
  route navigation updates titles, descriptions, canonical URLs and robots policy.
- Vercel and Netlify configurations include CSP, HSTS, anti-framing, permissions,
  referrer and MIME-sniffing headers plus immutable caching for hashed assets.
- Search, empty Stories and pending legal pages are intentionally `noindex`.

## Phase 0 architecture baseline

- Strapi is approved as the headless CMS; the existing React/Vite application
  remains the public frontend.
- The native governorate choropleth/catalogue remains the public map.
- Dedicated project briefs prevail for project facts; official programme
  documents prevail for programme-wide facts.
- Ownership is role-based in the repository, with named assignees maintained
  privately.
- Production hosting remains the only open architecture decision; both Vercel
  and Netlify hardening stay maintained until one is approved.

See `docs/phase-0-decisions.md`, `docs/ownership-matrix.md`,
`docs/locale-architecture.md`, `docs/corpus-coverage.md` and
`docs/launch-runbook.md`.

## Contact and newsletter endpoints

Copy `.env.example` to an environment-specific `.env.local` and set same-origin
POST routes for the two public forms. Each endpoint receives JSON, must apply its
own rate limiting, CSRF/origin validation, spam screening and retention rules,
and must confirm acceptance with:

```json
{ "ok": true }
```

The frontend sends no request when an endpoint is absent, times out requests
after 15 seconds, rejects HTML/fallback responses, includes a honeypot and never
logs submitted personal data. Keep external providers behind same-origin
serverless routes or reverse proxies so CSP and credentials remain controlled.

## Stack

| Package | Version |
|---|---|
| react / react-dom | ^19 |
| react-router-dom | ^7 |
| vite | ^8 |
| typescript | ~6 |

No CSS framework. Plain CSS with custom properties, co-located per component.

## Where things live

```
src/
  data/            static source-backed content + types
    types.ts       shared project/KPI types
    projects.ts    the six projects, including recorded `dataGaps`
    home.ts        homepage bands and deep-linked stream cards
    nav.ts         header navigation model
  styles/
    tokens.css     colors, type scale, button state matrix
    app.css        shell and shared layout behavior
  components/
    layout/        Header, Footer and social icon
    ProjectLogos   shared six-project logo band
    Disque         shared circular artwork
  pages/
    HomePage       10 sections from Accueil.pdf
    ProjetsPage    overview + composante filter
    ProjetPage     one template themed for all six projects
    StubPage       404 only
```

## Design tokens

Extracted from `UI Web Design/COLOR GUIDLINE.pdf` and `BUTTON GUIDLINE.pdf`.

Institutional blue `#074EA2`, navy `#081B2E`, orange `#F2A849`.
Per-project: Jeun'ESS `#E34171`, Fe3il.a `#21366B`, SWAFY `#705FA7`,
Maghroum'IN `#58AC48`, Go4Youth `#23B5E5`, Irada4Youth `#E96223`.

Fonts: Barlow (display/UI), Poppins (body), Changa (Arabic).

**Contrast deviation:** raw brand orange is ~2:1 on white and green ~2.8:1, both
failing WCAG AA for text. `--eu-orange-text` / `--*-text` variants are darkened
for type. Fills still use the exact brand values.

## Adding a project page

Push an entry into `PROJECTS` in `src/data/projects.ts` and add
`--p-<slug>` / `--p-<slug>-text` to `tokens.css`. The route, theming, hero
watermark, tabs, component modals and cross-links all follow automatically.

## Publication catalogue assets

Card covers live in `public/img/pub-covers/`: first pages rendered from the PDFs in
`public/docs/`, plus covers supplied only as artwork by the design library, converted
by `tools/pub_cover_assets.py`. Card layout metrics (gutters, band height, grid pitch,
A4 cover ratio) are measured off `Page Publications & Ressources.pdf` with
`tools/render_pub_design.py` and `tools/crop_pub_design.py`. Run
`tools/pub_file_sizes.py` after adding or re-compressing a document so the weight
shown on each card matches the file served.

## Source-corpus status

Every supplied design PDF, core editorial source, dedicated project brief,
publication PDF and mapping workbook has been audited. The current evidence,
source precedence, publication/map counts and unresolved owner decisions are
recorded in `docs/corpus-coverage.md`.

The latest production build passes 132/132 Chromium route/viewport checks,
30/30 navigation/footer checks, 44/44 Firefox/WebKit checks, 123 unique-link
checks, the 70-URL SEO audit, search audit and 3/3 form-safety checks.
The corresponding evidence-based readiness is 67% overall, 75% for the
page/frontend layer, 56% for the production platform, and 100% for Chromium
responsive checks.

## Route status

All 33 scored surfaces are built and render their own content; `StubPage` is now
only the 404. Routes without a design PDF (programme financement/gouvernance,
partenaires, mécanismes d'appui, EU en Tunisie, coin média) follow the shared
band and card language rather than an approved comp, and the legal routes plus
Youth Stories are deliberate pending states until copy is approved.

The homepage now includes the source-requested entry-point grid, clickable KPIs,
filtered six-project catalogue, verified map figures, recent publications and
partner/media gateways. Actualités, Opportunités and Publications preserve
filters in shareable URLs and expose removable active-filter tags and counts.

## Known content blockers

Recorded in the data models and audit canvas; unavailable files and services use
explicit pending states rather than fabricated content:

- Programme budget 60 M€ vs ~57,46 M€ of project budgets
- Jeun'ESS: five named governorates and 2019–2024 in dedicated material versus
  seven governorates and later periods in programme/design sources; 49 global
  LIMITL'ESS clubs versus 43 explained by detailed results
- Fe3il.a budget: dedicated brief 9,1 M€ used publicly; some programme/home sources still round to 9 M€
- Maghroum'IN: FIAP versus FIIAPP, budget provenance and contractual territory
- GO4Youth: budget/TERI provenance and national-coverage wording are absent from
  the dedicated brief
- IRADA4YOUTH: 20–40 impact indicator versus under-35 participation requirement
- Photography, project marks and partner strips are extracted from the supplied
  design PDFs; no separate press or portrait library exists yet
- Map data: 706 public-safe source fiches (589 distinct normalized labels) with
  no lat/lng, and empty
  nature/secteur columns — a governorate choropleth with those two filters
  disabled is the honest ceiling until the workbook is completed and cleaned.
  Duplicate-looking names keep distinct source IDs until owners approve entity
  deduplication; Grand Tunis records colour Tunis/Ariana/Ben Arous/Manouba and
  18 national/unlocated fiches stay catalogued without colouring a governorate.
- Fe3il.a « Capitalisation de l'expérience des forums des jeunes »: only the cover
  was supplied (design library `images/25.png`), so its card carries no date, no
  year and no download until the PDF arrives
