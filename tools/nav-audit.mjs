/**
 * Site chrome audit — header menus and footer collisions.
 *
 * site-audit.mjs only sees the closed header, so it cannot catch a dropdown that
 * opens away from the tab it belongs to or off the side of the viewport. This
 * opens every menu at each desktop breakpoint and at the collapsed breakpoints,
 * and reports any panel that is not anchored to its own tab plate, leaves the
 * viewport, or forces the document to scroll sideways.
 *
 * It then checks the footer, whose marks are placed at measured plate coordinates
 * while its link columns come from the sitemap: a column that grows past what the
 * comp drew silently pushes a link under the social or language row, which no
 * overflow or clipping check can see.
 */

import { chromium } from 'playwright'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3010'

const widths = [
  { label: 'ultrawide', width: 2560, height: 1200, desktop: true },
  { label: 'desktop', width: 1920, height: 1080, desktop: true },
  { label: 'laptop', width: 1440, height: 900, desktop: true },
  { label: 'small-laptop', width: 1100, height: 800, desktop: true },
  { label: 'tablet', width: 768, height: 1024, desktop: false },
  { label: 'mobile', width: 390, height: 844, desktop: false },
]

const browser = await chromium.launch()
const problems = []

for (const viewport of widths) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.goto(`${baseUrl}/publications`, { waitUntil: 'networkidle' })

  if (!viewport.desktop) {
    await page.click('.header__burger')
  }

  const tabs = await page.$$('.nav__link[aria-expanded]')
  for (const [index, tab] of tabs.entries()) {
    const label = (await tab.textContent())?.trim().replace(/\s+/g, ' ') ?? `tab ${index}`
    if (!viewport.desktop && !(await page.$('.header--menu-open'))) {
      await page.click('.header__burger')
    }
    await tab.click()
    await page.waitForSelector('.nav__panel', { state: 'visible' })

    const report = await page.evaluate((viewportWidth) => {
      const panel = document.querySelector('.nav__panel')
      const openTab = document.querySelector('.nav__link.is-open')
      if (!panel || !openTab) return null
      // The comp anchors a panel to the tab plate, which is wider than the label
      // and reaches down to the panel's own top edge. The plate is only drawn on
      // desktop, so the label stands in for it in the collapsed drawer.
      const plate = document.querySelector('.nav__tab')
      const plateBox = plate?.getBoundingClientRect()
      const panelBox = panel.getBoundingClientRect()
      const tabBox = plateBox?.width ? plateBox : openTab.getBoundingClientRect()
      const fullBleed = panel.classList.contains('nav__panel--logos')
      return {
        fullBleed,
        offsetFromTab: Math.round(panelBox.left - tabBox.left),
        gapUnderTab: Math.round(panelBox.top - tabBox.bottom),
        overflowRight: Math.round(Math.max(0, panelBox.right - viewportWidth)),
        overflowLeft: Math.round(Math.max(0, -panelBox.left)),
        narrowerThanTab: Math.round(Math.max(0, tabBox.width - panelBox.width)),
        documentOverflow: Math.round(
          Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        ),
        rows: panel.querySelectorAll('.nav__rows a').length,
        logos: panel.querySelectorAll('.logos__cell').length,
      }
    }, viewport.width)

    const issues = []
    if (!report) {
      issues.push('panel did not render')
    } else {
      if (report.documentOverflow > 2) issues.push(`document overflow ${report.documentOverflow}px`)
      if (report.overflowRight > 2) issues.push(`off-screen right ${report.overflowRight}px`)
      if (report.overflowLeft > 2) issues.push(`off-screen left ${report.overflowLeft}px`)
      if (viewport.desktop && !report.fullBleed) {
        if (Math.abs(report.offsetFromTab) > 2) {
          issues.push(`not anchored to its tab (${report.offsetFromTab}px off)`)
        }
        if (report.narrowerThanTab > 2) {
          issues.push(`narrower than its tab by ${report.narrowerThanTab}px`)
        }
        if (report.gapUnderTab !== 0) issues.push(`${report.gapUnderTab}px gap under the tab`)
      }
      if (report.rows === 0 && report.logos === 0) issues.push('panel has no links')
    }

    console.log(
      `${viewport.label.padEnd(13)} ${label.padEnd(28)} ${
        issues.length ? `FAIL — ${issues.join('; ')}` : 'ok'
      }`,
    )
    if (issues.length) problems.push(`${viewport.label} · ${label}: ${issues.join('; ')}`)

    // Toggling the same tab collapses only the panel; Escape would also close the
    // mobile drawer and hide the tabs still to be checked.
    await tab.click()
  }

  const collisions = await page.evaluate(() => {
    const overlaps = (a, b) =>
      a.left < b.right - 1 &&
      a.right > b.left + 1 &&
      a.top < b.bottom - 1 &&
      a.bottom > b.top + 1

    const links = [...document.querySelectorAll('.footer__col a')]
    const marks = [
      ['social row', '.footer__social'],
      ['language row', '.footer__locales'],
      ['disclaimer', '.footer__disclaimer'],
      ['project logo strip', '.footer .logos'],
      ['funders lockup', '.footer__funders'],
    ]

    const found = []
    for (const [name, selector] of marks) {
      const mark = document.querySelector(selector)
      if (!mark) continue
      const markBox = mark.getBoundingClientRect()
      for (const link of links) {
        if (overlaps(link.getBoundingClientRect(), markBox)) {
          found.push(`${name} over "${link.textContent?.trim()}"`)
        }
      }
    }
    return [...new Set(found)]
  })

  console.log(
    `${viewport.label.padEnd(13)} ${'footer'.padEnd(28)} ${
      collisions.length ? `FAIL — ${collisions.join('; ')}` : 'ok'
    }`,
  )
  if (collisions.length) problems.push(`${viewport.label} · footer: ${collisions.join('; ')}`)

  await context.close()
}

await browser.close()

if (problems.length) {
  console.log(`\n${problems.length} chrome problem(s)`)
  process.exitCode = 1
} else {
  console.log('\nAll header menus anchored and on-screen; no footer collisions.')
}
