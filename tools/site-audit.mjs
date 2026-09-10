import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3010'
const outputDir = resolve('tools/out/site-audit')

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
]

const viewports = [
  { label: 'desktop', width: 1920, height: 1080 },
  { label: 'laptop', width: 1280, height: 900 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'mobile', width: 390, height: 844 },
]

mkdirSync(outputDir, { recursive: true })
const browser = await chromium.launch()
const results = []

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  })

  for (const route of routes) {
    const page = await context.newPage()
    const pageErrors = []
    const consoleErrors = []
    const failedResponses = []
    const failedRequests = []

    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedResponses.push(`${response.status()} ${response.url()}`)
      }
    })
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`)
    })

    let navigationError = null
    try {
      await page.goto(baseUrl + route, { waitUntil: 'networkidle', timeout: 20_000 })
      await page.evaluate(() => document.fonts.ready)
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error)
    }

    const audit = navigationError
      ? null
      : await page.evaluate((viewportWidth) => {
          const visible = (element) => {
            const style = getComputedStyle(element)
            const box = element.getBoundingClientRect()
            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              box.width > 0 &&
              box.height > 0
            )
          }

          const overflowers = [...document.querySelectorAll('body *')]
            .filter(visible)
            .filter((element) => {
              // Intentional horizontal chip/alphabet rails scroll their children
              // off-screen; do not report those as layout overflow defects.
              let node = element
              while (node && node !== document.body) {
                if (node.classList?.contains('scroll-rail')) return false
                const style = getComputedStyle(node)
                if (
                  (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
                  node.scrollWidth > node.clientWidth + 2
                ) {
                  return false
                }
                node = node.parentElement
              }
              return true
            })
            .map((element) => {
              const box = element.getBoundingClientRect()
              return {
                element,
                left: Math.max(0, -box.left),
                right: Math.max(0, box.right - viewportWidth),
              }
            })
            .filter((item) => item.left > 2 || item.right > 2)
            .sort((a, b) => Math.max(b.left, b.right) - Math.max(a.left, a.right))
            .slice(0, 8)
            .map(({ element, left, right }) => ({
              selector: `${element.tagName.toLowerCase()}${
                element.id ? `#${element.id}` : ''
              }${element.classList.length ? `.${[...element.classList].join('.')}` : ''}`.slice(
                0,
                120,
              ),
              left: Math.round(left),
              right: Math.round(right),
            }))

          const brokenImages = [...document.images]
            .filter((image) => image.complete && image.naturalWidth === 0)
            .map((image) => image.currentSrc || image.src)

          const unlabeledControls = [
            ...document.querySelectorAll('input:not([type="hidden"]), select, textarea'),
          ]
            .filter(visible)
            .filter((control) => {
              const labels = control.labels
              return !(
                control.getAttribute('aria-label') ||
                control.getAttribute('aria-labelledby') ||
                (labels && labels.length > 0)
              )
            })
            .map((control) => `${control.tagName.toLowerCase()}[name="${control.name}"]`)

          const emptyLinks = [...document.querySelectorAll('a')]
            .filter(visible)
            .filter((link) => {
              const href = link.getAttribute('href')
              return !href || href === '#'
            })
            .map((link) => link.textContent?.trim() || '(unlabelled)')

          const clippedText = [...document.querySelectorAll('h1, h2, h3, p, a, button, span')]
            .filter(visible)
            .filter((element) => !element.classList.contains('sr-only'))
            .filter((element) => {
              const style = getComputedStyle(element)
              return (
                ['hidden', 'clip'].includes(style.overflowX) &&
                element.scrollWidth > element.clientWidth + 2
              )
            })
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              className: element.className?.toString().slice(0, 80) ?? '',
              text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100) ?? '',
            }))
            .slice(0, 12)

          return {
            title: document.title,
            h1Count: document.querySelectorAll('main h1').length,
            mainCount: document.querySelectorAll('main').length,
            footerCount: document.querySelectorAll('footer').length,
            pageHeight: document.documentElement.scrollHeight,
            scrollWidth: document.documentElement.scrollWidth,
            horizontalOverflow: Math.max(
              0,
              document.documentElement.scrollWidth - window.innerWidth,
            ),
            overflowers,
            brokenImages,
            unlabeledControls,
            emptyLinks,
            clippedText,
          }
        }, viewport.width)

    const slug =
      route === '/'
        ? 'home'
        : route.slice(1).replaceAll('/', '--').replace(/[^a-zA-Z0-9À-ÿ_-]+/g, '-')
    if (!navigationError && (viewport.label === 'desktop' || viewport.label === 'mobile')) {
      await page.screenshot({
        path: resolve(outputDir, `${slug}-${viewport.label}.png`),
        fullPage: true,
      })
    }

    const result = {
      route,
      viewport: viewport.label,
      width: viewport.width,
      navigationError,
      pageErrors: [...new Set(pageErrors)],
      consoleErrors: [...new Set(consoleErrors)],
      failedResponses: [...new Set(failedResponses)],
      failedRequests: [...new Set(failedRequests)],
      ...audit,
    }
    results.push(result)

    const issueCount = [
      navigationError,
      ...result.pageErrors,
      ...result.consoleErrors,
      ...result.failedResponses,
      ...result.failedRequests,
      ...(audit?.brokenImages ?? []),
      ...(audit?.unlabeledControls ?? []),
      ...(audit?.emptyLinks ?? []),
      ...(audit?.clippedText ?? []),
    ].filter(Boolean).length

    console.log(
      `${viewport.label.padEnd(7)} ${route.padEnd(31)} ${
        navigationError ? 'NAVIGATION FAILED' : `${issueCount} issue(s)`
      }${audit?.horizontalOverflow ? ` · overflow ${audit.horizontalOverflow}px` : ''}`,
    )
    await page.close()
  }
  await context.close()
}

await browser.close()
writeFileSync(resolve(outputDir, 'results.json'), JSON.stringify(results, null, 2))
console.log(`\nDetailed report and screenshots: ${outputDir}`)
