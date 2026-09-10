# EU4Youth web launch runbook

This runbook separates verified frontend work from decisions and services that
must be supplied by FI2T/EU4Youth owners. A launch is not approved until every
gate below has a named owner and recorded sign-off.

## Required owners

- Product owner: scope, source conflicts and final acceptance
- Editorial owner: French content, publication workflow and freshness
- Arabic and English owners: translations and Arabic RTL review
- Data controller / legal owner: privacy, cookies, retention and consent
- Technical owner: hosting, domain, integrations, security and rollback
- Operations owner: monitoring, incidents, backups and service providers

Record names and escalation details in the private project workspace. Do not put
personal phone numbers or credentials in this repository.

The role baseline and assignment requirements are defined in
`docs/ownership-matrix.md`.

## Gate 0 — decisions and ownership

Approved:

- Strapi is the headless editorial CMS.
- The public map remains the native governorate choropleth and catalogue.
- Dedicated project briefs prevail for project facts; official programme
  documents prevail for programme-wide facts.
- Repository documentation uses role placeholders; named assignees belong in
  the private project workspace.

Open:

- Select the authoritative production hosting platform. Vercel and Netlify
  configurations remain provider-neutral candidates until approval.
- Assign and acknowledge every required owner role privately.

The full rationale, constraints and change-control record are in
`docs/phase-0-decisions.md`.

Exit criterion: hosting is approved and every role has a named, acknowledged
assignee in the private workspace.

## Gate 1 — content and legal approval

- Resolve the documented budget, date and project-source conflicts.
- Supply the missing Maghroum'IN facts, stories/consent records, future events,
  media links, press kit, project KPIs and Fe3il.a publication file.
- Approve the privacy policy, legal notice, accessibility declaration and
  cookie policy.
- Approve French source copy before translation.
- Supply and approve Arabic and English translations.

Exit criterion: every public page has an accountable content owner, provenance,
review date and publishability decision.

## Gate 2 — platform integrations

- Provision Strapi; configure roles, revisions, taxonomies, publishing workflow
  and backups.
- Implement same-origin `VITE_CONTACT_ENDPOINT` and
  `VITE_NEWSLETTER_ENDPOINT` routes. They must return JSON `{ "ok": true }`
  only after accepting the request.
- Add server-side schema validation, origin/CSRF controls, rate limiting, spam
  screening, email/CRM delivery, retention and deletion handling.
- Select consent-aware analytics and configure the owner account.
- Maintain the approved native map; assign its data steward, preserve source IDs
  and supply approved coordinates/API/GeoJSON before enabling point markers.
- Supply approved YouTube, social, gallery and rights metadata.

Exit criterion: staging integrations pass with test accounts; no production
secret is exposed through `VITE_*`, source files, logs or browser responses.

## Gate 3 — localization and compliance verification

- Implement `/fr`, `/ar` and `/en` routing, locale persistence and `hreflang`.
- Complete full Arabic RTL visual review, including maps, rails, forms and
  mixed-direction numbers.
- Run a formal WCAG 2.1 AA audit with keyboard, screen-reader, zoom and
  reduced-motion testing.
- Verify the consent manager blocks non-essential analytics until consent.
- Complete a data-protection review for contact, newsletter, analytics, map and
  story/media processing.

Exit criterion: language owners, accessibility reviewer and legal owner sign
off the staging release.

## Gate 4 — release candidate

1. Create a release pull request.
2. Require the `Frontend quality` workflow to pass.
3. Deploy an immutable staging preview from the approved commit.
4. Run:

   ```sh
   DEPLOYMENT_URL=https://staging.example.org npm run audit:deployment
   ```

5. Test current iOS Safari and Android Chrome on physical devices.
6. Verify forms with controlled test addresses, then delete test records.
7. Verify CMS publishing, rollback and backup restoration.
8. Record product, editorial, legal, accessibility and technical sign-off.

Exit criterion: no open launch-blocking defect and all deployment smoke checks
pass against the release candidate.

## Gate 5 — production launch

1. Lower DNS TTL in advance when domain migration requires it.
2. Back up the current production site and CMS.
3. Deploy the exact signed-off commit; do not rebuild from an unpinned branch.
4. Apply production environment variables in the hosting control plane.
5. Switch DNS/domain routing.
6. Run `npm run audit:deployment -- https://eu4youth.org`.
7. Submit the sitemap in Search Console.
8. Verify one contact and one newsletter transaction end to end.
9. Monitor errors, availability and delivery queues closely for the first day.

## Rollback

- Trigger rollback on broken routing, unavailable critical assets, failed forms,
  security-header regression, material content corruption or sustained elevated
  errors.
- Repoint the platform to the last verified immutable deployment.
- Restore CMS/database state only when the incident changed stored data.
- Re-run the deployment audit after rollback.
- Preserve logs and write an incident timeline without copying submitted
  personal data into tickets.

The technical owner must define and approve recovery-time and recovery-point
targets with the selected hosting/CMS providers before launch.

## Monitoring and maintenance

- Availability: monitor `/health.json`, homepage and one deep route.
- Transactional monitoring: use synthetic test accounts for contact/newsletter;
  never reuse a real subscriber.
- Security: alert on CSP/header regressions, dependency advisories and unusual
  form rejection/rate-limit patterns.
- Content: monthly stale-content and broken-link review; named owners approve
  changes through the CMS.
- Backups: provider-managed automated backups plus scheduled restoration tests.
- Accessibility: regression review for major templates and an annual formal
  reassessment.
- Operations: keep provider contacts, access recovery and incident escalation
  in a private owner-controlled system.

## Definition of 100% launch readiness

The audit may show 100% only when all six gates have evidence, all required
services are live, approved content exists in all three languages, legal and
accessibility sign-off is recorded, production smoke tests pass, and operations
owners have demonstrated backup, monitoring and rollback procedures.
