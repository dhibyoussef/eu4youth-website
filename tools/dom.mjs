/**
 * Dump the rendered box and first-line ink position of selected elements.
 *
 * Reports document-space coordinates so they can be compared straight against
 * the PDF geometry dumps, and flags any element still rendering in a fallback
 * face — a silent web-font failure otherwise looks like a layout bug.
 *
 * Usage: node tools/dom.mjs <baseUrl> <route> <selector> [selector...]
 */

import { chromium } from 'playwright'

const [baseUrl, route, ...selectors] = process.argv.slice(2)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.goto(baseUrl + route, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const rows = await page.evaluate((selectors) => {
  const out = []
  for (const selector of selectors) {
    const node = document.querySelector(selector)
    if (!node) {
      out.push({ selector, missing: true })
      continue
    }
    const box = node.getBoundingClientRect()
    const style = getComputedStyle(node)

    // Ink top of the first line, via the first text node's client rect.
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
    let lineTop = null
    let lineLeft = null
    let lineWidth = null
    const text = walker.nextNode()
    if (text) {
      const range = document.createRange()
      range.selectNodeContents(text)
      const line = range.getClientRects()[0]
      if (line) {
        lineTop = line.top + window.scrollY
        lineLeft = line.left + window.scrollX
        lineWidth = line.width
      }
    }

    out.push({
      selector,
      top: box.top + window.scrollY,
      left: box.left + window.scrollX,
      width: box.width,
      height: box.height,
      font: `${style.fontWeight} ${style.fontSize}/${style.lineHeight} ${style.fontFamily.split(',')[0]}`,
      tracking: style.letterSpacing,
      lineTop,
      lineLeft,
      lineWidth,
    })
  }
  return out
}, selectors)

const loaded = await page.evaluate(() =>
  [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`)
)
console.log('fonts loaded:', loaded.length ? loaded.join(', ') : 'NONE — falling back!')
console.log()

for (const row of rows) {
  if (row.missing) {
    console.log(`${row.selector}  -- not found`)
    continue
  }
  console.log(row.selector)
  console.log(`  box    top ${row.top.toFixed(1)}  left ${row.left.toFixed(1)}  ${row.width.toFixed(1)}x${row.height.toFixed(1)}`)
  console.log(`  line   top ${row.lineTop?.toFixed(1)}  left ${row.lineLeft?.toFixed(1)}  width ${row.lineWidth?.toFixed(1)}`)
  console.log(`  font   ${row.font}  tracking ${row.tracking}`)
}

await browser.close()
