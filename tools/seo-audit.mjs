import { chromium } from 'playwright'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3010'
const productionOrigin = 'https://eu4youth.org'
const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
const failures = []

const robotsResponse = await context.request.get(`${baseUrl}/robots.txt`)
const robots = await robotsResponse.text()
if (!robotsResponse.ok()) failures.push(`robots.txt returned ${robotsResponse.status()}`)
if (!robots.includes(`Sitemap: ${productionOrigin}/sitemap.xml`)) {
  failures.push('robots.txt does not advertise the production sitemap')
}

const sitemapResponse = await context.request.get(`${baseUrl}/sitemap.xml`)
const sitemap = await sitemapResponse.text()
if (!sitemapResponse.ok()) failures.push(`sitemap.xml returned ${sitemapResponse.status()}`)
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
if (!urls.length) failures.push('sitemap.xml contains no URLs')

for (const url of urls) {
  const pathname = new URL(url).pathname
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'networkidle' })
  const metadata = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    h1: document.querySelectorAll('main h1').length,
    structuredData: [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((script) => script.textContent ?? ''),
  }))
  if (!metadata.title) failures.push(`${pathname}: missing title`)
  if (!metadata.description) failures.push(`${pathname}: missing description`)
  if (metadata.canonical !== `${productionOrigin}${pathname}`) {
    failures.push(`${pathname}: canonical is ${metadata.canonical}`)
  }
  if (metadata.robots !== 'index, follow') {
    failures.push(`${pathname}: sitemap route is not indexable`)
  }
  if (metadata.h1 !== 1) failures.push(`${pathname}: expected one h1, found ${metadata.h1}`)

  const expectedType = pathname.startsWith('/actualites/')
    ? 'Article'
    : pathname.startsWith('/agenda/')
      ? 'Event'
      : pathname.startsWith('/publications/')
        ? 'Article'
        : null
  if (expectedType) {
    const types = []
    for (const [index, source] of metadata.structuredData.entries()) {
      try {
        const parsed = JSON.parse(source)
        if (parsed?.['@type']) types.push(parsed['@type'])
      } catch {
        failures.push(`${pathname}: JSON-LD block ${index + 1} is invalid`)
      }
    }
    if (!types.includes(expectedType)) {
      failures.push(`${pathname}: missing ${expectedType} structured data`)
    }
  }
}

for (const pathname of [
  '/recherche?q=jeunesse',
  '/stories',
  '/confidentialite',
  '/mentions-legales',
  '/accessibilite',
  '/cookies',
]) {
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'networkidle' })
  const robotsMeta = await page
    .locator('meta[name="robots"]')
    .getAttribute('content')
  if (robotsMeta !== 'noindex, nofollow') {
    failures.push(`${pathname}: expected noindex, nofollow`)
  }
}

await page.goto(baseUrl, { waitUntil: 'networkidle' })
const structuredData = await page
  .locator('script[type="application/ld+json"]')
  .allTextContents()
for (const [index, source] of structuredData.entries()) {
  try {
    JSON.parse(source)
  } catch {
    failures.push(`JSON-LD block ${index + 1} is invalid JSON`)
  }
}
if (!structuredData.length) failures.push('No JSON-LD block found')

await browser.close()

console.log(
  JSON.stringify(
    {
      sitemapUrls: urls.length,
      noindexRoutes: 6,
      structuredDataBlocks: structuredData.length,
      failures,
    },
    null,
    2,
  ),
)
if (failures.length) process.exitCode = 1
