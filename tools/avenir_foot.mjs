/**
 * Shoot the avenir band against the footer, with every accordion row closed — that is the
 * state that used to spill the signpost into the footer.
 *
 * Usage: node tools/avenir_foot.mjs [OUT] [width]
 */

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const [out = 'avenir-foot', width = '1440'] = process.argv.slice(2)

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

// Close whatever row Disclosure opens by default (index 0 for avenir).
const open = page.locator('.ap-avenir .disclosure__row--open .disclosure__head')
if (await open.count()) {
  await open.first().click()
  await page.waitForTimeout(200)
}

const clip = await page.evaluate(() => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const band = document.querySelector('.ap-avenir')
  const foot = document.querySelector('footer.footer')
  const art = document.querySelector('.ap-avenir__art')
  const br = band.getBoundingClientRect()
  const fr = foot.getBoundingClientRect()
  const ar = art.getBoundingClientRect()
  const report = {
    bandH: Math.round((br.height / rem) * 10),
    artBottom: Math.round(((ar.bottom - br.top) / rem) * 10),
    gapToFoot: Math.round(fr.top - ar.bottom),
    bandToFoot: Math.round(fr.top - br.bottom),
  }
  return {
    report,
    clip: {
      x: 0,
      y: Math.max(0, br.top + window.scrollY),
      width: br.width,
      height: Math.min(br.height + 120, fr.bottom - br.top + window.scrollY),
    },
  }
})

console.log(JSON.stringify(clip.report))
await page.screenshot({
  path: `tools/out/${out}.png`,
  clip: {
    x: clip.clip.x,
    y: clip.clip.y,
    width: Math.min(clip.clip.width, Number(width)),
    height: Math.min(900, clip.clip.height),
  },
  fullPage: true,
})
console.log(`tools/out/${out}.png`)
await browser.close()
