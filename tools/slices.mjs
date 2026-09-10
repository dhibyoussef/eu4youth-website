/**
 * Capture a page as viewport-sized slices, the way it is actually read.
 *
 * A full-page screenshot flattens sticky chrome and lazy images and shows a shape nobody
 * sees; scrolling a window's height at a time shows what the visitor gets.
 *
 * Usage: node tools/slices.mjs [width] [path] [outPrefix]
 */

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const [width = '1024', path = '/programme/a-propos', prefix = 'slice'] = process.argv.slice(2)
const height = 900
const out = 'tools/out/slices'
await mkdir(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height },
  deviceScaleFactor: 1,
})
await page.goto(`http://localhost:3010${path}?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// Walk the page once so anything lazy has decoded before the first slice is taken.
const total = await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y)
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 40)))
  }
  window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 250))
  return document.body.scrollHeight
})

const count = Math.ceil(total / height)
for (let i = 0; i < count; i += 1) {
  await page.evaluate((y) => window.scrollTo(0, y), i * height)
  await page.waitForTimeout(180)
  await page.screenshot({ path: `${out}/${prefix}-${String(i).padStart(2, '0')}.png` })
}

console.log(`${count} slices of ${width}x${height}, page ${total}px tall -> ${out}/${prefix}-*.png`)
await browser.close()
