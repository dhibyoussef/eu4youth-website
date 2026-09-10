# Phase 0 decisions — EU4Youth web

Status: approved baseline, 16 August 2026.

This record freezes the product decisions needed before content/platform work
starts. Changing an approved decision requires a dated entry in the change log
and approval from the product and technical owner roles.

## Approved decisions

### Editorial platform: Strapi

- Strapi is the headless CMS for structured editorial content.
- The React/Vite application remains the public presentation layer.
- Public reads should use a same-origin content gateway such as `/api/content`;
  browser code must not contain Strapi administration or write tokens.
- Strapi roles must separate authoring, review, translation and publishing.
- Draft/publish, revision history, media rights metadata and scheduled backups
  are required before editorial migration.

The exact Strapi hosting plan, database and object-storage providers belong to
Phase 2 and depend on the unresolved production hosting choice.

### Public map: native governorate choropleth and catalogue

- Keep the current native `/carte` route as the public mapping product.
- The final mapping workbook is the approved source for public map fiches.
- Keep 706 complete source fiches with their stable source IDs.
- Similar public labels are review candidates, not proof of duplicate entities.
  Do not merge records without an owner-approved source-ID list.
- `Grand Tunis` covers Tunis, Ariana, Ben Arous and Manouba.
- National and unlocated fiches remain visible in the catalogue but must not
  inflate a specific governorate's intensity.
- Type/category filters remain disabled while the approved final workbook leaves
  those values empty. Point markers require approved coordinates.

### Factual source precedence

Use this order:

1. A dedicated project brief for facts about that project.
2. Official programme-level documents for programme-wide facts.
3. The final approved mapping workbook for map records.
4. Publication PDFs for their own title, date, scope and download metadata.
5. Glossary and homepage copy only when a higher-priority source is silent.
6. Design PDFs define presentation, not factual values.

Rules already applied:

- Jeun'ESS uses the dedicated September 2019–August 2024 period and 373 trained
  people; conflicting design/general dates stay recorded as a source gap.
- Fe3il.a uses 9.1 M€ and records the contribution of the Kingdom of the
  Netherlands; rounded 9 M€ references remain documented.
- The official programme headline remains 60 M€. It must not be silently
  replaced by adding project envelopes with different scopes/dates.
- SWAFY's 235 scholarships are described as planned until delivery evidence is
  approved.
- Missing Maghroum'IN and Go4Youth facts are not inferred.

### Ownership model: role placeholders

Repository documentation uses accountable role names, not personal contact
details. Named assignees and escalation channels must be maintained in the
private project workspace. See `docs/ownership-matrix.md`.

## Open decision

Production hosting is not selected. Vercel and Netlify configurations remain
maintained until the technical and operations owners approve one authoritative
platform. A hosting decision must include:

- production and staging projects;
- EU4Youth domain/DNS ownership;
- Strapi/database/object-storage topology;
- regional/data-residency constraints;
- backup/restore capabilities and retention;
- logs, monitoring, access recovery and costs;
- support model, RTO and RPO.

No provider-specific production secret or irreversible migration should be
created before this decision is signed off.

## Phase 0 exit

The architecture, map model, source policy and role model are approved.
Phase 0 is provisionally complete with one recorded blocker: production hosting.
It becomes fully complete when:

1. a hosting option is approved by product, technical and operations owners;
2. every role in the ownership matrix has a named assignee in the private
   workspace; and
3. those assignees acknowledge their approval responsibilities.

## Change log

- 2026-08-16: Strapi, native map, dedicated-brief source precedence and
  role-placeholder ownership approved. Hosting deferred.
