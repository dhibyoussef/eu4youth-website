import { firefox, webkit } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3010'
const routes = [
  '/',
  '/programme/a-propos',
  '/projets/go4youth',
  '/carte',
  '/opportunites',
  '/actualites',
  '/publications',
  '/publications/go4youth-newsletter-11',
  '/agenda/go4youth-tre-decembre-2025',
  '/glossaire',
  '/contact',
]
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]
const engines = [
  ['firefox', firefox],
  ['webkit', webkit],
]
const results = []

for (const [engineName, engine] of engines) {
  let browser
  try {
    browser = await engine.launch()
  } catch (error) {
    results.push({
      engine: engineName,
      route: '*',
      viewport: '*',
      issues: [`Browser engine unavailable: ${error.message}`],
    })
    continue
  }

  const page = await browser.newPage()
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    for (const route of routes) {
      const runtimeErrors = []
      const onPageError = (error) => runtimeErrors.push(error.message)
      page.on('pageerror', onPageError)
      let navigationError = null
      try {
        await page.goto(`${baseUrl}${route}`, {
          waitUntil: 'networkidle',
          timeout: 30_000,
        })
      } catch (error) {
        navigationError = error.message
      }

      const metrics = navigationError
        ? null
        : await page.evaluate(() => ({
            overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
            h1Count: document.querySelectorAll('main h1').length,
            mainCount: document.querySelectorAll('main').length,
            brokenImages: [...document.images]
              .filter((image) => image.complete && image.naturalWidth === 0)
              .map((image) => image.currentSrc || image.src),
            unlabeledControls: [
              ...document.querySelectorAll('button, input, select, textarea'),
            ]
              .filter((control) => {
                const aria = control.getAttribute('aria-label')
                const labelledBy = control.getAttribute('aria-labelledby')
                const label = control.labels?.length
                const text = control.textContent?.trim()
                const title = control.getAttribute('title')
                return !aria && !labelledBy && !label && !text && !title
              })
              .map((control) => control.outerHTML.slice(0, 160)),
          }))

      const issues = []
      if (navigationError) issues.push(navigationError)
      if (metrics?.overflow) issues.push(`Horizontal overflow: ${metrics.overflow}px`)
      if (metrics && metrics.h1Count !== 1) issues.push(`Expected one h1; found ${metrics.h1Count}`)
      if (metrics && metrics.mainCount !== 1) issues.push(`Expected one main; found ${metrics.mainCount}`)
      if (metrics?.brokenImages.length) issues.push(`Broken images: ${metrics.brokenImages.join(', ')}`)
      if (metrics?.unlabeledControls.length) {
        issues.push(`Unlabelled controls: ${metrics.unlabeledControls.join(', ')}`)
      }
      issues.push(...runtimeErrors.map((error) => `Page error: ${error}`))
      results.push({
        engine: engineName,
        route,
        viewport: viewport.name,
        issues,
      })
      page.off('pageerror', onPageError)
    }
  }
  await browser.close()
}

const outputDir = resolve('tools/out/cross-browser-audit')
await mkdir(outputDir, { recursive: true })
await writeFile(resolve(outputDir, 'results.json'), JSON.stringify(results, null, 2), 'utf8')

const failures = results.filter((result) => result.issues.length)
console.log(
  JSON.stringify(
    {
      checks: results.length,
      passing: results.length - failures.length,
      failures,
    },
    null,
    2,
  ),
)
if (failures.length) process.exitCode = 1
