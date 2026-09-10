/**
 * Shoot a rows dropdown with each of its rows pointed at, plus nothing pointed at.
 *
 * The comps draw these menus with their first row highlighted, which is the hover
 * state and not a fixed one, so the build can only be checked against them by
 * hovering the row they drew — and checked for consistency by hovering the rest.
 *
 * Usage: node tools/menu.mjs [label] [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [label = 'ACTUALITÉS', baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'menu')
mkdirSync(OUT, { recursive: true })

const slug = label.toLowerCase().replace(/[^a-z]+/g, '') || 'menu'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 900 } })
page.on('pageerror', (error) => console.error('pageerror:', error.message))

await page.goto(baseUrl + '/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

await page.locator('.nav__link', { hasText: label }).first().hover()
await page.waitForTimeout(250)

const panel = page.locator('.nav__panel--rows')
const box = await panel.boundingBox()
console.log(`panel  y ${box.y.toFixed(1)}  h ${box.height.toFixed(1)}  x ${box.x.toFixed(1)}  w ${box.width.toFixed(1)}`)

const clip = {
  x: Math.max(0, box.x - 90),
  y: 127,
  width: Math.min(1920, box.width + 180),
  height: box.y + box.height + 30 - 127,
}

await page.screenshot({ path: join(OUT, `${slug}-none.png`), clip })

const rows = panel.locator('a')
const count = await rows.count()
for (let index = 0; index < count; index += 1) {
  await rows.nth(index).hover()
  await page.waitForTimeout(220)
  await page.screenshot({ path: join(OUT, `${slug}-row${index + 1}.png`), clip })
}

console.log(`${count} rows -> ${OUT}`)
await browser.close()
