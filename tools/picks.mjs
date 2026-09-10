/**
 * Report the six project marks in the map card: which art each is showing, whether it decoded,
 * and the box it occupies in comp px.
 *
 * Usage: node tools/picks.mjs [width]
 */

import { chromium } from 'playwright'

const [width = '1440'] = process.argv.slice(2)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: Number(width), height: 1000 } })
await page.goto(`http://localhost:3010/programme/a-propos?t=${Date.now()}`, {
  waitUntil: 'networkidle',
})
await page.evaluate(() => document.fonts.ready)
await page.locator('.ap-map').scrollIntoViewIfNeeded()
await page.waitForTimeout(250)

const rows = await page.evaluate(() => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const comp = (v) => Math.round((v / rem) * 10)
  const card = document.querySelector('.ap-map').getBoundingClientRect()

  return [...document.querySelectorAll('.ap-map__picks img')].map((img) => {
    const r = img.getBoundingClientRect()
    return {
      src: img.currentSrc.split('/').pop(),
      decoded: img.naturalWidth ? `${img.naturalWidth}x${img.naturalHeight}` : 'FAILED',
      top: comp(r.top - card.top),
      w: comp(r.width),
      h: comp(r.height),
    }
  })
})

for (const r of rows) {
  console.log(
    `${r.src.padEnd(26)} art ${r.decoded.padEnd(10)} ` +
      `y ${String(r.top).padStart(5)}  ${r.w}x${r.h}`
  )
}

await browser.close()
