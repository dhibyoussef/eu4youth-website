/**
 * Capture the places the narrow layout is reported to break, at one width.
 *
 * The full-page shots in tools/responsive.mjs prove nothing overflows the
 * document, which is a different question from whether each band reads. Anything
 * the comp placed by coordinate *inside* another element — a chevron inside a
 * button, a logo inside a nav panel — is not reached by a reset written in terms
 * of a band's children, and stays where the comp put it. That shows up only in the
 * band, so the bands are shot one at a time here.
 *
 * Usage: node tools/narrow.mjs [width] [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [width = '655', baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'narrow')
mkdirSync(OUT, { recursive: true })

const BANDS = [
  ['hero', '.band--hero'],
  ['chiffres', '.band--chiffres'],
  ['projets', '.band--projets'],
  ['map', '.band--map'],
  ['stories', '.band--stories'],
  ['publications', '.band--publications'],
  ['newsletter', '.band--newsletter'],
  ['footer', '.footer'],
]

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
})
page.on('pageerror', (error) => console.error('pageerror:', error.message))

// Cache-bust, because a stale plate in the browser looks exactly like a bug in the
// layout and there is no way to tell the two apart from a screenshot.
await page.goto(`${baseUrl}/?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)

for (const [name, selector] of BANDS) {
  const element = page.locator(selector).first()
  if ((await element.count()) === 0) {
    console.log(`${name.padEnd(13)} MISSING`)
    continue
  }
  await element.scrollIntoViewIfNeeded()
  await page.waitForTimeout(180)
  await element.screenshot({ path: join(OUT, `${width}-${name}.png`) })

  // Report anything inside the band still sitting outside it, which is the shape
  // the bug takes: an element the reset never reached, left at a 1920 coordinate.
  const escaped = await element.evaluate((band) => {
    const bounds = band.getBoundingClientRect()
    const out = []
    for (const node of band.querySelectorAll('*')) {
      const box = node.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) continue
      const over = Math.round(box.right - bounds.right)
      if (over > 2) out.push(`${node.className?.toString?.().slice(0, 30) || node.tagName}+${over}`)
    }
    return [...new Set(out)].slice(0, 4)
  })
  console.log(
    `${name.padEnd(13)} ${escaped.length ? 'ESCAPES: ' + escaped.join('  ') : 'contained'}`
  )
}

// The nav drawer, closed and with a logo panel open.
await page.evaluate(() => window.scrollTo(0, 0))
await page.click('.header__burger')
await page.waitForTimeout(300)
await page.screenshot({ path: join(OUT, `${width}-nav.png`) })

const projets = page.locator('.nav__link', { hasText: 'PROJETS' }).first()
if ((await projets.count()) > 0) {
  await projets.click()
  await page.waitForTimeout(350)
  await page.screenshot({ path: join(OUT, `${width}-nav-logos.png`) })
  const panel = await page.locator('.nav__panel--logos').first().evaluate((node) => {
    const box = node.getBoundingClientRect()
    const cells = [...node.querySelectorAll('.logos__cell')].map((cell) => {
      const c = cell.getBoundingClientRect()
      return `${Math.round(c.x)},${Math.round(c.y)} ${Math.round(c.width)}x${Math.round(c.height)}`
    })
    return { height: Math.round(box.height), cells: cells.slice(0, 3) }
  })
  console.log(`nav logo panel  height ${panel.height}px  first cells: ${panel.cells.join(' | ')}`)
}

console.log(`\nout -> ${OUT}`)
await browser.close()
