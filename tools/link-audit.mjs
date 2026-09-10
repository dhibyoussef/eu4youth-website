import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3010'
const routes = [
  '/',
  '/programme/a-propos',
  '/programme/objectifs',
  '/programme/financement',
  '/programme/gouvernance',
  '/projets',
  '/projets/jeuness',
  '/projets/go4youth',
  '/projets/swafy',
  '/projets/irada4youth',
  '/projets/maghroumin',
  '/projets/fe3ila',
  '/carte',
  '/opportunites',
  '/opportunites/irada-2e-appel-a-propositions-2026',
  '/actualites',
  '/actualites/go4youth-avancees-transformation-digitale-aneti-avril-2026',
  '/publications',
  '/publications/go4youth-newsletter-11',
  '/glossaire',
  '/recherche?q=jeunesse',
  '/contact',
  '/agenda',
  '/agenda/go4youth-tre-decembre-2025',
  '/partenaires',
  '/mecanismes-appui',
  '/stories',
  '/eu-en-tunisie',
  '/coin-media',
  '/confidentialite',
  '/mentions-legales',
  '/accessibilite',
  '/cookies',
  '/plan-du-site',
]

const routePatterns = [
  /^\/$/,
  /^\/programme\/(?:a-propos|objectifs|financement|gouvernance)$/,
  /^\/(?:objectifs|financement|gouvernance)$/,
  /^\/projets(?:\/[^/?#]+)?$/,
  /^\/carte$/,
  /^\/opportunites(?:\/[^/?#]+)?$/,
  /^\/actualites(?:\/[^/?#]+)?$/,
  /^\/(?:publications|agenda)(?:\/[^/?#]+)?$/,
  /^\/(?:glossaire|contact|partenaires|mecanismes-appui|stories)$/,
  /^\/(?:eu-en-tunisie|coin-media|recherche)$/,
  /^\/(?:confidentialite|mentions-legales|accessibilite|cookies)$/,
  /^\/plan-du-site$/,
]

const outputDir = resolve('tools/out/link-audit')
await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
const links = new Map()

for (const route of routes) {
  await page.goto(baseUrl + route, { waitUntil: 'networkidle' })
  const pageLinks = await page.locator('a[href]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      href: node.getAttribute('href'),
      text: node.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100) ?? '',
    })),
  )
  for (const link of pageLinks) {
    if (!link.href) continue
    const record = links.get(link.href) ?? { href: link.href, texts: [], foundOn: [] }
    if (link.text && !record.texts.includes(link.text)) record.texts.push(link.text)
    if (!record.foundOn.includes(route)) record.foundOn.push(route)
    links.set(link.href, record)
  }
}

const results = []
for (const link of links.values()) {
  const href = link.href
  if (/^(?:mailto:|tel:)/.test(href)) {
    results.push({ ...link, kind: 'contact', status: 'not-fetched' })
    continue
  }

  const url = new URL(href, baseUrl)
  if (url.origin !== new URL(baseUrl).origin) {
    results.push({ ...link, kind: 'external', status: 'not-fetched' })
    continue
  }

  if (/^\/(?:docs|img)\//.test(url.pathname)) {
    const response = await context.request.get(url.toString())
    results.push({
      ...link,
      kind: 'asset',
      status: response.status(),
      contentType: response.headers()['content-type'] ?? '',
    })
    continue
  }

  const matched = routePatterns.some((pattern) => pattern.test(url.pathname))
  results.push({
    ...link,
    kind: 'route',
    status: matched ? 'known-route' : 'unknown-route',
  })
}

await browser.close()
await writeFile(
  resolve(outputDir, 'results.json'),
  JSON.stringify(results, null, 2),
  'utf8',
)

const broken = results.filter(
  (item) =>
    (typeof item.status === 'number' && item.status >= 400) ||
    item.status === 'unknown-route',
)
const summary = {
  totalUniqueLinks: results.length,
  internalRoutes: results.filter((item) => item.kind === 'route').length,
  localAssets: results.filter((item) => item.kind === 'asset').length,
  external: results.filter((item) => item.kind === 'external').length,
  contact: results.filter((item) => item.kind === 'contact').length,
  broken,
}

console.log(JSON.stringify(summary, null, 2))
if (broken.length) process.exitCode = 1
