# EU4Youth web ownership matrix

Status: role baseline approved; named assignees pending in the private workspace.

Do not store personal phone numbers, credentials or private escalation details
in this repository.

## Roles

| Role | Accountable for | Required approvals |
|---|---|---|
| Product owner | Scope, priorities, source conflicts, acceptance | Phase scope, source decisions, release candidate, production launch |
| Editorial owner (French) | French copy, taxonomy, freshness, publishing workflow | French content and publication status |
| Arabic owner | Arabic translation and terminology | Arabic copy and RTL content review |
| English owner | English translation and terminology | English copy |
| Project content owners | Facts and assets for each of the six projects | Project facts, KPIs, dates, budgets and media rights |
| Map data steward | Mapping workbook, privacy, deduplication and coordinates | Public fields, source-ID merges, geographic coverage |
| Data controller / legal owner | Privacy, legal basis, retention, consent and rights | Privacy/cookies/legal notices, forms, analytics, stories and map publication |
| Accessibility owner | WCAG process and remediation acceptance | Accessibility declaration and formal audit closure |
| Technical owner | Architecture, Strapi integration, hosting, domain and security | Technical design, environment changes and release |
| Operations owner | Monitoring, incidents, backups, access recovery and providers | RTO/RPO, restore drill, rollback drill and operational launch |
| Release manager | Evidence collection and deployment coordination | Gate completeness and exact production commit |

## Decision responsibility

| Decision | Accountable role | Consulted roles | Current state |
|---|---|---|---|
| CMS choice | Product owner | Editorial, technical, operations | Approved: Strapi |
| Public map model | Product owner | Map steward, legal, technical | Approved: native choropleth/catalogue |
| Factual source precedence | Product owner | Editorial, project owners | Approved: dedicated briefs prevail |
| Production hosting | Technical owner | Product, operations, legal | Open |
| Map record merges | Map data steward | Project owners, legal | No merges approved |
| French publication | Editorial owner | Project owner, legal where needed | Per-item approval required |
| Arabic publication | Arabic owner | Editorial, accessibility | Not supplied |
| English publication | English owner | Editorial | Not supplied |
| Legal/CMP text | Legal owner | Product, technical | Not supplied |
| Production launch | Product owner | Technical, operations, legal, editorial, accessibility | Blocked by launch gates |

## Content ownership requirements

Every CMS entry must include:

- accountable content-owner role;
- source/provenance reference;
- original publication date and last-reviewed date;
- language and translation status;
- draft/reviewed/published status;
- public/private decision;
- media rights and consent status when people are identifiable;
- review-expiry date for opportunities, events and changing programme facts.

## Private assignment checklist

The product owner must assign names outside this repository for:

- all roles above;
- one primary and one backup technical/operations contact;
- each project content owner;
- emergency domain, hosting and Strapi access recovery;
- legal/privacy requests and accessibility feedback.

Phase 0 is not fully closed until the assignments are acknowledged.
