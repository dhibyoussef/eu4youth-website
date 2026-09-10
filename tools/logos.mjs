/**
 * Shoot the six-logo strip at rest and with each logo pointed at.
 *
 * The strip is the one place where the comp shows two states at once — five grey
 * watermarks and one in colour — so the reveal has to be checked against the
 * coloured one rather than against the band as printed.
 *
 * Usage: node tools/logos.mjs [width] [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [width = '1920', baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'logos')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
})
page.on('pageerror', (error) => console.error('pageerror:', error.message))

await page.goto(baseUrl + '/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// Only the band's strip is in the DOM here: the dropdown's is rendered on open.
const cells = page.locator('.logos__cell')
const count = await cells.count()
console.log(`${count} cells`)

await cells.first().scrollIntoViewIfNeeded()
await page.mouse.move(2, 2)
await page.waitForTimeout(300)

// Clamp to the viewport: the cells are positioned against the band, so scrolling
// one into view says nothing about where the tallest of them ends up.
const boxes = []
for (let index = 0; index < count; index += 1) {
  boxes.push(await cells.nth(index).boundingBox())
}
const left = Math.max(0, Math.min(...boxes.map((b) => b.x)) - 10)
const top = Math.max(0, Math.min(...boxes.map((b) => b.y)) - 10)
const right = Math.min(Number(width), Math.max(...boxes.map((b) => b.x + b.width)) + 10)
const bottom = Math.min(900, Math.max(...boxes.map((b) => b.y + b.height)) + 10)
const clip = { x: left, y: top, width: right - left, height: bottom - top }
console.log('clip', clip)

await page.screenshot({ path: join(OUT, `${width}-rest.png`), clip })

for (let index = 0; index < count; index += 1) {
  await cells.nth(index).hover()
  await page.waitForTimeout(280)
  await page.screenshot({ path: join(OUT, `${width}-hover-${index + 1}.png`), clip })
}

console.log(`out -> ${OUT}`)
await browser.close()
