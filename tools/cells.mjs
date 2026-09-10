/**
 * Report the footer logo strip's cells and their artwork, to find what is overlapping.
 *
 * Usage: node tools/cells.mjs [width] [path]
 */

import { chromium } from 'playwright'

const [width = '900', path = '/'] = process.argv.slice(2)

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
})
await page.goto(`http://localhost:3010${path}?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.locator('footer.footer').scrollIntoViewIfNeeded()
await page.waitForTimeout(400)

console.log(
  await page.evaluate(() => {
    const list = document.querySelector('footer .logos')
    const cs = getComputedStyle(list)
    const lines = [
      `ul.logos display ${cs.display}  cols ${cs.gridTemplateColumns}  gap ${cs.gap}`,
      '',
    ]
    for (const li of list.children) {
      const cell = li.querySelector('a')
      const lb = li.getBoundingClientRect()
      const cb = cell.getBoundingClientRect()
      const img = cell.querySelector('img')
      const ib = img.getBoundingClientRect()
      const ics = getComputedStyle(img)
      lines.push(
        `li ${Math.round(lb.left)},${Math.round(lb.top)} ${Math.round(lb.width)}x${Math.round(
          lb.height
        )}   a ${Math.round(cb.width)}x${Math.round(cb.height)} ${getComputedStyle(cell).position}` +
          `   img ${Math.round(ib.width)}x${Math.round(ib.height)} ${ics.position} fit=${
            ics.objectFit
          }`
      )
    }
    return lines.join('\n')
  })
)
await browser.close()
