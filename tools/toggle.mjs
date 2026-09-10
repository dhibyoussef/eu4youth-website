/**
 * Open an accordion row the way a person does, and report what that did to the page.
 *
 * A click is a mousedown, a little movement, and a mouseup. That matters here: opening a row
 * closes the one that was open, everything below jumps, and the pointer ends up over different
 * content than it started on — which the browser can read as a drag. So this drags by a few
 * pixels on purpose, then reports any selection it left behind and how far the row moved.
 *
 * Usage: node tools/toggle.mjs ROW [OUT] [width]
 */

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const [row = '4', out = 'toggle', width = '1440'] = process.argv.slice(2)

await mkdir('tools/out', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 1000 },
  deviceScaleFactor: 2,
})
await page.goto(`http://localhost:3010/programme/a-propos?t=${Date.now()}`, {
  waitUntil: 'networkidle',
})
await page.evaluate(() => document.fonts.ready)

const heads = page.locator('.ap-avenir .disclosure__head')
const head = heads.nth(Number(row) - 1)
await head.scrollIntoViewIfNeeded()
await page.waitForTimeout(200)

const before = await head.evaluate((node) => node.getBoundingClientRect().top)

// A click, spelled out, with the drag a hand makes.
const box = await head.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
await page.mouse.move(box.x + box.width / 2 + 4, box.y + box.height / 2 + 3, { steps: 3 })
await page.mouse.up()
await page.waitForTimeout(250)

const after = await head.evaluate((node) => node.getBoundingClientRect().top)
const selected = await page.evaluate(() => window.getSelection().toString().replace(/\s+/g, ' '))

console.log(`row ${row} moved ${(after - before).toFixed(0)}px in the viewport`)
console.log(selected ? `selected: "${selected.slice(0, 90)}"` : 'selected: nothing')

const clip = await page.evaluate(() => {
  const band = document.querySelector('.ap-avenir').getBoundingClientRect()
  return {
    x: 0,
    y: Math.max(0, band.top + window.scrollY),
    width: Math.min(900, band.width),
    height: Math.min(620, band.height),
  }
})
await page.screenshot({ path: `tools/out/${out}.png`, clip, fullPage: true })
console.log(`tools/out/${out}.png`)

await browser.close()
