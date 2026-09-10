import { chromium } from 'playwright'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3010'
const browser = await chromium.launch()
const page = await browser.newPage()
const failures = []

await page.goto(`${baseUrl}/recherche?q=go4youth`, { waitUntil: 'networkidle' })
const go4youthHits = await page.locator('.search-page__results li').count()
if (go4youthHits < 1) failures.push('q=go4youth returned no results')
const go4youthTypes = await page.locator('.search-page__results li span').allTextContents()
if (!go4youthTypes.some((label) => label === 'Projet')) {
  failures.push('q=go4youth did not surface the Go4Youth project')
}

await page.goto(`${baseUrl}/recherche?q=irada`, { waitUntil: 'networkidle' })
const iradaHits = await page.locator('.search-page__results li').count()
if (iradaHits < 1) failures.push('q=irada returned no results')

await page.goto(`${baseUrl}/recherche?q=ANETI`, { waitUntil: 'networkidle' })
const anetiHits = await page.locator('.search-page__results li').count()
if (anetiHits < 1) failures.push('q=ANETI returned no results')

await page.goto(`${baseUrl}/recherche?q=go4youth&type=Projet`, {
  waitUntil: 'networkidle',
})
const filteredTypes = await page.locator('.search-page__results li span').allTextContents()
if (!filteredTypes.length) failures.push('type=Projet returned no results')
if (filteredTypes.some((label) => label !== 'Projet')) {
  failures.push('type=Projet leaked non-project results')
}

await page.goto(`${baseUrl}/recherche?q=zzzxnotfound`, { waitUntil: 'networkidle' })
const emptyCopy = await page.locator('.search-page__empty').textContent()
if (!emptyCopy?.includes('Aucun résultat')) {
  failures.push('nonsense query did not show the empty state')
}

await page.goto(`${baseUrl}/recherche?q=j`, { waitUntil: 'networkidle' })
const shortCopy = await page.locator('.search-page__empty').textContent()
if (!shortCopy?.includes('deux caractères')) {
  failures.push('single-character query did not show the guidance message')
}

const typeOptions = await page.locator('#site-search-type option').allTextContents()
for (const expected of [
  'Tous',
  'Page',
  'Projet',
  'Opportunité',
  'Publication',
  'Actualité',
  'Événement',
  'Glossaire',
  'Mécanisme',
]) {
  if (!typeOptions.includes(expected)) {
    failures.push(`missing search type option: ${expected}`)
  }
}

await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Rechercher sur le site' }).click()
await page.locator('#header-search-input').fill('irada')
await page.waitForFunction(
  () => document.querySelectorAll('#header-search-suggestions option').length > 0,
  null,
  { timeout: 5000 },
).catch(() => null)
const suggestionCount = await page.locator('#header-search-suggestions option').count()
if (suggestionCount < 1) failures.push('header search suggestions are empty for q=irada')

await page.goto(`${baseUrl}/recherche?q=jeunesse`, { waitUntil: 'networkidle' })
const robots = await page.locator('meta[name="robots"]').getAttribute('content')
if (robots !== 'noindex, nofollow') {
  failures.push('/recherche must remain noindex,nofollow')
}
const liveRegion = await page.locator('.search-page__results').getAttribute('aria-live')
if (liveRegion !== 'polite') failures.push('search results are missing aria-live=polite')

await browser.close()

console.log(
  JSON.stringify(
    {
      go4youthHits,
      iradaHits,
      anetiHits,
      filteredTypes: filteredTypes.length,
      suggestionCount,
      failures,
    },
    null,
    2,
  ),
)
if (failures.length) process.exitCode = 1
