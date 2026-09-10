/**
 * Screenshot one element, and report its box in comp px so it can be checked against the PDF.
 *
 * Usage: node tools/shot.mjs SELECTOR [OUT] [width] [path]
 */

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const [
  selector,
  out = 'shot',
  width = '1440',
  route = '/programme/a-propos',
] = process.argv.slice(2)

await mkdir('tools/out', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 1000 },
  deviceScaleFactor: 2,
})
await page.goto(`http://localhost:3010${route}?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const node = page.locator(selector).first()
await node.scrollIntoViewIfNeeded()
await page.waitForTimeout(250)

const box = await page.evaluate((sel) => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const el = document.querySelector(sel)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const comp = (v) => Math.round((v / rem) * 10)
  return { w: comp(r.width), h: comp(r.height) }
}, selector)

if (!box) {
  console.error(`no ${selector}`)
  process.exit(1)
}

await node.screenshot({ path: `tools/out/${out}.png` })
console.log(`tools/out/${out}.png  ${selector} is ${box.w}x${box.h} comp px`)

await browser.close()
