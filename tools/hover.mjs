/**
 * Rest / hover pairs for one control, at a chosen viewport width.
 *
 * states.mjs shoots at the design's own 1920 width, where the printed plate and
 * the live control land on whole pixels. Most of the reported trouble shows up
 * at other widths, because the page scales by `100vw / 192` and the plate is a
 * scaled bitmap while the control is scaled geometry — so any disagreement
 * between them turns into a visible edge only off-grid.
 *
 * Usage: node tools/hover.mjs [width] [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [width = '1920', baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'hover')
mkdirSync(OUT, { recursive: true })

const TARGETS = [
  ['hero-1', '.hero__btn:nth-of-type(1)'],
  ['hero-2', '.hero__btn:nth-of-type(2)'],
  ['hero-3', '.hero__btn:nth-of-type(3)'],
  ['map', '.map__btn'],
  ['stories', '.stories__btn'],
  ['pubs', '.pubs__btn'],
  ['cta', '.stream__cta'],
  ['card', '.card__btn'],
  ['news', '.news__form button'],
]

const PAD = 18

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
})
page.on('pageerror', (error) => console.error('pageerror:', error.message))

await page.goto(baseUrl + '/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

for (const [name, selector] of TARGETS) {
  const element = page.locator(selector).first()
  if ((await element.count()) === 0) {
    console.log(`${name.padEnd(8)} MISSING  ${selector}`)
    continue
  }

  await element.scrollIntoViewIfNeeded()
  await page.mouse.move(2, 2)
  await page.waitForTimeout(260)

  const box = await element.boundingBox()
  const clip = {
    x: Math.max(0, box.x - PAD),
    y: Math.max(0, box.y - PAD),
    width: Math.min(Number(width) - Math.max(0, box.x - PAD), box.width + PAD * 2),
    height: box.height + PAD * 2,
  }

  await page.screenshot({ path: join(OUT, `${width}-${name}-rest.png`), clip })
  await element.hover()
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(OUT, `${width}-${name}-hover.png`), clip })

  console.log(
    `${name.padEnd(8)} ${Math.round(box.width)}x${Math.round(box.height)} at ${Math.round(
      box.x
    )},${Math.round(box.y)}`
  )
}

console.log(`\nout -> ${OUT}`)
await browser.close()
