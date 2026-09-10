/**
 * Capture the area around a band's top edge, to compare a seam against the comp.
 *
 * Bands meet in places the comp treats as one composition — artwork hanging across the join —
 * so checking one band at a time hides exactly the thing that is wrong. Offsets are in comp px
 * so they can be read straight off the PDF.
 *
 * Usage: node tools/seamshot.mjs SELECTOR ABOVE BELOW [LEFT_FROM_RIGHT] [OUT] [width]
 */

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const [
  selector,
  above = '400',
  below = '400',
  fromRight = '600',
  out = 'seam',
  width = '1440',
] = process.argv.slice(2)

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

// Walk the page so anything lazy has decoded.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 700) {
    window.scrollTo(0, y)
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)))
  }
  window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 300))
})

const clip = await page.evaluate(
  ([sel, up, down, left]) => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const px = (comp) => (comp / 10) * rem
    const node = document.querySelector(sel)
    if (!node) return null
    const box = node.getBoundingClientRect()
    const top = box.top + window.scrollY - px(Number(up))
    return {
      x: Math.max(0, box.right - px(Number(left))),
      y: Math.max(0, top),
      width: Math.min(px(Number(left)), box.right),
      height: px(Number(up) + Number(down)),
    }
  },
  [selector, above, below, fromRight]
)

if (!clip) {
  console.error(`no ${selector}`)
  process.exit(1)
}

await page.screenshot({ path: `tools/out/${out}.png`, clip, fullPage: true })
console.log(
  `tools/out/${out}.png  ${Math.round(clip.width)}x${Math.round(clip.height)} css px` +
    `  (${above} comp px above ${selector}, ${below} below)`
)
await browser.close()
