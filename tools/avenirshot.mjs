/**
 * Photograph the avenir band, and report where the signpost sits inside it.
 *
 * The art is placed by its foot at the band's bottom seam, so the numbers that matter are its
 * own box and the gap to each edge of the band — a crop that cuts the post shows up here as a
 * bottom gap, and one carrying empty band shows up as a right gap.
 *
 * Usage: node tools/avenirshot.mjs [width] [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [width = '1920', baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'avenir')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 1100 },
  deviceScaleFactor: 1,
})
await page.goto(`${baseUrl}/programme/a-propos?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const band = page.locator('.ap-avenir')
await band.scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
await band.screenshot({ path: join(OUT, 'avenir.png') })

const box = await page.evaluate(() => {
  const band = document.querySelector('.ap-avenir').getBoundingClientRect()
  const art = document.querySelector('.ap-avenir__art')
  const rect = art.getBoundingClientRect()
  return {
    band: { w: Math.round(band.width), h: Math.round(band.height) },
    art: { w: Math.round(rect.width), h: Math.round(rect.height) },
    natural: { w: art.naturalWidth, h: art.naturalHeight },
    top: Math.round(rect.top - band.top),
    bottom: Math.round(band.bottom - rect.bottom),
    right: Math.round(band.right - rect.right),
  }
})
console.log(`band ${box.band.w}x${box.band.h}   comp 1920x1327`)
console.log(`art  ${box.art.w}x${box.art.h}  (asset ${box.natural.w}x${box.natural.h})  comp 602x985`)
console.log(`gaps top ${box.top} (comp 342)  bottom ${box.bottom} (comp 0)  right ${box.right} (comp 23)`)

// The last row open, since the band grows and the post must stay planted in the seam.
await page.locator('.ap-avenir .disclosure__head').last().click()
await page.waitForTimeout(320)
await band.screenshot({ path: join(OUT, 'avenir-open.png') })
const open = await page.evaluate(() => {
  const band = document.querySelector('.ap-avenir').getBoundingClientRect()
  const rect = document.querySelector('.ap-avenir__art').getBoundingClientRect()
  return { h: Math.round(band.height), bottom: Math.round(band.bottom - rect.bottom) }
})
console.log(`open row: band ${open.h} tall, art still ${open.bottom} above the seam`)

console.log(`\nout -> ${OUT}`)
await browser.close()
