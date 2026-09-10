/**
 * Full-page shots at the widths the design has to survive, plus a report of
 * anything that overflows.
 *
 * The design is a 1920 canvas placed by coordinate, so the failure mode when it
 * reflows is not ugliness but overflow: an element that kept a measured width
 * pushes the document wider than the viewport and the whole page gains a
 * horizontal scrollbar. That is invisible in a screenshot of the top of the page,
 * so it is measured here rather than looked for.
 *
 * Usage: node tools/responsive.mjs [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'responsive')
mkdirSync(OUT, { recursive: true })

const WIDTHS = [390, 600, 768, 1024, 1280]

const browser = await chromium.launch()

for (const width of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(baseUrl + '/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)

  const report = await page.evaluate((viewportWidth) => {
    const doc = document.documentElement
    const offenders = []
    for (const node of document.querySelectorAll('body *')) {
      const box = node.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) continue
      const over = box.right - viewportWidth
      if (over > 1.5) {
        /* An SVG element's className is an SVGAnimatedString, whose toString is
           "[object SVGAnimatedString]" — which named every offender inside the map the
           same unhelpful thing. getAttribute reads the same list off both kinds. */
        const classes = node.getAttribute('class')
        offenders.push({
          what: `${node.tagName.toLowerCase()}${classes ? `.${classes.trim().split(/\s+/).join('.')}` : ''}`.slice(0, 60),
          over: Math.round(over),
        })
      }
    }
    // Widest offenders first, and only one entry per class so a repeated card
    // does not fill the report.
    const seen = new Set()
    const worst = offenders
      .sort((a, b) => b.over - a.over)
      .filter((entry) => !seen.has(entry.what) && seen.add(entry.what))
      .slice(0, 6)
    return {
      scrollWidth: doc.scrollWidth,
      height: doc.scrollHeight,
      root: getComputedStyle(doc).fontSize,
      worst,
    }
  }, width)

  await page.screenshot({ path: join(OUT, `${width}.png`), fullPage: true })

  const overflow = report.scrollWidth - width
  console.log(
    `${String(width).padStart(4)}px  root ${report.root.padEnd(7)}` +
      `page ${String(report.height).padStart(6)}px tall  ` +
      (overflow > 1 ? `OVERFLOWS by ${overflow}px` : 'no overflow')
  )
  for (const entry of report.worst) {
    console.log(`        +${String(entry.over).padStart(4)}px  ${entry.what}`)
  }
  for (const message of errors) console.log(`        pageerror: ${message}`)

  await page.close()
}

console.log(`\nout -> ${OUT}`)
await browser.close()
