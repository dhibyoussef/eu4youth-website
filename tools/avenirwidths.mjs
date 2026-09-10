/**
 * The avenir band at several window widths.
 *
 * The design width is exact, but the signpost is placed at the comp's coordinates in rem and
 * nothing in the narrow rules touches it — so this is where a band that is right at 1920 can
 * still come out with the art oversized, low, or off the edge.
 *
 * Usage: node tools/avenirwidths.mjs [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'avenir')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

for (const width of [1920, 1440, 1280, 1100, 1024, 820, 600, 390]) {
  const page = await browser.newPage({
    viewport: { width, height: 1000 },
    deviceScaleFactor: 1,
  })
  await page.goto(`${baseUrl}/programme/a-propos?t=${Date.now()}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  const band = page.locator('.ap-avenir')
  await band.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await band.screenshot({ path: join(OUT, `w${width}.png`) })

  const box = await page.evaluate(() => {
    const band = document.querySelector('.ap-avenir').getBoundingClientRect()
    const art = document.querySelector('.ap-avenir__art').getBoundingClientRect()
    const rows = document.querySelector('.ap-avenir .disclosure')?.getBoundingClientRect()
    return {
      band: { w: band.width, h: band.height },
      art: { w: art.width, h: art.height },
      top: art.top - band.top,
      bottom: band.bottom - art.bottom,
      right: band.right - art.right,
      // Does the art land on the accordion, and does it leave the band?
      overRows: rows ? Math.max(0, rows.right - art.left) : 0,
      overflowRight: Math.max(0, art.right - band.right),
    }
  })

  const share = ((box.art.w / box.band.w) * 100).toFixed(1)
  console.log(
    `${String(width).padStart(4)}  band ${Math.round(box.band.w)}x${Math.round(box.band.h)}` +
      `  art ${Math.round(box.art.w)}x${Math.round(box.art.h)} (${share}% of band)` +
      `  top ${Math.round(box.top)}  bottom ${Math.round(box.bottom)}  right ${Math.round(box.right)}` +
      (box.overRows > 0 ? `  OVER ROWS ${Math.round(box.overRows)}px` : '') +
      (box.overflowRight > 0 ? `  OFF EDGE ${Math.round(box.overflowRight)}px` : '')
  )
  await page.close()
}

console.log(`\nout -> ${OUT}`)
await browser.close()
