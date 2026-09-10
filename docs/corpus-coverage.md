# EU4Youth source-corpus coverage

Status: verified against the supplied corpus and the current frontend on
16 August 2026.

This record distinguishes implemented, source-backed work from missing owner
content and unresolved source conflicts. It must not be used to infer facts that
are absent from the source material.

## Audited source groups

- Design library: 12 PDFs containing 39 desktop pages/states, including colour
  and button guidelines. No mobile comps were supplied.
- Core editorial sources: homepage, programme/about, contact, cross-route UX
  cadrage, mapping cadrage and cahier des charges.
- Project sources: all six dedicated project briefs.
- Publications: 13 Go4Youth/IRADA4YOUTH PDFs. Twelve approved files are served;
  the training module remains excluded because it is marked Draft.
- Mapping: the final public workbook and the raw compiled workbook.
- Glossary: all 110 real `DATA` entries in the supplied HTML. Its displayed
  “135 terms” total is stale.

## Source precedence

The approved precedence is:

1. dedicated project brief for project facts;
2. official programme document for programme-wide facts;
3. final mapping workbook for public map fiches;
4. publication PDF for its own title, date, scope and file metadata;
5. glossary and homepage only when higher-priority sources are silent;
6. design PDFs for presentation, never factual values.

Project detail pages now expose `dataGaps` as public provenance notes and include
their beneficiary audiences. Unsupported project claims were removed or
qualified.

## Publications

- Public catalogue: 13 records.
- Downloadable files: 12.
- Fe3il.a: one cover-only record; no file was supplied.
- Excluded: IRADA4YOUTH pilotage/training module, because the source repeatedly
  identifies it as a draft.
- Newsletters 1, 3 and 9 do not exist in the supplied corpus and must not be
  fabricated.
- The December 2025 GO4Youth agenda entry now matches Newsletter 10: three
  Placement Insertion sessions on 15 December for 42 BETIs.

## Mapping

The authoritative source is the workbook under `Mapping interactif/fichier
final/`. The public projection is:

- 711 numbered source rows;
- five empty-name stubs excluded;
- 706 public-safe fiches with stable source IDs;
- 589 distinct case-normalized public labels;
- 18 national or unlocated fiches that remain in the catalogue without colouring
  a governorate;
- no coordinates;
- Type, Catégorie, Description, Statut, beneficiary and gender fields empty.

The raw compiled workbook contains personal and grant data and is not a public
source. The public generator excludes contacts, phones, emails and amounts.

The approved product remains the native governorate choropleth plus synchronized
catalogue. Point markers or clustering require approved coordinates and an owner
change decision.

## Design fidelity

Home and À propos remain the closest dedicated-comp implementations. The latest
safe alignment work also:

- restored the Publications comp teal on the large hero surface;
- changed Publications to a denser four-column desktop catalogue;
- changed Actualités to three desktop columns with shorter cards;
- restored the 851-design-pixel project banner area;
- implemented the Contact success dialog shown in the comp;
- added visible fade/end-padding to mobile horizontal rails;
- completed the source-only homepage requirements that were absent from the
  supplied static comp: Portes d'entrée, clickable KPIs, filtered project cards,
  verified map counts, recent publications and partner/media gateways;
- persisted Actualités, Opportunités and Publications filters in shareable URLs
  with removable active tags and quick-filter counts;
- tightened the complete 110-entry glossary to the comp's denser two-column
  reading rhythm.

Carte is an application adaptation of the seven supplied states, not a literal
static plate. Mobile layouts are responsive interpretations because no mobile
designs were supplied.

## Verified frontend checks

The latest built artifact passes:

- TypeScript and Vite production build;
- 132/132 route-by-viewport Chromium checks;
- 30/30 header-menu and footer-collision checks;
- 44/44 Firefox/WebKit checks;
- 123 unique-link checks with no broken links;
- 70 sitemap route SEO checks plus six noindex routes;
- search corpus/suggestion checks;
- 3/3 public-form safety checks.

The evidence-based audit remains at 67% overall launch readiness, 75% page /
frontend readiness and 56% production-platform readiness. Chromium responsive
checks are 100%. These percentages do not award credit for owner content or
production services that have not been supplied.

## Owner-blocked content and services

Do not invent:

- Arabic and English translations or Arabic RTL sign-off;
- privacy, legal notice, accessibility declaration or cookie policy;
- stories, portraits, quotes, consent records or videos;
- YouTube IDs, gallery, press kit or official social URLs;
- contact addresses, institutional email/phone or office map;
- missing project KPIs, partner marks, application URLs or Fe3il.a PDF;
- production form/email backends, CMS content, analytics or CMP data.

## Unresolved source decisions

- Jeun'ESS: five named governorates and 2019–2024 in dedicated material versus
  seven governorates and later periods elsewhere.
- Jeun'ESS: 49 LIMITL'ESS clubs globally versus 43 explained in detailed results.
- Fe3il.a: rounded 9 M€ versus dedicated-brief 9.1 M€.
- Programme: 60 M€ headline versus approximately 57.46 M€ from project figures
  with different scopes and dates.
- GO4Youth: budget/TERI provenance and national-coverage wording.
- Maghroum'IN: FIAP versus FIIAPP, budget provenance and contractual territory.
- IRADA4YOUTH: 20–40 impact indicator versus under-35 participation requirement.
- Mapping: cadrage choropleth versus cahier marker/clustering requirement;
  Phase 0 currently approves the source-feasible choropleth.

The live audit artifact is maintained in Cursor as
`eu4youth-project-audit.canvas.tsx`.
